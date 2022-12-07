const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLNonNull, GraphQLList, GraphQLInputObjectType } = require("graphql");
const { GQLScalar_Date } = require("../types");

const GQLObject_ProductCategory = new GraphQLObjectType({
    name: 'ProductCategory',
    fields: () => ({
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        createdAt: { type: GQLScalar_Date },
        updatedAt: { type: GQLScalar_Date },
        deletedAt: { type: GQLScalar_Date }
    })
})

const GQLObject_ProductCategoryPage = new GraphQLObjectType({
    name: 'ProductCategoryPage',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(GQLObject_ProductCategory)) },
        totalInCondition: { type: GraphQLInt },
        total: { type: GraphQLInt }
    })
})

const GQLInput_ProductCategory = new GraphQLInputObjectType({
    name: 'ProductCategoryInput',
    fields: () => ({
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        description: { type: GraphQLString }
    })
})

module.exports = {
    GQLObject_ProductCategory,
    GQLObject_ProductCategoryPage,
    GQLInput_ProductCategory
}
