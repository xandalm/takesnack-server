const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLInt, GraphQLNonNull } = require("graphql");
const { GQLScalar_Date } = require("../types");

const GQLObject_ProductStatus = new GraphQLObjectType({
    name: 'ProductStatus',
    fields: () => ({
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        createdAt: { type: GQLScalar_Date }
    })
});

const GQLObject_ProductStatusPage = new GraphQLObjectType({
    name: 'ProductStatusPage',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(GQLObject_ProductStatus)) },
        totalInCondition: { type: GraphQLInt },
        total: { type: GraphQLInt },
    })
})

module.exports = {
    GQLObject_ProductStatus,
    GQLObject_ProductStatusPage
}