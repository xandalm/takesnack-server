const { Ingredient } = require("../models/Ingredient");
const { Condition } = require("../utils/condition");
const CustomError = require("../utils/errors");
const { OrderBy } = require("../utils/order");

class IngredientControllerClass {

    async createIngredient(input) {
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

    async updateIngredient(input) {
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

    async deleteIngredient(id) {
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

    async getIngredient(id) {
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

    async getAllProductCategories({ page, limit, where, orderBy }) {
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
