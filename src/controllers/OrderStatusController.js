const { OrderStatus } = require("../models/OrderStatus");
const { Condition } = require("../utils/condition");
const { OrderBy } = require("../utils/order");
const CustomError = require("../utils/errors");

class OrderStatusControllerClass {

    async getOrderStatus(id) {
        var response;
        try {
            response = await OrderStatus.get(id);
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async getAllOrderStatuses({ page, limit, where, orderBy }) {
        var response;
        try {
            const condition = Condition.from(where);
            orderBy = OrderBy.from(orderBy);
            response = {
                rows: await OrderStatus.getAll({ page, limit, condition, orderBy }),
                totalInCondition: await OrderStatus.count(condition),
                total: await OrderStatus.count()
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

const OrderStatusController = new OrderStatusControllerClass;

module.exports = OrderStatusController;
