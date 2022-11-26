const { GraphQLString } = require("graphql");
const { GraphQLSchema, GraphQLObjectType } = require("graphql");
const GQLQueries_Privilege = require("./Privilege/queries");
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
            ...GQLQueries_UserStatus
        })
    })/* ,
    mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: () => ({
        })
    }) */
})

module.exports = GQLSchema;
