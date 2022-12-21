const { isDevelopment } = require("../config/server.config");
const connection = require("../database/connection");
const CustomError = require("../utils/errors");
const FieldRewriter = require("../utils/field-rewriter");
const { clearStringGaps } = require("../utils/util");
const Model = require("./Model");
const { SqliteError } = require("better-sqlite3");

class ProductCategory extends Model {

    static _tablename_ = 'ProductCategory';
    static _filterable_ = [ 'id', 'name', 'description' ];
    static _sortable_ = [ 'name', 'description', 'createdAt', 'updatedAt', 'deletedAt' ];

    static fieldRewriter = new FieldRewriter();
    
    static {
        this.fieldRewriter.add('id', `${this._tablename_}.id`, `${this._tablename_}_id`);
        this.fieldRewriter.add('name', `${this._tablename_}.name`, `${this._tablename_}_name`);
        this.fieldRewriter.add('description', `${this._tablename_}.description`, `${this._tablename_}_description`);
        this.fieldRewriter.add('createdAt', `${this._tablename_}.createdAt`, `${this._tablename_}_createdAt`);
        this.fieldRewriter.add('updatedAt', `${this._tablename_}.updatedAt`, `${this._tablename_}_updatedAt`);
        this.fieldRewriter.add('deletedAt', `${this._tablename_}.deletedAt`, `${this._tablename_}_deletedAt`);
    }

    #props = {
        id: null,
        name: null,
        description: null,
        createdAt: null,
        updatedAt: null,
        deletedAt: null
    };

    constructor(props) {
        super();
        this.name = props?.name;
        this.description = props?.description;
    }

    set name(value) {
        if(value == undefined)
            this.#props.name = null;
        if(value != undefined) {
            if(typeof value !== 'string')
                throw new Error("'value' must be string");
            value = clearStringGaps(value);
            if(value.length > 30)
                throw new CustomError("Name can't be too long (max. length = 30)");
            this.#props.name = value;
        }
    }
    
    set description(value) {
        if(value == undefined)
            this.#props.description = null;
        else {
            if(typeof value !== 'string')
                throw new Error("'value' must be string");
            value = clearStringGaps(value);
            if(value.length > 100)
                throw new CustomError("Description can't be too long (max. length = 100)");
            this.#props.description = value;
        }
    }

    get id() { return this.#props.id; }
    get name() { return this.#props.name; }
    get description() { return this.#props.description; }
    get createdAt() { return this.#props.createdAt; }
    get updatedAt() { return this.#props.updatedAt; }
    get deletedAt() { return this.#props.deletedAt; }
    
    _fromDB(obj) {
        // if it doesn't have id then it doesn't exist, so it's null
        if(obj == undefined || obj[`${ProductCategory._tablename_}_id`] == undefined)
            return null;
        this.#props = {
            id: obj[`${ProductCategory._tablename_}_id`],
            name: obj[`${ProductCategory._tablename_}_name`],
            description: obj[`${ProductCategory._tablename_}_description`],
            createdAt: obj[`${ProductCategory._tablename_}_createdAt`],
            updatedAt: obj[`${ProductCategory._tablename_}_updatedAt`],
            deletedAt: obj[`${ProductCategory._tablename_}_deletedAt`]
        };
        this.#props.createdAt = this.createdAt!=undefined? new Date(this.createdAt): this.createdAt;
        this.#props.updatedAt = this.updatedAt!=undefined? new Date(this.updatedAt): this.updatedAt;
        this.#props.deletedAt = this.deletedAt!=undefined? new Date(this.deletedAt): this.deletedAt;
        return this;
    }

    toJSON() {
        return {
            ...this.#props
        };
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
            res = Array.from(data).map(e => (new ProductCategory)._fromDB(e));
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
                res = (new ProductCategory)._fromDB(data);
        } catch(err) {
            if(isDevelopment) console.log(err);
            if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
            else
                throw err;
        }
        return res;
    }

    isValid() {
        if(!this.name)
            throw new CustomError("Name is required");
        return true;
    }

    async insert() {
        var res = false;
        this.isValid();
        try {
            var [found] = await connection(ProductCategory._tablename_)
                .select('*')
                .where({ name: this.name });
            if(found) {
                if(found.deletedAt == null)
                    throw new CustomError("Product category name already in use");
                else {
                    this.#props.id = found.id;
                    this.#props.updatedAt = new Date;
                    await connection(ProductCategory._tablename_)
                        .update({
                            name: this.name,
                            description: this.description,
                            updatedAt: this.updatedAt,
                            deletedAt: this.deletedAt
                        })
                        .where({ id: this.id });
                    res = true;
                }
            } else {
                this.#props.createdAt = new Date;
                var [data] = await connection(ProductCategory._tablename_)
                    .insert({
                        name: this.name,
                        description: this.description,
                        createdAt: this.createdAt
                    })
                    .returning('id');
                this.#props.id = data.id;
                res = true;
            }
        } catch (err) {
            if(isDevelopment) console.log(err);
            if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
            else
                throw err;
        }
        return res;
    }

    async update() {
        var res = false;
        this.isValid();
        try {
            var [found] = await connection(ProductCategory._tablename_)
                .select('*')
                .where({ name: this.name });
            if(found && found.id != this.id) {
                throw new CustomError("Product category name already in use");
            } else {
                this.#props.updatedAt = new Date;
                await connection(ProductCategory._tablename_)
                    .update({
                        name: this.name,
                        description: this.description,
                        updatedAt: this.updatedAt
                    })
                    .where({ id: this.id });
                res = true;
            }
        } catch (err) {
            if(isDevelopment) console.log(err);
            if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
            else
                throw err;
        }
        return res;
    }

    async delete() {
        var res = false;
        try {
            this.#props.deletedAt = this.deletedAt??new Date;
            var data = await connection(ProductCategory._tablename_)
                .update({ deletedAt: this.deletedAt })
                .where({ id: this.id, deletedAt: null });
            if(data !== 1)
                throw new CustomError("Ingredient not exist");
            res = true;
        } catch (err) {
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
    ProductCategory
};