const { GraphQLInt, GraphQLNonNull, GraphQLString } = require("graphql");
const OrderController = require("../../controllers/OrderController");
const { GQLInput_Condition, GQLInput_OrderBy } = require("../types");
const { GQLObject_Order, GQLObject_OrderPage } = require("./types");

const GQLQueries_Order = {
    orders: {
        type: GQLObject_OrderPage,
        args: {
            page: { type: GraphQLInt },
            limit: { type: GraphQLInt },
            where: { type: GQLInput_Condition },
            orderBy: { type: GQLInput_OrderBy }
        },
        resolve: (_, args) => {
            return OrderController.getAllOrders(args);
        }
    },
    order: {
        type: GQLObject_Order,
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, { id }) => {
            return OrderController.getOrder(id);
        }
    }
}

module.exports = GQLQueries_Order;
