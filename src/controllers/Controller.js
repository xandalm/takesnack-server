const { User } = require("../models/User");
const { UserRole } = require("../models/UserRole");
const CustomError = require("../utils/errors");
const { JWT } = require("../utils/jwt");

class Controller {

    assertInitializedApp() {
        if(!User.hasAdmin)
            throw new CustomError("Uninitialized application");
        return true;
    }

    assertTokenType(tk) {
        if(tk && !(tk instanceof JWT))
            throw new TypeError("Access token must be JWT type");
        return true;
    }

    assertTrustToken(tk) {
        if(!tk?.check())
            throw new CustomError("Unauthorized - missing valid access token");
        return true;
    }

    assertPrivilegeGranted(tk, privilege) {
        if(!UserRole.roles.find(r => r.name === tk.payload.roles)?.grants.find(g => g.privilege.id === privilege))
            throw new CustomError("Unauthorized - missing valid access token");
        return true;
    }

}

module.exports = Controller;
