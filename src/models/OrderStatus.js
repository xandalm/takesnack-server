const { isDevelopment } = require("../config/server.config");
const connection = require("../database/connection");
const CustomError = require("../utils/errors");
const FieldRewriter = require("../utils/field-rewriter");
const Model = require("./Model");
const { SqliteError } = require("better-sqlite3");

class OrderStatus extends Model {

    static IN_QUEUE = 1;
    static PROVIDING = 2;
    static READY = 3;
    static IN_DELIVERY = 4;
    static DELIVERED = 5;
    static PAID_OUT = 6;

    static _tablename_ = 'OrderStatus';
    static _filterable_ = [ 'id', 'name', 'description' ];
    static _sortable_ = [ 'id', 'name', 'description', 'createdAt' ];

    static fieldRewriter = new FieldRewriter();

    static {
        this.fieldRewriter.add('id', `${this._tablename_}.id`,`${OrderStatus._tablename_}_id`);
        this.fieldRewriter.add('name', `${this._tablename_}.name`,`${OrderStatus._tablename_}_name`);
        this.fieldRewriter.add('description', `${this._tablename_}.description`,`${OrderStatus._tablename_}_description`);
        this.fieldRewriter.add('createdAt', `${this._tablename_}.createdAt`,`${OrderStatus._tablename_}_createdAt`);
    }

    #props = {
        id: undefined,
        name: undefined,
        description: undefined,
        createdAt: undefined,
        deletedAt: undefined
    };

    get id() { return this.#props.id; }
    get name() { return this.#props.name; }
    get description() { return this.#props.description; }
    get createdAt() { return this.#props.createdAt; }
    get deletedAt() { return this.#props.deletedAt; }

    _fromDB(obj) {
        // if it doesn't have id then it doesn't exist, so it's null
        if(obj == undefined || obj[`${OrderStatus._tablename_}_id`] == undefined)
            return null;
        this.#props = {
            id: obj[`${OrderStatus._tablename_}_id`],
            name: obj[`${OrderStatus._tablename_}_name`],
            description: obj[`${OrderStatus._tablename_}_description`],
            createdAt: obj[`${OrderStatus._tablename_}_createdAt`]
        };
        this.#props.createdAt = this.createdAt? new Date(this.createdAt): this.createdAt;
        return this;
    }

    toJSON() {
        return {
            ...this.#props
        }
    }

    static async count(condition) {
        var res;
        try {
            const { where } = this._prepareQueryConfig({ condition });
            var [{count}] = await connection(this._tablename_)
                .whereRaw(where.statement, where.params)
                .count({ count: 'id' });
            res = count;
        } catch(err) {
            if(isDevelopment) console.log(err);
            if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
            else
                throw err;
        }
        return res;
    }

    static async getAll(config = {}) {
        var res = [];
        try {
            const { limit, offset, where, orderBy } = this._prepareQueryConfig(config);
            var data = await connection(this._tablename_)
                .select(this.fieldRewriter.transform.all())
                .whereRaw(where.statement, where.params)
                .orderBy(orderBy)
                .limit(limit)
                .offset(offset);
            res = Array.from(data).map(e => (new OrderStatus)._fromDB(e));
        } catch(err) {
            if(isDevelopment) console.log(err);
            if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
            else
                throw err;
        }
        return res;
    }

    static async get(id) {
        var res;
        try {
            var data = await connection(this._tablename_)
                .select(this.fieldRewriter.transform.all())
                .where({ id })
                .first();
            if(data)
                res = (new OrderStatus)._fromDB(data);
        } catch(err) {
            if(isDevelopment) console.log(err);
            if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
            else
                throw err;
        }
        return res;
    }

    async next() {
        var id;
        switch(this.id) {
            case OrderStatus.IN_QUEUE: id = OrderStatus.PROVIDING; break;
            case OrderStatus.PROVIDING: id = OrderStatus.READY; break;
            case OrderStatus.READY: id = OrderStatus.IN_DELIVERY; break;
            case OrderStatus.IN_DELIVERY: id = OrderStatus.DELIVERED; break;
            case OrderStatus.DELIVERED: id = OrderStatus.PAID_OUT; break;
            case OrderStatus.PAID_OUT: throw new CustomError("Reached the last status");
        }
        return await OrderStatus.get(id);
    }

}

module.exports = {
    OrderStatus
};