const { CustomerStatus } = require("../models/CustomerStatus");
const { Condition } = require("../utils/condition");
const { OrderBy } = require("../utils/order");
const CustomError = require("../utils/errors");

class CustomerStatusControllerClass {

    async getCustomerStatus(id) {
        var response;
        try {
            response = await CustomerStatus.get(id);
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async getAllCustomerStatuses({ page, limit, where, orderBy }) {
        var response;
        try {
            const condition = Condition.from(where);
            orderBy = OrderBy.from(orderBy);
            response = {
                rows: await CustomerStatus.getAll({ page, limit, condition, orderBy }),
                totalInCondition: await CustomerStatus.count(condition),
                total: await CustomerStatus.count()
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

const CustomerStatusController = new CustomerStatusControllerClass;

module.exports = CustomerStatusController;
