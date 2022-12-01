const { isDevelopment } = require("../config/server.config");
const connection = require("../database/connection");
const CustomError = require("../utils/errors");
const FieldRewriter = require("../utils/field-rewriter");
const Model = require("./Model");
const { SqliteError } = require("better-sqlite3");

class CustomerStatus extends Model {

    static _tablename_ = 'CustomerStatus';
    static _filterable_ = [ 'id', 'name', 'description' ];
    static _sortable_ = [ 'id', 'name', 'description', 'createdAt' ];

    static fieldRewriter = new FieldRewriter();

    static {
        this.fieldRewriter.add('id', `${this._tablename_}.id`,`${CustomerStatus._tablename_}_id`);
        this.fieldRewriter.add('name', `${this._tablename_}.name`,`${CustomerStatus._tablename_}_name`);
        this.fieldRewriter.add('description', `${this._tablename_}.description`,`${CustomerStatus._tablename_}_description`);
        this.fieldRewriter.add('createdAt', `${this._tablename_}.createdAt`,`${CustomerStatus._tablename_}_createdAt`);
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
        if(obj == undefined || obj[`${CustomerStatus._tablename_}_id`] == undefined)
            return null;
        this.#props = {
            id: obj[`${CustomerStatus._tablename_}_id`],
            name: obj[`${CustomerStatus._tablename_}_name`],
            description: obj[`${CustomerStatus._tablename_}_description`],
            createdAt: obj[`${CustomerStatus._tablename_}_createdAt`]
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
            res = Array.from(data).map(e => (new CustomerStatus)._fromDB(e));
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
                res = (new CustomerStatus)._fromDB(data);
        } catch(err) {
            if(isDevelopment) console.log(err);
            if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
            else
                throw err;
        }
        return res;
    }

}

module.exports = {
    CustomerStatus
};