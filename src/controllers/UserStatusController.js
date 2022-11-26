const { UserStatus } = require("../models/UserStatus");
const { Condition } = require("../utils/condition");
const { OrderBy } = require("../utils/order");
const CustomError = require("../utils/errors");

class UserStatusControllerClass {

    async getUserStatus(id) {
        var response;
        try {
            response = await (new UserStatus).get(id);
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
            const us = new UserStatus;
            response = {
                rows: await us.getAll({ page, limit, condition, orderBy }),
                totalInCondition: await us.count(condition),
                total: await us.count()
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
