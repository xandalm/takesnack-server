const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLNonNull, GraphQLList, GraphQLInputObjectType } = require("graphql");
const { GQLScalar_Date } = require("../types");

const GQLObject_Ingredient = new GraphQLObjectType({
    name: 'Ingredient',
    fields: () => ({
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        createdAt: { type: GQLScalar_Date },
        updatedAt: { type: GQLScalar_Date },
        deletedAt: { type: GQLScalar_Date }
    })
})

const GQLObject_IngredientPage = new GraphQLObjectType({
    name: 'IngredientPage',
    fields: () => ({
        rows: { type: new GraphQLNonNull(new GraphQLList(GQLObject_Ingredient)) },
        totalInCondition: { type: GraphQLInt },
        total: { type: GraphQLInt }
    })
})

const GQLInput_Ingredient = new GraphQLInputObjectType({
    name: 'IngredientInput',
    fields: () => ({
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        description: { type: GraphQLString }
    })
})

module.exports = {
    GQLObject_Ingredient,
    GQLObject_IngredientPage,
    GQLInput_Ingredient
}
