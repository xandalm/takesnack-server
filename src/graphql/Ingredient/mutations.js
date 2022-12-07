const { GraphQLInt, GraphQLBoolean, GraphQLNonNull } = require("graphql");
const IngredientController = require("../../controllers/IngredientController");
const { GQLObject_Ingredient, GQLInput_Ingredient } = require("./types");

const GQLMutations_Ingredient = {
    createIngredient: {
        type: GQLObject_Ingredient,
        args: {
            input: { type: new GraphQLNonNull(GQLInput_Ingredient) }
        },
        resolve: (_, { input }) => {
            return IngredientController.createIngredient(input);
        }
    },
    updateIngredient: {
        type: GQLObject_Ingredient,
        args: {
            input:  { type: new GraphQLNonNull(GQLInput_Ingredient) }
        },
        resolve: (_, { input }) => {
            return IngredientController.updateIngredient(input);
        }
    },
    deleteIngredient: {
        type: GraphQLBoolean,
        args: {
            id: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { id }) => {
            return IngredientController.deleteIngredient(id);
        }
    }
}

module.exports = GQLMutations_Ingredient;
