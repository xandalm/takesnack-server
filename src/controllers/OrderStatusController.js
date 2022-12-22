const { OrderStatus } = require("../models/OrderStatus");
const { Condition } = require("../utils/condition");
const { OrderBy } = require("../utils/order");
const CustomError = require("../utils/errors");
const Controller = require("./Controller");
const { Privilege } = require("../models/Privilege");

class OrderStatusControllerClass extends Controller {

    async getOrderStatus(accessToken, id) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        this.assertPrivilegeGranted(accessToken, Privilege.READ_ORDER_STATUS);
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

    async getAllOrderStatuses(accessToken, { page, limit, where, orderBy }) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        this.assertPrivilegeGranted(accessToken, Privilege.READ_ORDER_STATUS);
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
