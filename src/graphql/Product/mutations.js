const { GraphQLInt, GraphQLBoolean, GraphQLNonNull, GraphQLString } = require("graphql");
const ProductController = require("../../controllers/ProductController");
const { GQLObject_Product, GQLInput_Product, GQLObject_ProductIngredient } = require("./types");

const GQLMutations_Product = {
    createProduct: {
        type: GQLObject_Product,
        args: {
            input: { type: new GraphQLNonNull(GQLInput_Product) }
        },
        resolve: (_, { input }, { token }) => {
            return ProductController.createProduct(token, input);
        }
    },
    updateProduct: {
        type: GQLObject_Product,
        args: {
            input:  { type: new GraphQLNonNull(GQLInput_Product) }
        },
        resolve: (_, { input }, { token }) => {
            return ProductController.updateProduct(token, input);
        }
    },
    deleteProduct: {
        type: GQLObject_Product,
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, { id }, { token }) => {
            return ProductController.deleteProduct(token, id);
        }
    },
    addIngredient: {
        type: GQLObject_ProductIngredient,
        args: {
            productId: { type: new GraphQLNonNull(GraphQLString) },
            ingredientId: { type: new GraphQLNonNull(GraphQLInt) },
            quantity: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { productId, ingredientId, quantity }, { token }) => {
            return ProductController.addIngredient(token, productId, ingredientId, quantity);
        }
    },
    updateIngredientQuantity: {
        type: GQLObject_ProductIngredient,
        args: {
            productId: { type: new GraphQLNonNull(GraphQLString) },
            ingredientId: { type: new GraphQLNonNull(GraphQLInt) },
            quantity: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { productId, ingredientId, quantity }, { token }) => {
            return ProductController.updateProductIngredient(token, productId, ingredientId, quantity);
        }
    },
    removeIngredient: {
        type: GraphQLBoolean,
        args: {
            productId: { type: new GraphQLNonNull(GraphQLString) },
            ingredientId: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { productId, ingredientId }, { token }) => {
            return ProductController.removeIngredient(token, productId, ingredientId);
        }
    }
}

module.exports = GQLMutations_Product;
