const { GraphQLInt, GraphQLBoolean, GraphQLNonNull } = require("graphql");
const IngredientController = require("../../controllers/IngredientController");
const { GQLObject_Ingredient, GQLInput_Ingredient } = require("./types");

const GQLMutations_Ingredient = {
    createIngredient: {
        type: GQLObject_Ingredient,
        args: {
            input: { type: new GraphQLNonNull(GQLInput_Ingredient) }
        },
        resolve: (_, { input }, { token }) => {
            return IngredientController.createIngredient(token, input);
        }
    },
    updateIngredient: {
        type: GQLObject_Ingredient,
        args: {
            input:  { type: new GraphQLNonNull(GQLInput_Ingredient) }
        },
        resolve: (_, { input }, { token }) => {
            return IngredientController.updateIngredient(token, input);
        }
    },
    deleteIngredient: {
        type: GQLObject_Ingredient,
        args: {
            id: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { id }, { token }) => {
            return IngredientController.deleteIngredient(token, id);
        }
    }
}

module.exports = GQLMutations_Ingredient;
