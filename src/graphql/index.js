const { GraphQLString } = require("graphql");
const { GraphQLSchema, GraphQLObjectType } = require("graphql");
const GQLMutations_Customer = require("./Customer/mutations");
const GQLQueries_Customer = require("./Customer/queries");
const GQLQueries_CustomerStatus = require("./CustomerStatus/queries");
const GQLQueries_Privilege = require("./Privilege/queries");
const GQLMutations_Product = require("./Product/mutations");
const GQLQueries_Product = require("./Product/queries");
const GQLMutations_ProductCategory = require("./ProductCategory/mutations");
const GQLQueries_ProductCategory = require("./ProductCategory/queries");
const GQLQueries_ProductStatus = require("./ProductStatus/queries");
const GQLMutations_User = require("./User/mutations");
const GQLQueries_User = require("./User/queries");
const GQLMutations_UserRole = require("./UserRole/mutations");
const GQLQueries_UserRole = require("./UserRole/queries");
const GQLQueries_UserStatus = require("./UserStatus/queries");
const GQLQueries_DeliveryType = require("./DeliveryType/queries");
const GQLQueries_OrderStatus = require("./OrderStatus/queries");
const GQLQueries_Order = require("./Order/queries");
const GQLMutations_Order = require("./Order/mutations");

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
            ...GQLQueries_UserRole,
            ...GQLQueries_User,
            ...GQLQueries_CustomerStatus,
            ...GQLQueries_Customer,
            ...GQLQueries_ProductStatus,
            ...GQLQueries_ProductCategory,
            ...GQLQueries_Product,
            ...GQLQueries_DeliveryType,
            ...GQLQueries_OrderStatus,
            ...GQLQueries_Order
        })
    }),
    mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: () => ({
            ...GQLMutations_UserRole,
            ...GQLMutations_User,
            ...GQLMutations_Customer,
            ...GQLMutations_ProductCategory,
            ...GQLMutations_Product,
            ...GQLMutations_Order
        })
    })
})

module.exports = GQLSchema;
