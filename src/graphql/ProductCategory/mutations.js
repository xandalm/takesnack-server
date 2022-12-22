const { GraphQLInt, GraphQLBoolean, GraphQLNonNull } = require("graphql");
const ProductCategoryController = require("../../controllers/ProductCategoryController");
const { GQLObject_ProductCategory, GQLInput_ProductCategory } = require("./types");

const GQLMutations_ProductCategory = {
    createProductCategory: {
        type: GQLObject_ProductCategory,
        args: {
            input: { type: new GraphQLNonNull(GQLInput_ProductCategory) }
        },
        resolve: (_, { input }, { token }) => {
            return ProductCategoryController.createProductCategory(token, input);
        }
    },
    updateProductCategory: {
        type: GQLObject_ProductCategory,
        args: {
            input:  { type: new GraphQLNonNull(GQLInput_ProductCategory) }
        },
        resolve: (_, { input }, { token }) => {
            return ProductCategoryController.updateProductCategory(token, input);
        }
    },
    deleteProductCategory: {
        type: GraphQLBoolean,
        args: {
            id: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { id }, { token }) => {
            return ProductCategoryController.deleteProductCategory(token, id);
        }
    }
}

module.exports = GQLMutations_ProductCategory;
