const { CustomerStatus } = require("../models/CustomerStatus");
const { Condition } = require("../utils/condition");
const { OrderBy } = require("../utils/order");
const CustomError = require("../utils/errors");
const Controller = require("./Controller");
const { Privilege } = require("../models/Privilege");

class CustomerStatusControllerClass extends Controller {

    async getCustomerStatus(accessToken, id) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        this.assertPrivilegeGranted(accessToken, Privilege.READ_CUSTOMER_STATUS);
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

    async getAllCustomerStatuses(accessToken, { page, limit, where, orderBy }) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        this.assertPrivilegeGranted(accessToken, Privilege.READ_CUSTOMER_STATUS);
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
