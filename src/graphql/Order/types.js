const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLNonNull, GraphQLList, GraphQLInputObjectType, GraphQLFloat } = require("graphql");
const { GQLObject_Product } = require("../Product/types");
const { GQLObject_OrderStatus } = require("../OrderStatus/types");
const { GQLScalar_Date } = require("../types");
const { GQLObject_Customer } = require("../Customer/types");
const { GQLObject_DeliveryType } = require("../DeliveryType/types");

const GQLObject_OrderItem = new GraphQLObjectType({
    name: 'OrderItem',
    fields: () => ({
        product: { type: new GraphQLNonNull(GQLObject_Product) },
        quantity: { type: new GraphQLNonNull(GraphQLInt) },
        price: { type: new GraphQLNonNull(GraphQLFloat) },
        createdAt: { type: new GraphQLNonNull(GQLScalar_Date) },
        updatedAt: { type: GQLScalar_Date },
        deletedAt: { type: GQLScalar_Date },
    })
})

const GQLObject_Order = new GraphQLObjectType({
    name: 'Order',
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLString) },
        customer: { type: new GraphQLNonNull(GQLObject_Customer) },
        deliveryType: { type: new GraphQLNonNull(GQLObject_DeliveryType) },
        deliveryTo: { type: new GraphQLNonNull(GraphQLString) },
        items: { type: new GraphQLNonNull(new GraphQLList(GQLObject_OrderItem)) },
        total: { type: new GraphQLNonNull(GraphQLFloat) },
        status: { type: new GraphQLNonNull(GQLObject_OrderStatus) },
        createdAt: { type: new GraphQLNonNull(GQLScalar_Date) },
        updatedAt: { type: GQLScalar_Date },
        deletedAt: { type: GQLScalar_Date }
    })
})

const GQLObject_OrderPage = new GraphQLObjectType({
    name: 'OrderPage',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(GQLObject_Order)) },
        totalInCondition: { type: GraphQLInt },
        total: { type: GraphQLInt }
    })
})

const GQLInput_OrderItem = new GraphQLInputObjectType({
    name: 'OrderItemInput',
    fields: () => ({
        orderId: { type: GraphQLString },
        productId: { type: GraphQLString },
        quantity: { type: GraphQLInt },
    })
})

const GQLInput_Order = new GraphQLInputObjectType({
    name: 'OrderInput',
    fields: () => ({
        id: { type: GraphQLString },
        customerId: { type: GraphQLString },
        deliveryTypeId: { type: GraphQLInt },
        deliveryTo: { type: GraphQLString },
        items: { type: new GraphQLList(GQLInput_OrderItem) },
        statusId: { type: GraphQLInt }
    })
})

const GQLInput_Order_NoItems = new GraphQLInputObjectType({
    name: 'UpdateOrderInput',
    fields: () => ({
        id: { type: GraphQLString },
        customerId: { type: GraphQLString },
        deliveryTypeId: { type: GraphQLInt },
        deliveryTo: { type: GraphQLString },
        statusId: { type: GraphQLInt }
    })
})

module.exports = {
    GQLObject_Order,
    GQLObject_OrderPage,
    GQLInput_Order,
    GQLInput_Order_NoItems,
    GQLInput_OrderItem,
    GQLObject_OrderItem
}
