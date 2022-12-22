const { ProductStatus } = require("../models/ProductStatus");
const { Condition } = require("../utils/condition");
const { OrderBy } = require("../utils/order");
const CustomError = require("../utils/errors");
const Controller = require("./Controller");
const { Privilege } = require("../models/Privilege");

class ProductStatusControllerClass extends Controller {

    async getProductStatus(accessToken, id) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        this.assertPrivilegeGranted(accessToken, Privilege.READ_PRODUCT_STATUS);
        var response;
        try {
            response = await ProductStatus.get(id);
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async getAllProductStatuses(accessToken, { page, limit, where, orderBy }) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        this.assertPrivilegeGranted(accessToken, Privilege.READ_PRODUCT_STATUS);
        var response;
        try {
            const condition = Condition.from(where);
            orderBy = OrderBy.from(orderBy);
            response = {
                rows: await ProductStatus.getAll({ page, limit, condition, orderBy }),
                totalInCondition: await ProductStatus.count(condition),
                total: await ProductStatus.count()
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

const ProductStatusController = new ProductStatusControllerClass;

module.exports = ProductStatusController;
