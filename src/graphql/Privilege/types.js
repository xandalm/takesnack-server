const { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLInt, GraphQLNonNull, GraphQLInputObjectType } = require("graphql");
const { GQLScalar_Date } = require("../types");

const GQLObject_Privilege = new GraphQLObjectType({
    name: 'Privilege',
    fields: () => ({
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        createdAt: { type: GQLScalar_Date }
    })
});

const GQLObject_PrivilegePage = new GraphQLObjectType({
    name: 'PrivilegesPage',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(GQLObject_Privilege)) },
        totalInCondition: { type: GraphQLInt },
        total: { type: GraphQLInt },
    })
})

module.exports = {
    GQLObject_Privilege,
    GQLObject_PrivilegePage
}