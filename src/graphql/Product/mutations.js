const { GraphQLInt, GraphQLBoolean, GraphQLNonNull, GraphQLString } = require("graphql");
const ProductController = require("../../controllers/ProductController");
const { GQLObject_Product, GQLInput_Product, GQLObject_ProductIngredient } = require("./types");

const GQLMutations_Product = {
    createProduct: {
        type: GQLObject_Product,
        args: {
            input: { type: new GraphQLNonNull(GQLInput_Product) }
        },
        resolve: (_, { input }) => {
            return ProductController.createProduct(input);
        }
    },
    updateProduct: {
        type: GQLObject_Product,
        args: {
            input:  { type: new GraphQLNonNull(GQLInput_Product) }
        },
        resolve: (_, { input }) => {
            return ProductController.updateProduct(input);
        }
    },
    deleteProduct: {
        type: GQLObject_Product,
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, { id }) => {
            return ProductController.deleteProduct(id);
        }
    },
    addIngredient: {
        type: GQLObject_ProductIngredient,
        args: {
            productId: { type: new GraphQLNonNull(GraphQLString) },
            ingredientId: { type: new GraphQLNonNull(GraphQLInt) },
            quantity: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { productId, ingredientId, quantity }) => {
            return ProductController.addIngredient(productId, ingredientId, quantity);
        }
    },
    updateIngredientQuantity: {
        type: GQLObject_ProductIngredient,
        args: {
            productId: { type: new GraphQLNonNull(GraphQLString) },
            ingredientId: { type: new GraphQLNonNull(GraphQLInt) },
            quantity: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { productId, ingredientId, quantity }) => {
            return ProductController.updateProductIngredient(productId, ingredientId, quantity);
        }
    },
    removeIngredient: {
        type: GraphQLBoolean,
        args: {
            productId: { type: new GraphQLNonNull(GraphQLString) },
            ingredientId: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { productId, ingredientId }) => {
            return ProductController.removeIngredient(productId, ingredientId);
        }
    }
}

module.exports = GQLMutations_Product;
