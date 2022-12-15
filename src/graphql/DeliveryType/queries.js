const { GraphQLInt, GraphQLNonNull } = require("graphql");
const DeliveryTypeController = require("../../controllers/DeliveryTypeController");
const { GQLInput_Condition, GQLInput_OrderBy } = require("../types");
const { GQLObject_DeliveryType, GQLObject_DeliveryTypePage } = require("./types");

const GQLQueries_DeliveryType = {
    deliveryTypes: {
        type: GQLObject_DeliveryTypePage,
        args: {
            page: { type: GraphQLInt },
            limit: { type: GraphQLInt },
            where: { type: GQLInput_Condition },
            orderBy: { type: GQLInput_OrderBy }
        },
        resolve: (_, args) => {
            return DeliveryTypeController.getAllDeliveryTypes(args);
        }
    },
    deliveryType: {
        type: GQLObject_DeliveryType,
        args: {
            id: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { id }) => {
            return DeliveryTypeController.getDeliveryType(id);
        }
    }
}

module.exports = GQLQueries_DeliveryType;
