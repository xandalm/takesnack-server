const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLNonNull, GraphQLList, GraphQLInputObjectType, GraphQLFloat } = require("graphql");
const { GQLObject_Ingredient } = require("../Ingredient/types");
const { GQLObject_ProductCategory } = require("../ProductCategory/types");
const { GQLObject_ProductStatus } = require("../ProductStatus/types");
const { GQLScalar_Date } = require("../types");

const GQLObject_ProductIngredient = new GraphQLObjectType({
    name: 'ProductIngredient',
    fields: () => ({
        ingredient: { type: new GraphQLNonNull(GQLObject_Ingredient) },
        quantity: { type: new GraphQLNonNull(GraphQLInt) },
        createdAt: { type: GQLScalar_Date },
        updatedAt: { type: GQLScalar_Date },
        deletedAt: { type: GQLScalar_Date },
    })
})

const GQLObject_Product = new GraphQLObjectType({
    name: 'Product',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        price: { type: GraphQLFloat },
        category: { type: GQLObject_ProductCategory },
        ingredients: { type: new GraphQLNonNull(new GraphQLList(GQLObject_ProductIngredient)) },
        status: { type: GQLObject_ProductStatus },
        createdAt: { type: GQLScalar_Date },
        updatedAt: { type: GQLScalar_Date },
        deletedAt: { type: GQLScalar_Date }
    })
})

const GQLObject_ProductPage = new GraphQLObjectType({
    name: 'ProductPage',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(GQLObject_Product)) },
        totalInCondition: { type: GraphQLInt },
        total: { type: GraphQLInt }
    })
})

const GQLInput_Product = new GraphQLInputObjectType({
    name: 'ProductInput',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        price: { type: GraphQLFloat },
        categoryId: { type: GraphQLInt },
        statusId: { type: GraphQLInt }
    })
})

module.exports = {
    GQLObject_Product,
    GQLObject_ProductPage,
    GQLInput_Product,
    GQLObject_ProductIngredient
}
