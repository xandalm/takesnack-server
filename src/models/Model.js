const util = require('util');
const { LogicalCondition, RelationalCondition, Condition, RelationalOperatorEqual, RelationalOperatorStartWith, RelationalOperatorEndWith, RelationalOperatorContains } = require('../utils/condition');
const CustomError = require('../utils/errors');
const { OrderBy } = require('../utils/order');
const { DatePattern } = require('../utils/regexp-patterns');
const { parseToSafeInteger } = require('../utils/util');

class Model {

    [util.inspect.custom](depth, opts) {
        return this.toJSON();
    }

    _fromDB() {
        throw new Error("This method must be implemented");
    }

    toJSON() {
        throw new Error("This method must be implemented");
    }

    /**
     * Get SQLite statement and param from condition.
     * @param {Condition} condition 
     * @returns {Object}
     */
     _getConditionStatement(condition) {
        var { field, operator, value} = condition;
        if(value instanceof Date)
            value = value.toISOString();
        if(['createdAt','updatedAt','deletedAt'].includes(field) && !DatePattern.test(value)) {
            throw `Invalid '${value}' value to '${field}' field.`;
        }
        if((/^(null|undefined)$/i).test(value))
            value = null;
        else if((/^({null}|{undefined})$/i).test(value))
            value = value.substring(1,value.length-1);
        if(operator instanceof RelationalOperatorEqual) {
            if(value == null) {
                operator = ' IS ';
            } else 
                operator = ' = ';
        }
        else if(operator instanceof RelationalOperatorStartWith){
            operator = ` LIKE `; 
            value = `${value}%`;
        }
        else if(operator instanceof RelationalOperatorEndWith) {
            operator = ' LIKE ';
            value = `%${value}`;
        }
        else if(operator instanceof RelationalOperatorContains) {
            operator = ' LIKE ';
            value = `%${value}%`;
        }
        else {
            operator = ` ${operator.toString()} `;
        }
        return {statement: `${field}${operator}?`, param: value};
    }

    /**
     * Parse Condition to SQL representations for 'where' statement.
     * Will consider '_filterable_' static attribute of the instantiated class name (inheritors).
     * @param {Condition} condition
     * @returns 
     */
    _prepareCondition(condition) {
        // throw `Invalid '${e.field}' field to apply filter`;
        var statement = '', params = [], queue = [];
        queue.push(condition);
        while(queue.length > 0) {
            condition = queue.shift();
            if(condition instanceof LogicalCondition) {
                queue.unshift(')');
                for (let i = condition.subconditions.length-1; i > 0; i--) {
                    queue.unshift(condition.subconditions[i]);
                    queue.unshift(` ${condition.operator} `);
                }
                queue.unshift(condition.subconditions[0]);
                queue.unshift('(');
            } else if(condition instanceof RelationalCondition) {
                if(this.constructor._filterable_.includes(condition.field)){
                    let parsed = this._getConditionStatement(condition);
                    statement = `${statement}${parsed.statement}`;
                    params.push(parsed.param);
                } else
                    throw new CustomError(`Cannot filter ${condition.field} field`);
            } else
                statement = `${statement}${condition}`;
        }
        return {statement, params};
    }

    /**
     * Parse OrderBy to SQL representations for 'order by' statement.
     * Will consider '_filterable_' static attribute of the instantiated class name (inheritors).
     * @param {OrderBy} orderBy
     * @returns 
     */
    _prepareOrder(orderBy) {
        if(this.constructor._sortable_.includes(orderBy?.field)) {
            return { column: orderBy.field, order: orderBy.order.toString() };
            // return `${orderBy.field} ${orderBy.order}`;
        }
        throw new CustomError(`Cannot order by ${orderBy.field} field`);
    }

    _prepareQueryConfig(config) {
        var where, order;
        const page = config.page==undefined? 1: parseToSafeInteger(config.page);
        const limit = config.limit==undefined? 20: parseToSafeInteger(config.limit);
        const offset = (page - 1) * limit;
        const condition = config.condition;
        const orderBy = config.orderBy;
        if(condition == undefined)
            where = { statement: '', params: [] };
        else {
            if(condition instanceof Condition)
                where = this._prepareCondition(condition);
            else
                throw new TypeError("Expected condition to be Condition type");
        }
        if(orderBy == undefined) {
            order = [];
            // order = '';
        } else {
            if(orderBy instanceof OrderBy)
                order = [ this._prepareOrder(orderBy) ];
                // order = this._prepareOrder(orderBy);
            else if(Array.isArray(orderBy)) {
                for (const o of orderBy) {
                    if(!o instanceof OrderBy)
                        throw new TypeError("Expected orderBy to be OrderBy or Array<OrderBy> types");
                    else {
                        order = (order??[]).concat([ this._prepareOrder(o) ]);
                        // order = `${order}, ${this._prepareOrder(o)}`;
                    }
                }
            }
            else
                throw new TypeError("Expected orderBy to be OrderBy or Array<OrderBy> types");
        }
        return { page, limit, offset, where, orderBy: order };
    }
    
}

module.exports = Model;
