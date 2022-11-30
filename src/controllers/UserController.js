const { User } = require("../models/User");
const { UserRole } = require("../models/UserRole");
const { UserStatus } = require("../models/UserStatus");
const { Condition } = require("../utils/condition");
const CustomError = require("../utils/errors");
const { OrderBy } = require("../utils/order");

class UserControllerClass {

    async createUser(input) {
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

    async updateUser(input) {
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

    async deleteUser(id) {
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

    async getUser(id) {
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

    async getAllUsers({ page, limit, where, orderBy }) {
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

}

const UserController = new UserControllerClass;

module.exports = UserController;
