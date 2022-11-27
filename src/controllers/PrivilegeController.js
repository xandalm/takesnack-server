const { Privilege } = require("../models/Privilege");
const { Condition } = require("../utils/condition");
const CustomError = require("../utils/errors");
const { OrderBy } = require("../utils/order");
const { parseToSafeInteger } = require("../utils/util");

class PrivilegeControllerClass {

    async getPrivilege(id) {
        var response;
        try {
            response = await Privilege.get(id);
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async getAllPrivileges({ page, limit, where, orderBy }) {
        var response;
        try {
            const condition = Condition.from(where);
            orderBy = OrderBy.from(orderBy);
            response = {
                rows: await Privilege.getAll({ page, limit, condition, orderBy }),
                totalInCondition: await Privilege.count(condition),
                total: await Privilege.count()
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

const PrivilegeController = new PrivilegeControllerClass;

module.exports = PrivilegeController;
