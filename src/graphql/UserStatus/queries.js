const { GraphQLInt, GraphQLNonNull } = require("graphql");
const UserStatusController = require("../../controllers/UserStatusController");
const { GQLInput_Condition, GQLInput_OrderBy } = require("../types");
const { GQLObject_UserStatus, GQLObject_UserStatusPage } = require("./types");

const GQLQueries_UserStatus = {
    userStatuses: {
        type: GQLObject_UserStatusPage,
        args: {
            page: { type: GraphQLInt },
            limit: { type: GraphQLInt },
            where: { type: GQLInput_Condition },
            orderBy: { type: GQLInput_OrderBy }
        },
        resolve: (_, args, { token }) => {
            return UserStatusController.getAllUserStatuses(token, args);
        }
    },
    userStatus: {
        type: GQLObject_UserStatus,
        args: {
            id: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { id }, { token }) => {
            return UserStatusController.getUserStatus(token, id);
        }
    }
}

module.exports = GQLQueries_UserStatus;
