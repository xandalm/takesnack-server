const { isDevelopment } = require("../config/server.config");
const connection = require("../database/connection");
const { Condition } = require("../utils/condition");
const CustomError = require("../utils/errors");
const FieldRewriter = require("../utils/field-rewriter");
const { clearStringGaps } = require("../utils/util");
const Model = require("./Model");
const { Privilege } = require("./Privilege");
const { SqliteError } = require("better-sqlite3");

class UserRole extends Model {

    static _tablename_ = 'UserRole';
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
        grants: null,
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
            this.#props.name = value.toUpperCase();
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
    get grants() {
        return (async (role) => {
            role.#props.grants = await UserRoleGrant.getRolePrivileges(role.id)
            return role.#props.grants;
        })(this);
    }
    get createdAt() { return this.#props.createdAt; }
    get updatedAt() { return this.#props.updatedAt; }
    get deletedAt() { return this.#props.deletedAt; }
    
    _fromDB(obj) {
        if(typeof(obj) !== 'object')
            throw new TypeError("'obj' must be object type");
        this.#props = {
            id: obj[`${UserRole._tablename_}_id`],
            name: obj[`${UserRole._tablename_}_name`],
            description: obj[`${UserRole._tablename_}_description`],
            // grants: await this.getPrivileges(),// obj?.grants,
            createdAt: obj[`${UserRole._tablename_}_createdAt`],
            updatedAt: obj[`${UserRole._tablename_}_updatedAt`],
            deletedAt: obj[`${UserRole._tablename_}_deletedAt`]
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

    isValid() {
        if(!this.name)
            throw new CustomError("Name is required");
        return true;
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
                .select(UserRole.fieldRewriter.transform.all())
                .whereRaw(where.statement, where.params)
                .orderBy(orderBy)
                .limit(limit)
                .offset(offset);
            res = Array.from(data).map(e => (new UserRole)._fromDB(e));
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
                .select(UserRole.fieldRewriter.transform.all())
                .where({ id })
                .first();
            if(data)
                res = (new UserRole)._fromDB(data);
        } catch(err) {
            if(isDevelopment) console.log(err);
            if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
            else
                throw err;
        }
        return res;
    }

    async insert() {
        var res;
        try {
            this.isValid();
            var [found] = await connection(UserRole._tablename_)
                .select('*')
                .where({ name: this.name });
            if(found) {
                if(found.deletedAt == null)
                    throw new CustomError("User role name already in use");
                else {
                    this.#props.id = found.id;
                    this.#props.updatedAt = new Date;
                    await connection(UserRole._tablename_)
                        .update({
                            name: this.name,
                            description: this.description,
                            updatedAt: this.updatedAt,
                            deletedAt: this.deletedAt
                        })
                        .where({ id: this.id });
                    res = this;
                }
            } else {
                this.#props.createdAt = new Date;
                var [data] = await connection(UserRole._tablename_)
                    .insert({
                        name: this.name,
                        description: this.description,
                        createdAt: this.createdAt
                    })
                    .returning('id');
                this.#props.id = data.id;
                res = this;
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
        var res;
        if(this.id == 1)
            throw new CustomError("Administrator cannot be updated");
        try {
            var [found] = await connection(UserRole._tablename_)
                .select('*')
                .where({ name: this.name, deletedAt: null });
            if(found && found.id != this.id) {
                throw new CustomError("User role name already in use");
            } else if(this.description != found.description || this.name != found.name) {
                this.#props.updatedAt = new Date;
                await connection(UserRole._tablename_)
                    .update({
                        name: this.name,
                        description: this.description,
                        updatedAt: this.updatedAt
                    })
                    .where({ id: this.id });
                res = this;
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
        if(this.id == 1)
            throw new CustomError("Administrator cannot be deleted");
        try {
            this.#props.deletedAt = new Date;
            await connection(UserRole._tablename_)
                .update({ deletedAt: this.deletedAt })
                .where({ id: this.id });
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

class UserRoleGrant extends Model {

    static _tablename_ = 'UserRoleGrant';

    #props={
        role: null,
        privilege: null,
        createdAt: null,
        deletedAt: null
    };

    static fieldRewriter = new FieldRewriter();

    static {
        this.fieldRewriter.add('role', `${this._tablename_}.role`, `${this._tablename_}_role`);
        this.fieldRewriter.add('privilege', `${this._tablename_}.privilege`, `${this._tablename_}_privilege`);
        this.fieldRewriter.add('createdAt', `${this._tablename_}.createdAt`, `${this._tablename_}_createdAt`);
        this.fieldRewriter.add('deletedAt', `${this._tablename_}.deletedAt`, `${this._tablename_}_deletedAt`);
    }

    constructor(props) {
        super();
        this.role = props?.role;
        this.privilege = props?.privilege;
    }

    set role(value) {
        if(value == undefined)
            this.#props.role = null;
        else {
            if(!value instanceof UserRole)
                throw new Error("'value' must be UserRole type");
            this.#props.role = value;
        }
    }

    set privilege(value) {
        if(value == undefined)
            this.#props.privilege = null;
        else {
            if(!value instanceof Privilege)
                throw new TypeError("'value' must be Privilege type");
            this.#props.privilege = value;
        }
    }

    get role() { return this.#props.role; }
    get privilege() { return this.#props.privilege; }
    get createdAt() { return this.#props.createdAt; }
    get deletedAt() { return this.#props.deletedAt; }

    _fromDB(obj) {
        if(obj.role != null && !obj instanceof UserRole)
            throw new Error("Role must be resolved before");
        if(obj.privilege != null && !(obj.privilege instanceof Privilege))
            throw new Error("Privilege must be resolved before");
        this.#props = {
            role: obj?.role,
            privilege: obj?.privilege,
            createdAt: obj['UserRoleGrant_createdAt'],
            deletedAt: obj['UserRoleGrant_deletedAt']
        };
        this.#props.createdAt = this.createdAt? new Date(this.createdAt): this.createdAt;
        this.#props.deletedAt = this.deletedAt? new Date(this.deletedAt): this.deletedAt;
        return this;
    }

    toJSON() {
        return {
            ...this.#props
        }
    }

    static async getRolePrivileges(roleId) {
        var res = [];
        try {
            const role = await UserRole.get(roleId);
            var data = await connection(this._tablename_)
                .innerJoin(
                    Privilege._tablename_,
                    UserRoleGrant.fieldRewriter.absolutes.privilege,
                    Privilege.fieldRewriter.absolutes.id
                )
                .where({ role: role.id })
                .andWhere(this.fieldRewriter.absolutes.deletedAt, null)
                .select(UserRoleGrant.fieldRewriter.transform.all().concat(Privilege.fieldRewriter.transform.all()));
            res = Array.from(data).map(e => (new UserRoleGrant)._fromDB({
                ...e,
                role,
                privilege: (new Privilege)._fromDB(e)
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

    static async get(roleId, privilegeId) {
        var res;
        try {
            var data = await connection(this._tablename_)
                .join(
                    UserRole._tablename_,
                    UserRoleGrant.fieldRewriter.absolutes.role,
                    UserRole.fieldRewriter.absolutes.id
                )
                .join(
                    Privilege._tablename_,
                    UserRoleGrant.fieldRewriter.absolutes.privilege,
                    Privilege.fieldRewriter.absolutes.id
                )
                .select(UserRoleGrant.fieldRewriter.transform.select(['createdAt', 'deletedAt']).concat(UserRole.fieldRewriter.transform.all().concat(Privilege.fieldRewriter.transform.all())))
                .where(UserRoleGrant.fieldRewriter.absolutes.role, roleId)
                .andWhere(UserRoleGrant.fieldRewriter.absolutes.privilege, privilegeId)
                .first();
            if(data)
                res = (new UserRoleGrant)._fromDB({
                    ...data,
                    role: (new UserRole)._fromDB(data),
                    privilege: (new Privilege)._fromDB(data)
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

    async insert() {
        var res;
        if(!(this.role instanceof UserRole))
            throw new TypeError("'role' must be UserRole type");
        if(!(this.privilege instanceof Privilege))
            throw new TypeError("'privilege' must be Privilege type");
        try {
            var [found] = await connection(UserRoleGrant._tablename_)
                .select('*')
                .where({ role: this.role.id, privilege: this.privilege.id, deletedAt: null });
            if(found) {
                throw new CustomError("Privilege already granted");
            } else {
                this.#props.createdAt = new Date;
                await connection(UserRoleGrant._tablename_)
                    .insert({
                        role: this.role.id,
                        privilege: this.privilege.id,
                        createdAt: this.createdAt
                    });
                res = this;
            }
        } catch (err) {
            if(isDevelopment)
            if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
            else
                throw err;
        }
        return res;
    }

    async delete() {
        var res = false;
        if(!(this.role instanceof UserRole))
            throw new TypeError("'role' must be UserRole type");
        if(!(this.privilege instanceof Privilege))
            throw new TypeError("'privilege' must be Privilege type");
        if(this.role.id == 1)
            throw new CustomError("Administrator grants cannot be removed")
        try {
            this.#props.deletedAt = new Date;
            var data = await connection(UserRoleGrant._tablename_)
                .update({ deletedAt: this.deletedAt })
                .where({ role: this.role.id, privilege: this.privilege.id });
            console.log(data);
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
    UserRole,
    UserRoleGrant
};