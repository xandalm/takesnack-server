const { GraphQLInt, GraphQLNonNull } = require("graphql");
const CustomerStatusController = require("../../controllers/CustomerStatusController");
const { GQLInput_Condition, GQLInput_OrderBy } = require("../types");
const { GQLObject_CustomerStatus, GQLObject_CustomerStatusPage } = require("./types");

const GQLQueries_CustomerStatus = {
    customerStatuses: {
        type: GQLObject_CustomerStatusPage,
        args: {
            page: { type: GraphQLInt },
            limit: { type: GraphQLInt },
            where: { type: GQLInput_Condition },
            orderBy: { type: GQLInput_OrderBy }
        },
        resolve: (_, args, { token }) => {
            return CustomerStatusController.getAllCustomerStatuses(token, args);
        }
    },
    customerStatus: {
        type: GQLObject_CustomerStatus,
        args: {
            id: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { id }, { token }) => {
            return CustomerStatusController.getCustomerStatus(token, id);
        }
    }
}

module.exports = GQLQueries_CustomerStatus;
