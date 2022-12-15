const { GraphQLInt, GraphQLNonNull } = require("graphql");
const OrderStatusController = require("../../controllers/OrderStatusController");
const { GQLInput_Condition, GQLInput_OrderBy } = require("../types");
const { GQLObject_OrderStatus, GQLObject_OrderStatusPage } = require("./types");

const GQLQueries_OrderStatus = {
    orderStatuses: {
        type: GQLObject_OrderStatusPage,
        args: {
            page: { type: GraphQLInt },
            limit: { type: GraphQLInt },
            where: { type: GQLInput_Condition },
            orderBy: { type: GQLInput_OrderBy }
        },
        resolve: (_, args) => {
            return OrderStatusController.getAllOrderStatuses(args);
        }
    },
    orderStatus: {
        type: GQLObject_OrderStatus,
        args: {
            id: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { id }) => {
            return OrderStatusController.getOrderStatus(id);
        }
    }
}

module.exports = GQLQueries_OrderStatus;