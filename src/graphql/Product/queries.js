const { GraphQLInt, GraphQLNonNull, GraphQLString } = require("graphql");
const ProductController = require("../../controllers/ProductController");
const { GQLInput_Condition, GQLInput_OrderBy } = require("../types");
const { GQLObject_Product, GQLObject_ProductPage } = require("./types");

const GQLQueries_Product = {
    products: {
        type: GQLObject_ProductPage,
        args: {
            page: { type: GraphQLInt },
            limit: { type: GraphQLInt },
            where: { type: GQLInput_Condition },
            orderBy: { type: GQLInput_OrderBy }
        },
        resolve: (_, args) => {
            return ProductController.getAllProducts(args);
        }
    },
    product: {
        type: GQLObject_Product,
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, { id }) => {
            return ProductController.getProduct(id);
        }
    }
}

module.exports = GQLQueries_Product;
