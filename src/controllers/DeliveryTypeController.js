const { DeliveryType } = require("../models/DeliveryType");
const { Condition } = require("../utils/condition");
const { OrderBy } = require("../utils/order");
const CustomError = require("../utils/errors");

class DeliveryTypeControllerClass {

    async getDeliveryType(id) {
        var response;
        try {
            response = await DeliveryType.get(id);
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async getAllDeliveryTypes({ page, limit, where, orderBy }) {
        var response;
        try {
            const condition = Condition.from(where);
            orderBy = OrderBy.from(orderBy);
            response = {
                rows: await DeliveryType.getAll({ page, limit, condition, orderBy }),
                totalInCondition: await DeliveryType.count(condition),
                total: await DeliveryType.count()
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

const DeliveryTypeController = new DeliveryTypeControllerClass;

module.exports = DeliveryTypeController;
