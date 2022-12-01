const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLInt, GraphQLNonNull } = require("graphql");
const { GQLScalar_Date } = require("../types");

const GQLObject_CustomerStatus = new GraphQLObjectType({
    name: 'CustomerStatus',
    fields: () => ({
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        createdAt: { type: GQLScalar_Date }
    })
});

const GQLObject_CustomerStatusPage = new GraphQLObjectType({
    name: 'CustomerStatusPage',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(GQLObject_CustomerStatus)) },
        totalInCondition: { type: GraphQLInt },
        total: { type: GraphQLInt },
    })
})

module.exports = {
    GQLObject_CustomerStatus,
    GQLObject_CustomerStatusPage
}