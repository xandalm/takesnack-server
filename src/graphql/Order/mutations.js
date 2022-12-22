const { GraphQLInt, GraphQLBoolean, GraphQLNonNull, GraphQLString } = require("graphql");
const OrderController = require("../../controllers/OrderController");
const { GQLObject_Order, GQLInput_Order, GQLObject_OrderItem, GQLInput_Order_NoItems } = require("./types");

const GQLMutations_Order = {
    createOrder: {
        type: GQLObject_Order,
        args: {
            input: { type: new GraphQLNonNull(GQLInput_Order) }
        },
        resolve: (_, { input }, { token }) => {
            return OrderController.createOrder(token, input);
        }
    },
    updateOrder: {
        type: GQLObject_Order,
        args: {
            input:  { type: new GraphQLNonNull(GQLInput_Order_NoItems) }
        },
        resolve: (_, { input }, { token }) => {
            return OrderController.updateOrder(token, input);
        }
    },
    deleteOrder: {
        type: GQLObject_Order,
        args: {
            id: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, { id }, { token }) => {
            return OrderController.deleteOrder(token, id);
        }
    },
    addOrderItem: {
        type: GQLObject_OrderItem,
        args: {
            orderId: { type: new GraphQLNonNull(GraphQLString) },
            productId: { type: new GraphQLNonNull(GraphQLString) },
            quantity: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { orderId, productId, quantity }, { token }) => {
            return OrderController.addOrderItem(token, orderId, productId, quantity);
        }
    },
    updateOrderItemQuantity: {
        type: GQLObject_OrderItem,
        args: {
            orderId: { type: new GraphQLNonNull(GraphQLString) },
            productId: { type: new GraphQLNonNull(GraphQLString) },
            quantity: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { orderId, productId, quantity }, { token }) => {
            return OrderController.updateOrderItem(token, orderId, productId, quantity);
        }
    },
    removeOrderItem: {
        type: GraphQLBoolean,
        args: {
            orderId: { type: new GraphQLNonNull(GraphQLString) },
            productId: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: (_, { orderId, productId }, { token }) => {
            return OrderController.removeOrderItem(token, orderId, productId);
        }
    }
}

module.exports = GQLMutations_Order;
