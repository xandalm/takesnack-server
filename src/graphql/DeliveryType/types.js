const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLInt, GraphQLNonNull } = require("graphql");
const { GQLScalar_Date } = require("../types");

const GQLObject_DeliveryType = new GraphQLObjectType({
    name: 'DeliveryType',
    fields: () => ({
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        createdAt: { type: GQLScalar_Date }
    })
});

const GQLObject_DeliveryTypePage = new GraphQLObjectType({
    name: 'DeliveryTypePage',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(GQLObject_DeliveryType)) },
        totalInCondition: { type: GraphQLInt },
        total: { type: GraphQLInt },
    })
})

module.exports = {
    GQLObject_DeliveryType,
    GQLObject_DeliveryTypePage
}