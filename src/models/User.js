const { v4:uuid } = require('uuid');
const { createHmac } = require('crypto');
const { isDevelopment } = require('../config/server.config');
const connection = require('../database/connection');
const CustomError = require("../utils/errors");
const FieldRewriter = require('../utils/field-rewriter');
const Model = require("./model");
const { UserRole } = require('./UserRole');
const { UserStatus } = require('./UserStatus');
const { SqliteError } = require("better-sqlite3");

class User extends Model {

    static _tablename_ = 'User';
    static _filterable_ = [ 'id', 'phoneNumber', 'name' ];
    static _sortable_ = [ 'name', 'createdAt', 'updatedAt', 'deletedAt' ];

    static fieldRewriter = new FieldRewriter();

    static {
        this.fieldRewriter.add('id', `${this._tablename_}.id`, `${this._tablename_}_id`);
        this.fieldRewriter.add('phoneNumber', `${this._tablename_}.phoneNumber`, `${this._tablename_}_phoneNumber`);
        this.fieldRewriter.add('name', `${this._tablename_}.name`, `${this._tablename_}_name`);
        this.fieldRewriter.add('pwd', `${this._tablename_}.pwd`, `${this._tablename_}_pwd`);
        this.fieldRewriter.add('role', `${this._tablename_}.role`, `${this._tablename_}_role`);
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
        role: null,
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
            this.#props.pwd = createHmac('sha256', '@TakeSnack#UserSecret').update(value).digest('hex');
        }
        return this;
    }

    set role(value) {
        if(value == undefined)
            this.#props.role = null;
        else {
            if(!(value instanceof UserRole))
                throw new CustomError("Must be UserRole type");
            this.#props.role = value;
        }
    }

    set status(value) {
        if(value == undefined)
            this.#props.status = null;
        else {
            if(!(value instanceof UserStatus))
                throw new CustomError("Must be UserStatus type");
            this.#props.status = value;
        }
    }

    get id() { return this.#props.id }
    get name() { return this.#props.name }
    get phoneNumber() { return this.#props.phoneNumber }
    get pwd() { return this.#props.pwd }
    get role() { return this.#props.role }
    get status() { return this.#props.status }
    get createdAt() { return this.#props.createdAt }
    get updatedAt() { return this.#props.updatedAt }
    get deletedAt() { return this.#props.deletedAt }

    _fromDB(obj) {
        // if it doesn't have id then it doesn't exist, so it's null
        if(obj == undefined || obj[`${User._tablename_}_id`] == undefined)
            return null;
        if(obj.role != null && !obj instanceof UserRole)
            throw new Error("Role must be resolved before");
        this.#props = {
            id: obj[`${User._tablename_}_id`],
            phoneNumber: obj[`${User._tablename_}_phoneNumber`],
            name: obj[`${User._tablename_}_name`],
            pwd: obj[`${User._tablename_}_pwd`],
            role: obj.role,
            status: obj.status,
            createdAt: obj[`${User._tablename_}_createdAt`],
            updatedAt: obj[`${User._tablename_}_updatedAt`],
            deletedAt: obj[`${User._tablename_}_deletedAt`]
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
                c.select(User.fieldRewriter.transform.all())
                .from(User._tablename_)
                .where({ id })
            })
            .select(
                this.fieldRewriter.alias.all().concat(
                    UserRole.fieldRewriter.transform.all(),
                    UserStatus.fieldRewriter.transform.all()
                )
            )
            .from('A')
            .leftJoin(UserRole._tablename_, this.fieldRewriter.aliases.role, UserRole.fieldRewriter.absolutes.id)
            .join(UserStatus._tablename_, this.fieldRewriter.aliases.status, UserStatus.fieldRewriter.absolutes.id)
            .first();
            if(data)
                res = (new User)._fromDB({
                    ...data,
                    role: (new UserRole)._fromDB(data),
                    status: (new UserStatus)._fromDB(data)
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
                c.select(User.fieldRewriter.transform.all())
                .from(User._tablename_)
                .whereRaw(where.statement, where.params)
                .orderBy(orderBy)
                .limit(limit)
                .offset(offset)
            })
            .select(
                this.fieldRewriter.alias.all().concat(
                    UserRole.fieldRewriter.transform.all(),
                    UserStatus.fieldRewriter.transform.all()
                )
            )
            .from('A')
            .leftJoin(UserRole._tablename_, this.fieldRewriter.aliases.role, UserRole.fieldRewriter.absolutes.id)
            .join(UserStatus._tablename_, this.fieldRewriter.aliases.status, UserStatus.fieldRewriter.absolutes.id);

            res = Array.from(data).map(e => (new User)._fromDB({
                ...e,
                role: (new UserRole)._fromDB(e),
                status: (new UserStatus)._fromDB(e)
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

    static async withCredentials(phoneNumber, pwd) {
        var res;
        if(typeof(phoneNumber) !== 'string')
            throw new TypeError("Phone number must be string");
        if(typeof(pwd) !== 'string')
            throw new TypeError("Password(pwd) must be string");
        if(!/^[\x21-\x7E]*$/.test(pwd))
            throw new CustomError("Invalid credentials");
        pwd = createHmac('sha256', '@TakeSnack#UserSecret').update(pwd).digest('hex');
        try {
            var data = await connection.with('A', (c) => {
                c.select(User.fieldRewriter.transform.all())
                .from(User._tablename_)
                .where({ phoneNumber, pwd })
            })
            .select(
                this.fieldRewriter.alias.all().concat(
                    UserRole.fieldRewriter.transform.all(),
                    UserStatus.fieldRewriter.transform.all()
                )
            )
            .from('A')
            .leftJoin(UserRole._tablename_, this.fieldRewriter.aliases.role, UserRole.fieldRewriter.absolutes.id)
            .join(UserStatus._tablename_, this.fieldRewriter.aliases.status, UserStatus.fieldRewriter.absolutes.id)
            .first();
            if(!data)
                throw new CustomError("Invalid credentials");
            res = (new User)._fromDB({
                ...data,
                role: (new UserRole)._fromDB(data),
                status: (new UserStatus)._fromDB(data)
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
            this.status = await UserStatus.get(1); // ACTIVE
            var [found] = await connection(User._tablename_)
                .select('*')
                .where({ phoneNumber: this.phoneNumber });
            if(found) {
                if(found.deletedAt == null)
                    throw new CustomError("Phone number already in use");
                else {
                    this.#props.id = found.id;
                    this.#props.updatedAt = new Date;
                    await connection(User._tablename_)
                        .update({
                            name: this.name,
                            pwd: this.pwd,
                            role: null,
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
                await connection(User._tablename_)
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
            var [found] = await connection(User._tablename_)
                .select('*')
                .where({ phoneNumber: this.phoneNumber });
            if(found && found.id != this.id) {
                throw new CustomError("Phone number already in use");
            } else {
                this.#props.updatedAt = new Date;
                await connection(User._tablename_)
                    .update({
                        phoneNumber: this.phoneNumber,
                        name: this.name,
                        pwd: this.pwd,
                        role: this.role ? this.role.id : null,
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
            await connection(User._tablename_)
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
    User
};
