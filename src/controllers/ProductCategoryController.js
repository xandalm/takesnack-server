const { Privilege } = require("../models/Privilege");
const { ProductCategory } = require("../models/ProductCategory");
const { Condition } = require("../utils/condition");
const CustomError = require("../utils/errors");
const { OrderBy } = require("../utils/order");
const Controller = require("./Controller");

class ProductCategoryControllerClass extends Controller {

    async createProductCategory(accessToken, input) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        this.assertPrivilegeGranted(accessToken, Privilege.WRITE_PRODUCT_CATEGORY);
        var response;
        try {
            const props = Object.assign({}, input);
            const pc = new ProductCategory(props);
            if(await pc.insert());
                response = pc;
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async updateProductCategory(accessToken, input) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        this.assertPrivilegeGranted(accessToken, Privilege.WRITE_PRODUCT_CATEGORY);
        var response;
        try {
            const props = Object.assign({}, input);
            const pc = await ProductCategory.get(props?.id);
            if(!pc)
                throw new CustomError("Cannot find product category");
            if(props.hasOwnProperty('name'))
                pc.name = props.name;
            if(props.hasOwnProperty('description'))
                pc.description = props.description;
            if(await pc.update())
                response = pc;
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async deleteProductCategory(accessToken, id) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        this.assertPrivilegeGranted(accessToken, Privilege.WRITE_PRODUCT_CATEGORY);
        var response;
        try {
            const pc = await ProductCategory.get(id);
            if(!pc)
                throw new CustomError("Cannot find product category");
            if(await pc.delete())
                response = pc;
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async getProductCategory(accessToken, id) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        var response;
        try {
            response = await ProductCategory.get(id);
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async getAllProductCategories(accessToken, { page, limit, where, orderBy }) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        var response;
        try {
            const condition = Condition.from(where);
            orderBy = OrderBy.from(orderBy);
            response = {
                rows: await ProductCategory.getAll({ page, limit, condition, orderBy }),
                totalInCondition: await ProductCategory.count(condition),
                total: await ProductCategory.count()
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

const ProductCategoryController = new ProductCategoryControllerClass;

module.exports = ProductCategoryController;
