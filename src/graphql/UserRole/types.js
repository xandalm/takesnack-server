const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLNonNull, GraphQLList, GraphQLInputObjectType } = require("graphql");
const { GQLObject_Privilege } = require("../Privilege/types");
const { GQLScalar_Date } = require("../types");

const GQLObject_UserRoleGrant = new GraphQLObjectType({
    name: 'UserRoleGrant',
    fields: () => ({
        privilege: { type: new GraphQLNonNull(GQLObject_Privilege) },
        createdAt: { type: GQLScalar_Date },
        deletedAt: { type: GQLScalar_Date },
    })
})

const GQLObject_UserRole = new GraphQLObjectType({
    name: 'UserRole',
    fields: () => ({
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        grants: { type: new GraphQLNonNull(new GraphQLList(GQLObject_UserRoleGrant)) },
        createdAt: { type: GQLScalar_Date },
        updatedAt: { type: GQLScalar_Date },
        deletedAt: { type: GQLScalar_Date }
    })
})

const GQLObject_UserRolePage = new GraphQLObjectType({
    name: 'UserRolePage',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(GQLObject_UserRole)) },
        totalInCondition: { type: GraphQLInt },
        total: { type: GraphQLInt }
    })
})

const GQLInput_UserRole = new GraphQLInputObjectType({
    name: 'UserRoleInput',
    fields: () => ({
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        description: { type: GraphQLString }
    })
})

module.exports = {
    GQLObject_UserRole,
    GQLObject_UserRolePage,
    GQLInput_UserRole,
    GQLObject_UserRoleGrant
}
