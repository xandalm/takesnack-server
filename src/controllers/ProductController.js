const { Ingredient } = require("../models/Ingredient");
const { Privilege } = require("../models/Privilege");
const { Product, ProductIngredient } = require("../models/Product");
const { ProductCategory } = require("../models/ProductCategory");
const { ProductStatus } = require("../models/ProductStatus");
const { Condition } = require("../utils/condition");
const CustomError = require("../utils/errors");
const { OrderBy } = require("../utils/order");
const Controller = require("./Controller");

class ProductControllerClass extends Controller {

    async createProduct(accessToken, input) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        this.assertPrivilegeGranted(accessToken, Privilege.WRITE_PRODUCT);
        var response;
        try {
            const props = Object.assign({}, input);
            const product = new Product(props);
            if(await product.insert())
                response = product;
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async updateProduct(accessToken, input) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        this.assertPrivilegeGranted(accessToken, Privilege.WRITE_PRODUCT);
        var response;
        try {
            const props = Object.assign({}, input);
            const product = await Product.get(props?.id);
            if(!product)
                throw new CustomError("Cannot find product");
            if(props.hasOwnProperty('name'))
                product.name = props.name;
            if(props.hasOwnProperty('description'))
                product.description = props.description;
            if(props.hasOwnProperty('categoryId'))
                product.category = await ProductCategory.get(props.categoryId);
            if(props.hasOwnProperty('price'))
                product.price = props.price;
            if(props.hasOwnProperty('statusId'))
                product.status = await ProductStatus.get(props.statusId);
            if(await product.update())
                response = product;
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async deleteProduct(accessToken, id) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        this.assertPrivilegeGranted(accessToken, Privilege.WRITE_PRODUCT);
        var response;
        try {
            const product = await Product.get(id);
            if(!product)
                throw new CustomError("Cannot find product");
            if(await product.delete())
                response = product;
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async getProduct(accessToken, id) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        var response;
        try {
            response = await Product.get(id);
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async getAllProducts(accessToken, { page, limit, where, orderBy }) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        var response;
        try {
            const condition = Condition.from(where);
            orderBy = OrderBy.from(orderBy);
            response = {
                rows: await Product.getAll({ page, limit, condition, orderBy }),
                totalInCondition: await Product.count(condition),
                total: await Product.count()
            };
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async addIngredient(accessToken, productId, ingredientId, quantity) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        this.assertPrivilegeGranted(accessToken, Privilege.WRITE_PRODUCT);
        var response;
        try {
            const product = await Product.get(productId);
            if(!product)
                throw new CustomError("Cannot find product");
            const ingredient = await Ingredient.get(ingredientId);
            if(!ingredient)
                throw new CustomError("Cannot find product ingredient");
            const productIngredient = new ProductIngredient({ product, ingredient, quantity });
            if(await productIngredient.insert())
                response = productIngredient;
        } catch (err) { console.log(err);
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async updateProductIngredient(accessToken, productId, ingredientId, quantity) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        this.assertPrivilegeGranted(accessToken, Privilege.WRITE_PRODUCT);
        var response;
        try {
            const props = Object.assign({}, input);
            const productIngredient = await ProductIngredient.get(productId, ingredientId);
            if(!productIngredient)
                throw new CustomError("Cannot find product ingredient");
            if(props.hasOwnProperty('quantity')) {
                productIngredient.quantity = quantity;
                await productIngredient.update();
                response = productIngredient;
            } else
                throw new CustomError("Nothing to update");
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async removeIngredient(accessToken, productId, ingredientId) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        this.assertPrivilegeGranted(accessToken, Privilege.WRITE_PRODUCT);
        var response;
        try {
            const productIngredient = await ProductIngredient.get(productId, ingredientId);
            if(!productIngredient)
                throw new CustomError("Cannot find product ingredient");
            response = await productIngredient.delete();
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

}

const ProductController = new ProductControllerClass;

module.exports = ProductController;
