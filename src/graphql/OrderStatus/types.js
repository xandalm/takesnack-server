const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLInt, GraphQLNonNull } = require("graphql");
const { GQLScalar_Date } = require("../types");

const GQLObject_OrderStatus = new GraphQLObjectType({
    name: 'OrderStatus',
    fields: () => ({
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        createdAt: { type: GQLScalar_Date }
    })
});

const GQLObject_OrderStatusPage = new GraphQLObjectType({
    name: 'OrderStatusPage',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(GQLObject_OrderStatus)) },
        totalInCondition: { type: GraphQLInt },
        total: { type: GraphQLInt },
    })
})

module.exports = {
    GQLObject_OrderStatus,
    GQLObject_OrderStatusPage
}