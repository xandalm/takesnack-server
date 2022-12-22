const { GraphQLInt, GraphQLNonNull } = require("graphql");
const IngredientController = require("../../controllers/IngredientController");
const { GQLInput_Condition, GQLInput_OrderBy } = require("../types");
const { GQLObject_Ingredient, GQLObject_IngredientPage } = require("./types");

const GQLQueries_Ingredient = {
    ingredients: {
        type: GQLObject_IngredientPage,
        args: {
            page: { type: GraphQLInt },
            limit: { type: GraphQLInt },
            where: { type: GQLInput_Condition },
            orderBy: { type: GQLInput_OrderBy }
        },
        resolve: (_, args, { token }) => {
            return IngredientController.getAllIngredients(token, args);
        }
    },
    ingredient: {
        type: GQLObject_Ingredient,
        args: {
            id: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { id }, { token }) => {
            return IngredientController.getIngredient(token, id);
        }
    }
}

module.exports = GQLQueries_Ingredient;
