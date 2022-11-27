const { isDevelopment } = require("../config/server.config");
const connection = require("../database/connection");
const CustomError = require("../utils/errors");
const FieldRewriter = require("../utils/field-rewriter");
const Model = require("./Model");
const { SqliteError } = require("better-sqlite3");

class UserStatus extends Model {

    static _tablename_ = 'UserStatus';
    static _filterable_ = [ 'id', 'name', 'description' ];
    static _sortable_ = [ 'id', 'name', 'description', 'createdAt' ];

    #props = {
        id: undefined,
        name: undefined,
        description: undefined,
        createdAt: undefined,
        deletedAt: undefined
    };

    static fieldRewriter = new FieldRewriter({
        id: `${UserStatus._tablename_}.id as ${UserStatus._tablename_}_id`,
        name: `${UserStatus._tablename_}.name as ${UserStatus._tablename_}_name`,
        description: `${UserStatus._tablename_}.description as ${UserStatus._tablename_}_description`,
        createdAt: `${UserStatus._tablename_}.createdAt as ${UserStatus._tablename_}_createdAt`
    });

    get id() { return this.#props.id; }
    get name() { return this.#props.name; }
    get description() { return this.#props.description; }
    get createdAt() { return this.#props.createdAt; }
    get deletedAt() { return this.#props.deletedAt; }

    _fromDB(obj) {
        if(typeof(obj) !== 'object')
            throw new TypeError("'obj' must be object type");
        this.#props = {
            id: obj[`${UserStatus._tablename_}_id`],
            name: obj[`${UserStatus._tablename_}_name`],
            description: obj[`${UserStatus._tablename_}_description`],
            createdAt: obj[`${UserStatus._tablename_}_createdAt`]
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
            var [{count}] = await connection(UserStatus._tablename_)
                .whereRaw(where.statement, where.params)
                .count({ count: 'id' });
            res = count;
        } catch(err) {
            if(isDevelopment) console.log(err);
            if(err instanceof CustomError)
                throw err;
            else if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
        }
        return res;
    }

    static async getAll(config = {}) {
        var res = [];
        try {
            const { limit, offset, where, orderBy } = this._prepareQueryConfig(config);
            var data = await connection('UserStatus')
                .select(UserStatus.fieldRewriter.all())
                .whereRaw(where.statement, where.params)
                .orderBy(orderBy)
                .limit(limit)
                .offset(offset);
            res = Array.from(data).map(e => (new UserStatus)._fromDB(e));
        } catch(err) {
            if(isDevelopment) console.log(err);
            if(err instanceof CustomError)
                throw err;
            else if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
        }
        return res;
    }

    static async get(id) {
        var res;
        try {
            var data = await connection('UserStatus')
                .select(UserStatus.fieldRewriter.all())
                .where({ id })
                .first();
            if(data)
                res = (new UserStatus)._fromDB(data);
        } catch(err) {
            if(isDevelopment) console.log(err);
            if(err instanceof CustomError)
                throw err;
            else if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
        }
        return res;
    }

}

module.exports = {
    UserStatus
};