const { GraphQLInt, GraphQLNonNull } = require("graphql");
const PrivilegeController = require("../../controllers/PrivilegeController");
const { GQLInput_Condition, GQLInput_OrderBy } = require("../types");
const { GQLObject_Privilege, GQLObject_PrivilegePage } = require("./types");

const GQLQueries_Privilege = {
    privileges: {
        type: GQLObject_PrivilegePage,
        args: {
            page: { type: GraphQLInt },
            limit: { type: GraphQLInt },
            where: { type: GQLInput_Condition },
            orderBy: { type: GQLInput_OrderBy }
        },
        resolve: (_, args) => {
            return PrivilegeController.getAllPrivileges(args);
        }
    },
    privilege: {
        type: GQLObject_Privilege,
        args: {
            id: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { id }) => {
            return PrivilegeController.getPrivilege(id);
        }
    }
}

module.exports = GQLQueries_Privilege;
