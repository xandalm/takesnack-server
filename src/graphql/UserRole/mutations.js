const { GraphQLInt, GraphQLBoolean, GraphQLNonNull } = require("graphql");
const UserRoleController = require("../../controllers/UserRoleController");
const { GQLObject_UserRole, GQLInput_UserRole, GQLObject_UserRoleGrant } = require("./types");

const GQLMutations_UserRole = {
    createUserRole: {
        type: GQLObject_UserRole,
        args: {
            input: { type: new GraphQLNonNull(GQLInput_UserRole) }
        },
        resolve: (_, { input }) => {
            return UserRoleController.createUserRole(input);
        }
    },
    updateUserRole: {
        type: GQLObject_UserRole,
        args: {
            input:  { type: new GraphQLNonNull(GQLInput_UserRole) }
        },
        resolve: (_, { input }) => {
            return UserRoleController.updateUserRole(input);
        }
    },
    deleteUserRole: {
        type: GQLObject_UserRole,
        args: {
            id: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { id }) => {
            return UserRoleController.deleteUserRole(id);
        }
    },
    grantPrivilege: {
        type: GQLObject_UserRoleGrant,
        args: {
            roleId: { type: new GraphQLNonNull(GraphQLInt) },
            privilegeId: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { roleId, privilegeId }) => {
            return UserRoleController.grantPrivilege(roleId, privilegeId);
        }
    },
    removePrivilege: {
        type: GraphQLBoolean,
        args: {
            roleId: { type: new GraphQLNonNull(GraphQLInt) },
            privilegeId: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve: (_, { roleId, privilegeId }) => {
            return UserRoleController.removePrivilege(roleId, privilegeId);
        }
    }
}

module.exports = GQLMutations_UserRole;
