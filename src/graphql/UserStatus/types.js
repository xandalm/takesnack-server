const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLInt, GraphQLNonNull } = require("graphql");
const { GQLScalar_Date } = require("../types");

const GQLObject_UserStatus = new GraphQLObjectType({
    name: 'UserStatus',
    fields: () => ({
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        createdAt: { type: GQLScalar_Date }
    })
});

const GQLObject_UserStatusPage = new GraphQLObjectType({
    name: 'UserStatusPage',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(GQLObject_UserStatus)) },
        totalInCondition: { type: GraphQLInt },
        total: { type: GraphQLInt },
    })
})

module.exports = {
    GQLObject_UserStatus,
    GQLObject_UserStatusPage
}