const { Customer } = require("../models/Customer");
const { CustomerStatus } = require("../models/CustomerStatus");
const { Privilege } = require("../models/Privilege");
const { User } = require("../models/User");
const { UserRole } = require("../models/UserRole");
const { Condition } = require("../utils/condition");
const CustomError = require("../utils/errors");
const { JWT } = require("../utils/jwt");
const { OrderBy } = require("../utils/order");

class CustomerControllerClass {

    async createCustomer(accessToken, input) {
        if(!User.hasAdmin)
            throw new CustomError("Uninitialized application");
        if(
            !accessToken || 
            !UserRole.roles.find(r => r.name === accessToken.payload.roles)?.grants.find(g => g.privilege.id === Privilege.WRITE_CUSTOMER)
        )
            throw new CustomError("Unauthorized - missing valid access token");
        var response;
        try {
            const props = Object.assign({}, input);
            const user = new Customer(props);
            if(await user.insert())
                response = user;
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async updateCustomer(accessToken, input) {
        if(!User.hasAdmin)
            throw new CustomError("Uninitialized application");
        if(!accessToken)
            throw new CustomError("Unauthorized - missing valid access token");
        if(accessToken.payload.roles !== 'customer') {
            if(!UserRole.roles.find(r => r.name === accessToken.payload.roles)?.grants.find(g => g.privilege.id === Privilege.WRITE_CUSTOMER))
                throw new CustomError("Unauthorized - missing valid access token");
        } else if(accessToken.payload.sub && accessToken.payload.sub !== input?.id)
            throw new CustomError("Unauthorized - missing valid access token");
        var response;
        try {
            const props = Object.assign({}, input);
            const user = await Customer.get(props?.id);
            if(!user)
                throw new CustomError("Cannot find customer");
            if(props.hasOwnProperty('phoneNumber'))
                user.phoneNumber = props.phoneNumber;
            if(props.hasOwnProperty('name'))
                user.name = props.name;
            if(props.hasOwnProperty('pwd'))
                user.pwd = props.pwd;
            if(props.hasOwnProperty('statusId'))
                user.status = await CustomerStatus.get(props.statusId);
            if(await user.update())
                response = user;
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async deleteCustomer(accessToken, id) {
        if(!User.hasAdmin)
            throw new CustomError("Uninitialized application");
        if(!accessToken)
            throw new CustomError("Unauthorized - missing valid access token");
        if(accessToken.payload.roles !== 'customer') {
            if(!UserRole.roles.find(r => r.name === accessToken.payload.roles)?.grants.find(g => g.privilege.id === Privilege.WRITE_CUSTOMER))
                throw new CustomError("Unauthorized - missing valid access token");
        } else if(accessToken.payload.sub && accessToken.payload.sub !== input?.id)
            throw new CustomError("Unauthorized - missing valid access token");
        var response;
        try {
            const user = await Customer.get(id);
            if(!user)
                throw new CustomError("Cannot find customer");
            if(await user.delete())
                response = user;
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async getCustomer(accessToken, id) {
        if(!User.hasAdmin)
            throw new CustomError("Uninitialized application");
        if(!accessToken)
            throw new CustomError("Unauthorized - missing valid access token");
        var response;
        try {
            response = await Customer.get(id);
        } catch (err) {
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async getAllCustomers(accessToken, { page, limit, where, orderBy }) {
        if(!User.hasAdmin)
            throw new CustomError("Uninitialized application");
        if(
            !accessToken ||
            !UserRole.roles.find(r => r.name === accessToken.payload.roles)?.grants.find(g => g.privilege.id === Privilege.READ_CUSTOMER)
        )
            throw new CustomError("Unauthorized - missing valid access token");
        var response;
        try {
            const condition = Condition.from(where);
            orderBy = OrderBy.from(orderBy);
            response = {
                rows: await Customer.getAll({ page, limit, condition, orderBy }),
                totalInCondition: await Customer.count(condition),
                total: await Customer.count()
            };
        } catch (err) { console.log(err);
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
        return response;
    }

    async fromCredentials(phoneNumber, pwd) {
        if(!User.hasAdmin)
            throw new CustomError("Uninitialized application");
        try {
            phoneNumber = phoneNumber?.trim?.();
            pwd = pwd?.trim?.();
            const customer = await Customer.withCredentials(phoneNumber, pwd);
            if(customer == undefined || customer.deletedAt != null)
                throw new CustomError("Customer not exists");
            else if(customer.status.id === CustomerStatus.INACTIVE)
                throw new CustomError("Customer is inactivated");
            else if(customer.status.id === CustomerStatus.RESTRICTED)
                throw new CustomError("Customer is restricted indefinitely");
            else{
                const jwt = JWT.generate({
                    sub: customer.id,
                    name: customer.name,
                    roles: 'customer'
                })
                return jwt.export();
            }
        } catch (err) { console.log(err);
            if(err instanceof CustomError)
                throw err;
            else
                throw new CustomError("Internal server error");
        }
    }

}

const CustomerController = new CustomerControllerClass;

module.exports = CustomerController;
