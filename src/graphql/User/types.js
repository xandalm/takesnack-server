const { GraphQLObjectType, GraphQLString, GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLNonNull } = require("graphql");
const { GQLScalar_Date } = require("../types");
const { GQLObject_UserRole } = require("../UserRole/types");
const { GQLObject_UserStatus } = require("../UserStatus/types");

const GQLObject_User = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        phoneNumber: { type: GraphQLString },
        name: { type: GraphQLString },
        role: { type: GQLObject_UserRole },
        status: { type: GQLObject_UserStatus },
        createdAt: { type: GQLScalar_Date },
        updatedAt: { type: GQLScalar_Date },
        deletedAt: { type: GQLScalar_Date }
    })
})

const GQLObject_UserPage = new GraphQLObjectType({
    name: 'UserPage',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(GQLObject_User)) },
        totalInCondition: { type: GraphQLInt },
        total: { type: GraphQLInt }
    })
})

const GQLInput_User = new GraphQLInputObjectType({
    name: 'UserInput',
    fields: () => ({
        id: { type: GraphQLString },
        phoneNumber: { type: GraphQLString },
        name: { type: GraphQLString },
        pwd: { type: GraphQLString },
        roleId: { type: GraphQLInt },
        statusId: { type: GraphQLInt }
    })
})

module.exports = {
    GQLObject_User,
    GQLObject_UserPage,
    GQLInput_User
}
