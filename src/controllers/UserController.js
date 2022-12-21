const { Privilege } = require("../models/Privilege");
const { User } = require("../models/User");
const { UserRole } = require("../models/UserRole");
const { UserStatus } = require("../models/UserStatus");
const { Condition } = require("../utils/condition");
const CustomError = require("../utils/errors");
const { JWT } = require("../utils/jwt");
const { OrderBy } = require("../utils/order");

class UserControllerClass {

    async createUser(accessToken, input) {
        if(User.hasAdmin) {
            if(accessToken && !(accessToken instanceof JWT))
                throw new TypeError("Access token must be JWT type");
            if(
                !accessToken?.check() || 
                !UserRole.roles.find(r => r.name === accessToken.payload.roles)?.grants.find(g => g.privilege.id === Privilege.WRITE_USER)
            )
            throw new CustomError("Unauthorized - missing valid access token");
        }
        var response;
        try {
            const props = Object.assign({}, input);
            const user = new User(props);
            if(await user.insert())
                response = user;
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async updateUser(accessToken, input) {
        if(!User.hasAdmin)
            throw new CustomError("Uninitialized application");
        if(accessToken && !(accessToken instanceof JWT))
            throw new TypeError("Access token must be JWT type");
        if(
            !accessToken?.check() || 
            !UserRole.roles.find(r => r.name === accessToken.payload.roles)?.grants.find(g => g.privilege.id === Privilege.WRITE_USER)
        )
            throw new CustomError("Unauthorized - missing valid access token");
        var response;
        try {
            const props = Object.assign({}, input);
            const user = await User.get(props?.id);
            if(!user)
                throw new CustomError("Cannot find user");
            if(props.hasOwnProperty('phoneNumber'))
                user.phoneNumber = props.phoneNumber;
            if(props.hasOwnProperty('name'))
                user.name = props.name;
            if(props.hasOwnProperty('pwd'))
                user.pwd = props.pwd;
            if(props.hasOwnProperty('roleId'))
                user.role = await UserRole.get(props.roleId);
            if(props.hasOwnProperty('statusId'))
                user.status = await UserStatus.get(props.statusId);
            if(await user.update())
                response = user;
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async deleteUser(accessToken, id) {
        if(!User.hasAdmin)
            throw new CustomError("Uninitialized application");
        if(accessToken && !(accessToken instanceof JWT))
            throw new TypeError("Access token must be JWT type");
        if(
            !accessToken?.check() || 
            !UserRole.roles.find(r => r.name === accessToken.payload.roles)?.grants.find(g => g.privilege.id === Privilege.WRITE_USER)
        )
            throw new CustomError("Unauthorized - missing valid access token");
        var response;
        try {
            const user = await User.get(id);
            if(!user)
                throw new CustomError("Cannot find user");
            if(await user.delete())
                response = user;
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async getUser(accessToken, id) {
        if(!User.hasAdmin)
            throw new CustomError("Uninitialized application");
        if(accessToken && !(accessToken instanceof JWT))
            throw new TypeError("Access token must be JWT type");
        if(
            !accessToken?.check() ||
            !UserRole.roles.find(r => r.name === accessToken.payload.roles)?.grants.find(g => g.privilege.id === Privilege.READ_USER)
        )
            throw new CustomError("Unauthorized - missing valid access token");
        var response;
        try {
            response = await User.get(id);
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async getAllUsers(accessToken, { page, limit, where, orderBy}) {
        if(!User.hasAdmin)
            throw new CustomError("Uninitialized application");
        if(accessToken && !(accessToken instanceof JWT))
            throw new TypeError("Access token must be JWT type");
        if(
            !accessToken?.check() ||
            !UserRole.roles.find(r => r.name === accessToken.payload.roles)?.grants.find(g => g.privilege.id === Privilege.READ_USER)
        )
            throw new CustomError("Unauthorized - missing valid access token");
        var response;
        try {
            const condition = Condition.from(where);
            orderBy = OrderBy.from(orderBy);
            response = {
                rows: await User.getAll({ page, limit, condition, orderBy }),
                totalInCondition: await User.count(condition),
                total: await User.count()
            };
        } catch (err) { console.log(err);
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async fromCredentials(phoneNumber, pwd) {
        if(!User.hasAdmin)
            throw new CustomError("Uninitialized application");
        try {
            phoneNumber = phoneNumber?.trim?.();
            pwd = pwd?.trim?.();
            const user = await User.withCredentials(phoneNumber, pwd);
            if(user == undefined || user.deletedAt != null)
                throw new CustomError("User not exists");
            else if(user.status.id === UserStatus.INACTIVE)
                throw new CustomError("User is inactivated");
            else if(user.status.id === UserStatus.RESTRICTED)
                throw new CustomError("User is restricted indefinitely");
            else{
                const jwt = JWT.generate({
                    sub: user.id,
                    name: user.name,
                    roles: user.role.name
                })
                return jwt.export();
            }
        } catch (err) { console.log(err);
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
    }

}

const UserController = new UserControllerClass;

module.exports = UserController;
