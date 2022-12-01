const { Privilege } = require("../models/Privilege");
const { UserRole, UserGrant, UserRoleGrant } = require("../models/UserRole");
const { Condition } = require("../utils/condition");
const CustomError = require("../utils/errors");
const { OrderBy } = require("../utils/order");

class UserRoleControllerClass {

    async createUserRole(input) {
        var response;
        try {
            const props = Object.assign({}, input);
            const role = new UserRole(props);
            if(await role.insert())
                response = role;
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async updateUserRole(input) {
        var response;
        try {
            const props = Object.assign({}, input);
            const role = await UserRole.get(props?.id);
            if(!role)
                throw new CustomError("Cannot find role");
            if(props.hasOwnProperty('name'))
                role.name = props.name;
            if(props.hasOwnProperty('description'))
                role.description = props.description;
            if(await role.update())
                response = role;
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async deleteUserRole(id) {
        var response;
        try {
            const role = await UserRole.get(id);
            if(!role)
                throw new CustomError("Cannot find role");
            if(await role.delete())
                response = role;
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async getUserRole(id) {
        var response;
        try {
            response = await UserRole.get(id);
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async getAllUserRoles({ page, limit, where, orderBy }) {
        var response;
        try {
            const condition = Condition.from(where);
            orderBy = OrderBy.from(orderBy);
            response = {
                rows: await UserRole.getAll({ page, limit, condition, orderBy }),
                totalInCondition: await UserRole.count(condition),
                total: await UserRole.count()
            };
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async grantPrivilege(roleId, privilegeId) {
        var response;
        try {
            const role = await UserRole.get(roleId);
            if(!role)
                throw new CustomError("Cannot find role");
            const privilege = await Privilege.get(privilegeId);
            if(!privilege)
                throw new CustomError("Cannot find privilege");
            const rolePrivilege = new UserRoleGrant({ role, privilege });
            if(await rolePrivilege.insert())
                response = rolePrivilege;
        } catch (err) { console.log(err);
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async removePrivilege(roleId, privilegeId) {
        var response;
        try {
            const rolePrivilege = await UserRoleGrant.get(roleId, privilegeId);
            if(!rolePrivilege)
                throw new CustomError("Cannot find role privilege");
            response = await rolePrivilege.delete();
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

}

const UserRoleController = new UserRoleControllerClass;

module.exports = UserRoleController;
