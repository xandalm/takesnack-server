const { UserStatus } = require("../models/UserStatus");
const { Condition } = require("../utils/condition");
const { OrderBy } = require("../utils/order");
const CustomError = require("../utils/errors");

class UserStatusControllerClass {

    async getUserStatus(id) {
        var response;
        try {
            response = await UserStatus.get(id);
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async getAllUserStatuses({ page, limit, where, orderBy }) {
        var response;
        try {
            const condition = Condition.from(where);
            orderBy = OrderBy.from(orderBy);
            response = {
                rows: await UserStatus.getAll({ page, limit, condition, orderBy }),
                totalInCondition: await UserStatus.count(condition),
                total: await UserStatus.count()
            };
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

}

const UserStatusController = new UserStatusControllerClass;

module.exports = UserStatusController;
