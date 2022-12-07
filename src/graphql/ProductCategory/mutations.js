const { GraphQLInt, GraphQLBoolean, GraphQLNonNull } = require("graphql");
const ProductCategoryController = require("../../controllers/ProductCategoryController");
const { GQLObject_ProductCategory, GQLInput_ProductCategory } = require("./types");

const GQLMutations_ProductCategory = {
    createProductCategory: {
        type: GQLObject_ProductCategory,
        args: {
            input: { type: new GraphQLNonNull(GQLInput_ProductCategory) }
        },
        resolve: (_, { input }) => {
            return ProductCategoryController.createProductCategory(input);
        }
    },
    updateProductCategory: {
        type: GQLObject_ProductCategory,
        args: {
            input:  { type: new GraphQLNonNull(GQLInput_ProductCategory) }
        },
        resolve: (_, { input }) => {
            return ProductCategoryController.updateProductCategory(input);
        }
    },
    deleteProductCategory: {
        type: GraphQLBoolean,
        args: {
            id: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { id }) => {
            return ProductCategoryController.deleteProductCategory(id);
        }
    }
}

module.exports = GQLMutations_ProductCategory;
