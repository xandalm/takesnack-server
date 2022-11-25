const { isDevelopment } = require("../config/server.config");
const connection = require("../database/connection");
const CustomError = require("../utils/errors");
const { parseToSafeInteger } = require("../utils/util");
const Model = require("./model");

class Privilege extends Model {

    static _tablename_ = 'Privilege';
    static _filterable_ = [ 'id', 'name', 'description' ];
    static _sortable_ = [ 'name', 'description', 'createdAt', 'updatedAt', 'deletedAt' ];

    #props = {
        id: undefined,
        name: undefined,
        description: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        deletedAt: undefined
    };

    static translator = {
        id: `${Privilege._tablename_}.id as ${Privilege._tablename_}_id`,
        name: `${Privilege._tablename_}.name as ${Privilege._tablename_}_name`,
        description: `${Privilege._tablename_}.description as ${Privilege._tablename_}_description`,
        createdAt: `${Privilege._tablename_}.createdAt as ${Privilege._tablename_}_createdAt`,
        updatedAt: `${Privilege._tablename_}.updatedAt as ${Privilege._tablename_}_updatedAt`,
        deletedAt: `${Privilege._tablename_}.deletedAt as ${Privilege._tablename_}_deletedAt`,
    }

    get id() { return this.#props.id; }
    get name() { return this.#props.name; }
    get description() { return this.#props.description; }
    get createdAt() { return this.#props.createdAt; }
    get updatedAt() { return this.#props.updatedAt; }
    get deletedAt() { return this.#props.deletedAt; }

    _fromDB(obj) {
        this.#props = {
            id: obj[`${Privilege._tablename_}_id`],
            name: obj[`${Privilege._tablename_}_name`],
            description: obj[`${Privilege._tablename_}_description`],
            createdAt: obj[`${Privilege._tablename_}_createdAt`],
            updatedAt: obj[`${Privilege._tablename_}_updatedAt`],
            deletedAt: obj[`${Privilege._tablename_}_deletedAt`]
        };
        this.#props.createdAt = this.createdAt? new Date(this.createdAt): this.createdAt;
        this.#props.updatedAt = this.updatedAt? new Date(this.updatedAt): this.updatedAt;
        this.#props.deletedAt = this.deletedAt? new Date(this.deletedAt): this.deletedAt;
        return this;
    }

    toJSON() {
        return {
            ...this.#props
        }
    }

    async getAll(config = {}) {
        var res = [];
        try {
            const { limit, offset, where, orderBy } = this._prepareQueryConfig(config);
            var data = await connection(Privilege._tablename_)
                .select(Object.values(Privilege.translator))
                .whereRaw(where.statement, where.params)
                .orderBy(orderBy)
                .limit(limit)
                .offset(offset);
            res = Array.from(data).map(e => (new Privilege)._fromDB(e));
        } catch(err) {
            if(isDevelopment) console.log(err);
            if(err instanceof CustomError)
                throw err;
            else if(err.code === 'SQLITE_ERROR')
                throw new CustomError("Internal server error");
        }
        return res;
    }

    async get(id) {
        var res;
        try {
            var data = await connection(Privilege._tablename_)
                .select(Object.values(Privilege.translator))
                .where({ id });
            if(data.length > 0) {
                this._fromDB(data[0]);
                res = this;
            }
        } catch(err) {
            if(isDevelopment) console.log(err);
            if(err instanceof CustomError)
                throw err;
            else if(err.code === 'SQLITE_ERROR')
                throw new CustomError("Internal server error");
        }
        return res;
    }

}

module.exports = {
    Privilege
};
