const { Ingredient } = require("../models/Ingredient");
const { Privilege } = require("../models/Privilege");
const { Condition } = require("../utils/condition");
const CustomError = require("../utils/errors");
const { OrderBy } = require("../utils/order");
const Controller = require("./Controller");

class IngredientControllerClass extends Controller {

    async createIngredient(accessToken, input) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        this.assertPrivilegeGranted(accessToken, Privilege.WRITE_INGREDIENT);
        var response;
        try {
            const props = Object.assign({}, input);
            const pc = new Ingredient(props);
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

    async updateIngredient(accessToken, input) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        this.assertPrivilegeGranted(accessToken, Privilege.WRITE_INGREDIENT);
        var response;
        try {
            const props = Object.assign({}, input);
            const pc = await Ingredient.get(props?.id);
            if(!pc)
                throw new CustomError("Cannot find ingredient");
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

    async deleteIngredient(accessToken, id) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        this.assertPrivilegeGranted(accessToken, Privilege.WRITE_INGREDIENT);
        var response;
        try {
            const pc = await Ingredient.get(id);
            if(!pc)
                throw new CustomError("Cannot find ingredient");
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

    async getIngredient(accessToken, id) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        var response;
        try {
            response = await Ingredient.get(id);
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async getAllIngredients(accessToken, { page, limit, where, orderBy }) {
        this.assertInitializedApp();
        this.assertTokenType(accessToken);
        this.assertTrustToken(accessToken);
        var response;
        try {
            const condition = Condition.from(where);
            orderBy = OrderBy.from(orderBy);
            response = {
                rows: await Ingredient.getAll({ page, limit, condition, orderBy }),
                totalInCondition: await Ingredient.count(condition),
                total: await Ingredient.count()
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

const IngredientController = new IngredientControllerClass;

module.exports = IngredientController;
