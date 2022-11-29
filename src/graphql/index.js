const { GraphQLString } = require("graphql");
const { GraphQLSchema, GraphQLObjectType } = require("graphql");
const GQLQueries_Privilege = require("./Privilege/queries");
const GQLMutations_UserRole = require("./UserRole/mutations");
const GQLQueries_UserRole = require("./UserRole/queries");
const GQLQueries_UserStatus = require("./UserStatus/queries");

const GQLSchema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        fields: () => ({
            happy: {
                type: GraphQLString,
                resolve: (_) => ':D'
            },
            ...GQLQueries_Privilege,
            ...GQLQueries_UserStatus,
            ...GQLQueries_UserRole
        })
    }),
    mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: () => ({
            ...GQLMutations_UserRole
        })
    })
})

module.exports = GQLSchema;
