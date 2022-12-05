const { v4:uuid } = require('uuid');
const { createHmac } = require('crypto');
const { isDevelopment } = require('../config/server.config');
const connection = require('../database/connection');
const CustomError = require("../utils/errors");
const FieldRewriter = require('../utils/field-rewriter');
const Model = require("./model");
const { CustomerStatus } = require('./CustomerStatus');
const { SqliteError } = require("better-sqlite3");

class Customer extends Model {

    static _tablename_ = 'Customer';
    static _filterable_ = [ 'id', 'phoneNumber', 'name' ];
    static _sortable_ = [ 'name', 'createdAt', 'updatedAt', 'deletedAt' ];

    static fieldRewriter = new FieldRewriter();

    static {
        this.fieldRewriter.add('id', `${this._tablename_}.id`, `${this._tablename_}_id`);
        this.fieldRewriter.add('phoneNumber', `${this._tablename_}.phoneNumber`, `${this._tablename_}_phoneNumber`);
        this.fieldRewriter.add('name', `${this._tablename_}.name`, `${this._tablename_}_name`);
        this.fieldRewriter.add('pwd', `${this._tablename_}.pwd`, `${this._tablename_}_pwd`);
        this.fieldRewriter.add('status', `${this._tablename_}.status`, `${this._tablename_}_status`);
        this.fieldRewriter.add('createdAt', `${this._tablename_}.createdAt`, `${this._tablename_}_createdAt`);
        this.fieldRewriter.add('updatedAt', `${this._tablename_}.updatedAt`, `${this._tablename_}_updatedAt`);
        this.fieldRewriter.add('deletedAt', `${this._tablename_}.deletedAt`, `${this._tablename_}_deletedAt`);
    }

    #props={
        id: null,
        name: null,
        phoneNumber: null,
        pwd: null,
        status: null,
        createdAt: null,
        updatedAt: null,
        deletedAt: null
    };

    constructor(props) {
        super();
        this.phoneNumber = props?.phoneNumber;
        this.name = props?.name;
        this.pwd = props?.pwd;
    }

    set name(value) {
        if(value == undefined)
            this.#props.name = null;
        else {
            if(typeof value !== 'string')
                throw new TypeError("Must be string");
            value = value.trim();
            this.#props.name = value;
        }
    }

    set phoneNumber(value) {
        if(value == undefined)
            this.#props.phoneNumber = null;
        else {
            if(typeof value !== 'string')
                throw new TypeError("Must be string");
            value = value.trim();
            this.#props.phoneNumber = value;
        }
        return this;
    }

    set pwd(value) {
        if(value == undefined)
            this.#props.pwd = null;
        else {
            if(typeof value !== 'string')
                throw new TypeError("Must be string");
            value = value.trim();
            if(!/^[\x21-\x7E]*$/.test(value))
                throw new CustomError("Invalid characters");
            this.#props.pwd = createHmac('sha256', '@TakeSnack#CustomerSecret').update(value).digest('hex');
        }
        return this;
    }

    set status(value) {
        if(value == undefined)
            this.#props.status = null;
        else {
            if(!(value instanceof CustomerStatus))
                throw new CustomError("Must be CustomerStatus type");
            this.#props.status = value;
        }
    }

    get id() { return this.#props.id }
    get name() { return this.#props.name }
    get phoneNumber() { return this.#props.phoneNumber }
    get pwd() { return this.#props.pwd }
    get status() { return this.#props.status }
    get createdAt() { return this.#props.createdAt }
    get updatedAt() { return this.#props.updatedAt }
    get deletedAt() { return this.#props.deletedAt }

    _fromDB(obj) {
        // if it doesn't have id then it doesn't exist, so it's null
        if(obj == undefined || obj[`${Customer._tablename_}_id`] == undefined)
            return null;
        this.#props = {
            id: obj[`${Customer._tablename_}_id`],
            phoneNumber: obj[`${Customer._tablename_}_phoneNumber`],
            name: obj[`${Customer._tablename_}_name`],
            pwd: obj[`${Customer._tablename_}_pwd`],
            status: obj.status,
            createdAt: obj[`${Customer._tablename_}_createdAt`],
            updatedAt: obj[`${Customer._tablename_}_updatedAt`],
            deletedAt: obj[`${Customer._tablename_}_deletedAt`]
        };
        this.#props.createdAt = this.createdAt!=undefined? new Date(this.createdAt): this.createdAt;
        this.#props.updatedAt = this.updatedAt!=undefined? new Date(this.updatedAt): this.updatedAt;
        this.#props.deletedAt = this.deletedAt!=undefined? new Date(this.deletedAt): this.deletedAt;
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

    static async get(id) {
        var res;
        try {
            var data = await connection.with('A', (c) => {
                c.select(Customer.fieldRewriter.transform.all())
                .from(Customer._tablename_)
                .where({ id })
            })
            .select(
                this.fieldRewriter.alias.all().concat(
                    CustomerStatus.fieldRewriter.transform.all()
                )
            )
            .from('A')
            .join(CustomerStatus._tablename_, this.fieldRewriter.aliases.status, CustomerStatus.fieldRewriter.absolutes.id)
            .first();
            if(data)
                res = (new Customer)._fromDB({
                    ...data,
                    status: (new CustomerStatus)._fromDB(data)
                });
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
            var data = await connection.with('A', (c) => {
                c.select(Customer.fieldRewriter.transform.all())
                .from(Customer._tablename_)
                .whereRaw(where.statement, where.params)
                .orderBy(orderBy)
                .limit(limit)
                .offset(offset)
            })
            .select(
                this.fieldRewriter.alias.all().concat(
                    CustomerStatus.fieldRewriter.transform.all()
                )
            )
            .from('A')
            .join(CustomerStatus._tablename_, this.fieldRewriter.aliases.status, CustomerStatus.fieldRewriter.absolutes.id);

            res = Array.from(data).map(e => (new Customer)._fromDB({
                ...e,
                status: (new CustomerStatus)._fromDB(e)
            }));
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
        if(!this.phoneNumber)
            throw new CustomError("Phone number is required");
        if(!this.name)
            throw new CustomError("Name is required");
        if(!this.pwd)
            throw new CustomError("Pwd is required");
        return true;
    }

    async insert() {
        var res = false;
        this.isValid();
        try {
            this.status = await CustomerStatus.get(1); // ACTIVE
            var [found] = await connection(Customer._tablename_)
                .select('*')
                .where({ phoneNumber: this.phoneNumber });
            if(found) {
                if(found.deletedAt == null)
                    throw new CustomError("Phone number already in use");
                else {
                    this.#props.id = found.id;
                    this.#props.updatedAt = new Date;
                    await connection(Customer._tablename_)
                        .update({
                            name: this.name,
                            pwd: this.pwd,
                            status: this.status.id,
                            updatedAt: this.updatedAt,
                            deletedAt: this.deletedAt
                        })
                        .where({ id: this.id });
                    res = true;
                }
            } else {
                this.#props.id = uuid();
                this.#props.createdAt = new Date;
                await connection(Customer._tablename_)
                    .insert({
                        id: this.id,
                        phoneNumber: this.phoneNumber,
                        name: this.name,
                        pwd: this.pwd,
                        status: this.status.id,
                        createdAt: this.createdAt
                    });
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
            var [found] = await connection(Customer._tablename_)
                .select('*')
                .where({ phoneNumber: this.phoneNumber });
            if(found && found.id != this.id) {
                throw new CustomError("Phone number already in use");
            } else {
                this.#props.updatedAt = new Date;
                await connection(Customer._tablename_)
                    .update({
                        phoneNumber: this.phoneNumber,
                        name: this.name,
                        pwd: this.pwd,
                        status: this.status ? this.status.id : null,
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
            await connection(Customer._tablename_)
                .update({ deletedAt: this.deletedAt })
                .where({ id: this.id, deletedAt: null });
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
    Customer
};
