const { GraphQLInt, GraphQLNonNull } = require("graphql");
const UserRoleController = require("../../controllers/UserRoleController");
const { GQLInput_Condition, GQLInput_OrderBy } = require("../types");
const { GQLObject_UserRole, GQLObject_UserRolePage } = require("./types");

const GQLQueries_UserRole = {
    userRoles: {
        type: GQLObject_UserRolePage,
        args: {
            page: { type: GraphQLInt },
            limit: { type: GraphQLInt },
            where: { type: GQLInput_Condition },
            orderBy: { type: GQLInput_OrderBy }
        },
        resolve: (_, args) => {
            return UserRoleController.getAllUserRoles(args);
        }
    },
    userRole: {
        type: GQLObject_UserRole,
        args: {
            id: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { id }) => {
            return UserRoleController.getUserRole(id);
        }
    }
}

module.exports = GQLQueries_UserRole;
