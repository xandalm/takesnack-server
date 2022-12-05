const { ProductStatus } = require("../models/ProductStatus");
const { Condition } = require("../utils/condition");
const { OrderBy } = require("../utils/order");
const CustomError = require("../utils/errors");

class ProductStatusControllerClass {

    async getProductStatus(id) {
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

    async getAllProductStatuses({ page, limit, where, orderBy }) {
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
