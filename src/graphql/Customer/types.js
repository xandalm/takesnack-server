const { GraphQLObjectType, GraphQLString, GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLNonNull } = require("graphql");
const { GQLScalar_Date } = require("../types");
const { GQLObject_CustomerStatus } = require("../CustomerStatus/types");

const GQLObject_Customer = new GraphQLObjectType({
    name: 'Customer',
    fields: () => ({
        id: { type: GraphQLString },
        phoneNumber: { type: GraphQLString },
        name: { type: GraphQLString },
        status: { type: GQLObject_CustomerStatus },
        createdAt: { type: GQLScalar_Date },
        updatedAt: { type: GQLScalar_Date },
        deletedAt: { type: GQLScalar_Date }
    })
})

const GQLObject_CustomerPage = new GraphQLObjectType({
    name: 'CustomerPage',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(GQLObject_Customer)) },
        totalInCondition: { type: GraphQLInt },
        total: { type: GraphQLInt }
    })
})

const GQLInput_Customer = new GraphQLInputObjectType({
    name: 'CustomerInput',
    fields: () => ({
        id: { type: GraphQLString },
        phoneNumber: { type: GraphQLString },
        name: { type: GraphQLString },
        pwd: { type: GraphQLString },
        statusId: { type: GraphQLInt }
    })
})

module.exports = {
    GQLObject_Customer,
    GQLObject_CustomerPage,
    GQLInput_Customer
}
