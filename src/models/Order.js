const { v4:uuid } = require('uuid');
const { isDevelopment } = require('../config/server.config');
const connection = require('../database/connection');
const CustomError = require("../utils/errors");
const { Customer } = require("./Customer");
const { DeliveryType } = require("./DeliveryType");
const Model = require("./model");
const { OrderStatus } = require("./OrderStatus");
const { Product } = require("./Product");
const { SqliteError } = require("better-sqlite3");
const FieldRewriter = require('../utils/field-rewriter');

class Order extends Model {
    
    static _tablename_ = 'Order';
    static _filterable_ = [ 'id', 'customer', 'deliveryType', 'status', 'total', 'createdAt', 'updatedAt', 'deletedAt' ];
    static _sortable_ = [ 'createdAt', 'updatedAt', 'deletedAt' ];

    static fieldRewriter = new FieldRewriter();
    
    static {
        this.fieldRewriter.add('id', `${this._tablename_}.id`, `${this._tablename_}_id`);
        this.fieldRewriter.add('customer', `${this._tablename_}.customer`, `${this._tablename_}_customer`);
        this.fieldRewriter.add('total', `${this._tablename_}.total`, `${this._tablename_}_total`);
        this.fieldRewriter.add('status', `${this._tablename_}.status`, `${this._tablename_}_status`);
        this.fieldRewriter.add('deliveryType', `${this._tablename_}.deliveryType`, `${this._tablename_}_deliveryType`);
        this.fieldRewriter.add('deliveryTo', `${this._tablename_}.deliveryTo`, `${this._tablename_}_deliveryTo`);
        this.fieldRewriter.add('createdAt', `${this._tablename_}.createdAt`, `${this._tablename_}_createdAt`);
        this.fieldRewriter.add('updatedAt', `${this._tablename_}.updatedAt`, `${this._tablename_}_updatedAt`);
        this.fieldRewriter.add('deletedAt', `${this._tablename_}.deletedAt`, `${this._tablename_}_deletedAt`);
    }

    #wasEdited = true;
    #isTrusted = false;

    #props = {
        id: null,
        customer: null,
        deliveryType: null, // table | address
        deliveryTo: null, // string
        items: null,
        total: null,
        status: null,
        createdAt: null,
        updatedAt: null,
        deletedAt: null
    };

    constructor(props) {
        super();
        this.customer = props?.customer;
        this.deliveryType = props?.deliveryType;
        this.deliveryTo = props?.deliveryTo;
    }

    set customer(value) {
        if(value == undefined)
            this.#props.customer = null;
        else {
            if(!(value instanceof Customer))
                throw new TypeError("Must be Customer type");
            this.#props.customer = value;
        }
        this.#wasEdited = true;
    }

    set deliveryType(value) {
        if(value == undefined)
            this.#props.deliveryType = null;
        else {
            if(!(value instanceof DeliveryType))
                throw new TypeError("Must be DeliveryType type");
            this.#props.deliveryType = value;
        }
        this.#wasEdited = true;
    }

    set deliveryTo(value) {
        if(value == undefined)
            this.#props.deliveryTo = null;
        else {
            if(typeof(value) !== 'string')
                throw new TypeError("Must be string type");
            this.#props.deliveryTo = value;
        }
        this.#wasEdited = true;
    }

    set status(value) {
        if(value == undefined)
            this.#props.status = null;
        else {
            if(!(value instanceof OrderStatus))
                throw new TypeError("Must be OrderStatus type");
            this.#props.status = value;
        }
        this.#wasEdited = true;
    }

    get wasEdited() { return this.#wasEdited; }
    get isTrusted() { return this.#isTrusted; }

    get id() { return this.#props.id }
    get customer() { return this.#props.customer }
    get deliveryType() { return this.#props.deliveryType }
    get deliveryTo() { return this.#props.deliveryTo }
    get items() {
        if(this.#props.items != null)
            return this.#props.items;
        return (async (role) => {
            role.#props.items = await OrderItem.getOrderProducts(this.id);
            return role.#props.items;
        })(this);
    }
    get total() { return this.#props.total }
    get status() { return this.#props.status }
    get createdAt() { return this.#props.createdAt }
    get updatedAt() { return this.#props.updatedAt }
    get deletedAt() { return this.#props.deletedAt }

    _fromDB(obj) {
        // if it doesn't have id then it doesn't exist, so it's null
        if(obj == undefined || obj[`${Order._tablename_}_id`] == undefined)
            return null;
        this.#props = {
            id: obj[`${Order._tablename_}_id`],
            customer: obj.customer,
            deliveryType: obj.deliveryType,
            deliveryTo: obj[`${Order._tablename_}_deliveryTo`],
            total: obj[`${Order._tablename_}_total`],
            status: obj.status,
            createdAt: obj[`${Order._tablename_}_createdAt`],
            updatedAt: obj[`${Order._tablename_}_updatedAt`],
            deletedAt: obj[`${Order._tablename_}_deletedAt`]
        };
        this.#props.createdAt = this.createdAt!=undefined? new Date(this.createdAt): this.createdAt;
        this.#props.updatedAt = this.updatedAt!=undefined? new Date(this.updatedAt): this.updatedAt;
        this.#props.deletedAt = this.deletedAt!=undefined? new Date(this.deletedAt): this.deletedAt;
        this.#wasEdited = false;
        this.#isTrusted = true;
        return this;
    }

    fromJSON() {
        this.id
    }

    toJSON() {
        return {
            ...this.#props
        }
    }

    static async count(condition) {
        var res;
        try {
            const { where } = this._prepareQueryConfig({ condition });
            var [{count}] = await connection(this._tablename_)
                .whereRaw(where.statement, where.params)
                .count({ count: 'id' });
            res = count;
        } catch(err) {
            if(isDevelopment) console.log(err);
            if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
            else
                throw err;
        }
        return res;
    }

    static async get(id) {
        var res;
        try {
            if(!id)
                throw new CustomError("Order id is required");
            var data = await connection.with('A', (c) => {
                c.select(Order.fieldRewriter.transform.all())
                .from(Order._tablename_)
                .where({ id })
            })
            .select(
                this.fieldRewriter.alias.all().concat(
                    Customer.fieldRewriter.transform.all(),
                    DeliveryType.fieldRewriter.transform.all(),
                    OrderStatus.fieldRewriter.transform.all()
                )
            )
            .from('A')
            .join(Customer._tablename_, this.fieldRewriter.aliases.customer, Customer.fieldRewriter.absolutes.id)
            .join(DeliveryType._tablename_, this.fieldRewriter.aliases.deliveryType, DeliveryType.fieldRewriter.absolutes.id)
            .join(OrderStatus._tablename_, this.fieldRewriter.aliases.status, OrderStatus.fieldRewriter.absolutes.id)
            .first();
            if(data)
                res = (new Order)._fromDB({
                    ...data,
                    customer: (new Customer)._fromDB(data),
                    deliveryType: (new DeliveryType)._fromDB(data),
                    status: (new OrderStatus)._fromDB(data)
                });
        } catch(err) {
            if(isDevelopment) console.log(err);
            if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
            else
                throw err;
        }
        return res;
    }

    static async getAll(config = {}) {
        var res = [];
        try {
            const { limit, offset, where, orderBy } = this._prepareQueryConfig(config);
            var data = await connection.with('A', (c) => {
                c.select(Order.fieldRewriter.transform.all())
                .from(Order._tablename_)
                .whereRaw(where.statement, where.params)
                .orderBy(orderBy)
                .limit(limit)
                .offset(offset)
            })
            .select(
                this.fieldRewriter.alias.all().concat(
                    Customer.fieldRewriter.transform.all(),
                    DeliveryType.fieldRewriter.transform.all(),
                    OrderStatus.fieldRewriter.transform.all()
                )
            )
            .from('A')
            .join(Customer._tablename_, this.fieldRewriter.aliases.customer, Customer.fieldRewriter.absolutes.id)
            .join(DeliveryType._tablename_, this.fieldRewriter.aliases.deliveryType, DeliveryType.fieldRewriter.absolutes.id)
            .join(OrderStatus._tablename_, this.fieldRewriter.aliases.status, OrderStatus.fieldRewriter.absolutes.id);

            res = Array.from(data).map(async e => (new Order)._fromDB({
                ...e,
                customer: (new Customer)._fromDB(e),
                deliveryType: (new DeliveryType)._fromDB(e),
                status: (new OrderStatus)._fromDB(e)
            }));
        } catch(err) {
            if(isDevelopment) console.log(err);
            if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
            else
                throw err;
        }
        return res;
    }

    isValid() {
        if(!this.customer)
            throw new CustomError("'customer' is required");
        if(!this.deliveryType)
            throw new CustomError("'deliveryType' is required");
        if(!this.deliveryTo)
            throw new CustomError("'deliveryTo' is required");
        if(!this.status)
            throw new CustomError("'status' is required");
        return true;
    }

    async insert() {
        var res = false;
        if(this.isTrusted)
            throw new TypeError("Replication error");
        this.status = await OrderStatus.get(OrderStatus.IN_QUEUE);
        this.isValid();
        try {
            this.#props.id = uuid();
            this.#props.createdAt = new Date;
            this.#props.total = 0.0;
            await connection(Order._tablename_)
                .insert({
                    id: this.#props.id,
                    customer: this.#props.customer.id,
                    deliveryType: this.#props.deliveryType.id,
                    deliveryTo: this.#props.deliveryTo,
                    total: this.#props.total,
                    status: this.#props.status.id,
                    createdAt: this.#props.createdAt
                });
            this.#isTrusted = true;
            res = true;
        } catch (err) {
            if(isDevelopment) console.log(err);
            if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
            else
                throw err;
        }
        return res;
    }

    async update() {
        var res = false;
        if(!this.isTrusted)
            throw new TypeError("Order is unreliable, please load it from database first");
        if(!this.wasEdited)
            throw new TypeError("Nothing to update");
        this.isValid();
        try {
            var [found] = await connection(Order._tablename_)
                .select(Order.fieldRewriter.absolutes.status)
                .where({ id: this.#props.id, deletedAt: null });
            if(!found)
                throw new CustomError("Order not exist");
            else if((found.deliveryType !== this.#props.deliveryType || found.deliveryTo !== this.#props.deliveryTo) && [OrderStatus.DELIVERED, OrderStatus.PAID_OUT].includes(found.status))
                throw new CustomError("Order already delivered");
            this.#props.updatedAt = new Date;
            await connection(Order._tablename_)
                .update({
                    deliveryType: this.#props.deliveryType.id,
                    deliveryTo: this.#props.deliveryTo,
                    status: this.#props.status.id,
                    updatedAt: this.#props.updatedAt
                })
                .where({ id: this.#props.id });
            res = true;
        } catch (err) {
            if(isDevelopment) console.log(err);
            if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
            else
                throw err;
        }
        return res;
    }

    async delete() {
        var res = false;
        if(!this.isTrusted)
            throw new TypeError("Order is unreliable, please load it from database first");
        try {
            var [found] = await connection(Order._tablename_)
                .select(Order.fieldRewriter.absolutes.status)
                .where({ id: this.#props.id, deletedAt: null });
            if(!found)
                throw new CustomError("Order not exist");
            if(found.status !== OrderStatus.IN_QUEUE)
                throw new CustomError("Cannot delete order after it's no longer in queue");
            else {
                this.#props.deletedAt = this.#props.deletedAt??new Date;
                await connection(Order._tablename_)
                    .update({
                        deletedAt: this.#props.deletedAt
                    })
                    .where({ id: this.#props.id });
                res = true;
            }
        } catch(err) {
            if(isDevelopment) console.log(err);
            if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
            else
                throw err;
        }
        return res;
    }
}

class OrderItem extends Model {

    static _tablename_ = 'OrderItem';

    #wasEdited = true;
    #isTrusted = false;

    #props={
        order: null,
        product: null,
        quantity: null,
        price: null,
        createdAt: null,
        updatedAt: null,
        deletedAt: null
    };

    static fieldRewriter = new FieldRewriter();

    static {
        this.fieldRewriter.add('order', `${this._tablename_}.order`, `${this._tablename_}_order`);
        this.fieldRewriter.add('product', `${this._tablename_}.product`, `${this._tablename_}_product`);
        this.fieldRewriter.add('quantity', `${this._tablename_}.quantity`, `${this._tablename_}_quantity`);
        this.fieldRewriter.add('price', `${this._tablename_}.price`, `${this._tablename_}_price`);
        this.fieldRewriter.add('createdAt', `${this._tablename_}.createdAt`, `${this._tablename_}_createdAt`);
        this.fieldRewriter.add('updatedAt', `${this._tablename_}.updatedAt`, `${this._tablename_}_updatedAt`);
        this.fieldRewriter.add('deletedAt', `${this._tablename_}.deletedAt`, `${this._tablename_}_deletedAt`);
    }

    constructor(props) {
        super();
        this.order = props?.order;
        this.product = props?.product;
        this.quantity = props?.quantity;
    }

    set order(value) {
        if(value == undefined)
            this.#props.order = null;
        else {
            if(!value instanceof Order)
                throw new Error("'value' must be Order type");
            this.#props.order = value;
        }
        this.#wasEdited = true;
    }

    set product(value) {
        if(value == undefined)
            this.#props.product = null;
        else {
            if(!(value instanceof Product))
                throw new TypeError("'value' must be Product type");
            this.#props.product = value;
        }
        this.#wasEdited = true;
    }

    set quantity(value) {
        if(value == undefined)
            this.#props.quantity = null;
        else {
            if(typeof(value) !== 'number' && Number.isInteger(value) && value > 0)
                throw new TypeError("'value' must be positive integer type");
            this.#props.quantity = value;
        }
        this.#wasEdited = true;
    }

    get wasEdited() { return this.#wasEdited }
    get isTrusted() { return this.#isTrusted }

    get order() { return this.#props.order }
    get product() { return this.#props.product }
    get quantity() { return this.#props.quantity }
    get price() { return this.#props.price }
    get createdAt() { return this.#props.createdAt }
    get updatedAt() { return this.#props.updatedAt }
    get deletedAt() { return this.#props.deletedAt }

    _fromDB(obj) {
        if(obj.order != null && !obj instanceof Order)
            throw new Error("Order must be resolved before");
        if(obj.product != null && !(obj.product instanceof Product))
            throw new Error("Product must be resolved before");
        this.#props = {
            order: obj?.order,
            product: obj?.product,
            quantity: obj['OrderItem_quantity'],
            price: obj['OrderItem_price'],
            createdAt: obj['OrderItem_createdAt'],
            updatedAt: obj['OrderItem_updatedAt'],
            deletedAt: obj['OrderItem_deletedAt']
        };
        this.#props.createdAt = this.createdAt? new Date(this.createdAt): this.createdAt;
        this.#props.updatedAt = this.updatedAt? new Date(this.updatedAt): this.updatedAt;
        this.#props.deletedAt = this.deletedAt? new Date(this.deletedAt): this.deletedAt;
        this.#wasEdited = false;
        this.#isTrusted = true;
        return this;
    }

    toJSON() {
        return {
            ...this.#props
        }
    }

    static async getOrderProducts(orderId) {
        var res = [];
        try {
            const order = await Order.get(orderId);
            if(!order)
                throw new CustomError("The order doesn't exist");
            var data = await connection.with('A', (c) => {
                c.select(OrderItem.fieldRewriter.transform.all())
                .from(OrderItem._tablename_)
                .where({ order: orderId, deletedAt: null })
            })
            .select(OrderItem.fieldRewriter.alias.all().concat(
                Product.fieldRewriter.transform.all()
            ))
            .from('A')
            .innerJoin(
                Product._tablename_,
                OrderItem.fieldRewriter.aliases.product,
                Product.fieldRewriter.absolutes.id
            );
            res = Array.from(data).map(e => (new OrderItem)._fromDB({
                ...e,
                order,
                product: (new Product)._fromDB(e)
            }));
        } catch(err) {
            if(isDevelopment) console.log(err);
            if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
            else
                throw err;
        }
        return res;
    }

    static async get(orderId, productId) {
        var res;
        try {
            var data = await connection(this._tablename_)
                .join(
                    Order._tablename_,
                    OrderItem.fieldRewriter.absolutes.order,
                    Order.fieldRewriter.absolutes.id
                )
                .join(
                    Product._tablename_,
                    OrderItem.fieldRewriter.absolutes.product,
                    Product.fieldRewriter.absolutes.id
                )
                .select(OrderItem.fieldRewriter.transform.select(['createdAt', 'deletedAt']).concat(Order.fieldRewriter.transform.all().concat(Product.fieldRewriter.transform.all())))
                .where(OrderItem.fieldRewriter.absolutes.order, orderId)
                .andWhere(OrderItem.fieldRewriter.absolutes.product, productId)
                .first();
            if(data)
                res = (new OrderItem)._fromDB({
                    ...data,
                    order: (new Order)._fromDB(data),
                    product: (new Product)._fromDB(data)
                });
        } catch(err) {
            if(isDevelopment) console.log(err);
            if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
            else
                throw err;
        }
        return res;
    }

    isValid() {
        if(!this.order)
            throw new TypeError("Order is required");
        if(!this.order.isTrusted || this.order.wasEdited)
            throw new TypeError("Order is unreliable, please load it from the database and do not edit");
        if(!this.product)
            throw new TypeError("Product is required");
        if(!this.product.isTrusted || this.product.wasEdited)
            throw new TypeError("Product is unreliable, please load it from the database and do not edit");
        if(!this.quantity)
            throw new TypeError("Quantity is required");
    }

    async insert() {
        var res = false;
        if(this.isTrusted)
            throw new TypeError("Replication error");
        this.isValid();
        try {
            const transaction = await connection.transaction();
            var [found] = await transaction(Order._tablename_)
                .select(Order.fieldRewriter.absolutes.status)
                .where({ id: this.#props.order.id, deletedAt: null });
            if(!found)
                throw new CustomError("The order doesn't exist");
            else if(found.status !== OrderStatus.IN_QUEUE)
                throw new CustomError("Cannot edit order after it's no longer in queue");
            var [found] = await transaction(OrderItem._tablename_)
                .select('*')
                .where({ order: this.#props.order.id, product: this.#props.product.id });
            try {
                if(!this.#props.product.price)
                    throw new CustomError("Product not yet listed");
                if(!found) {
                    this.#props.createdAt = new Date;
                    this.#props.price = this.#props.product.price;
                    await transaction(OrderItem._tablename_)
                        .insert({
                            order: this.#props.order.id,
                            product: this.#props.product.id,
                            quantity: this.#props.quantity,
                            price: this.#props.price,
                            createdAt: this.#props.createdAt
                        });
                } else if(found.deletedAt == null) {
                    throw new CustomError("Product already included");
                } else {
                    this.#props.createdAt = new Date;
                    this.#props.price = this.#props.product.price;
                    await transaction(OrderItem._tablename_)
                        .update({
                            quantity: this.#props.quantity,
                            price: this.#props.price,
                            createdAt: this.#props.createdAt,
                            updatedAt: this.#props.updatedAt,
                            deletedAt: this.#props.deletedAt
                        })
                        .where({ order: this.#props.order.id, product: this.#props.product.id });
                }
                transaction.commit();
                this.#isTrusted = true;
                res = true;
            } catch (err) {
                transaction.rollback();
                throw err;
            }
        } catch (err) {
            if(isDevelopment) console.log(err);
            if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
            else
                throw err;
        }
        return res;
    }

    async update() {
        var res;
        if(!this.isTrusted)
            throw new TypeError("Order item is unreliable, please load it from database first");
        if(!this.wasEdited)
            throw new TypeError("Nothing to update");
        this.isValid();
        try {
            var [found] = await connection(OrderItem._tablename_)
                .select('*')
                .where({ order: this.#props.order.id, product: this.#props.product.id, deletedAt: null });
            if(!found) {
                throw new CustomError("Order item not exist");
            } else {
                this.#props.updatedAt = new Date;
                this.#props.price = found.price;
                await connection(OrderItem._tablename_)
                    .update({
                        order: this.#props.order.id,
                        product: this.#props.product.id,
                        quantity: this.#props.quantity,
                        price: this.#props.price,
                        updatedAt: this.#props.updatedAt
                    });
                res = this;
            }
        } catch (err) {
            if(isDevelopment) console.log(err);
            if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
            else
                throw err;
        }
        return res;
    }

    async delete() {
        var res = false;
        if(!this.isTrusted)
            throw new TypeError("Order item is unreliable, please load it from database first");
        try {
            this.#props.deletedAt = this.#props.deletedAt??new Date;
            var [{ count }] = await connection(OrderItem._tablename_)
                .where({ order: this.#props.order.id, product: this.#props.product.id, deletedAt: null })
                .count({ count: 'product' });
            if(count <= 1)
                throw new CustomError("You cannot delete last order item, you must delete order instead");
            var data = await connection(OrderItem._tablename_)
                .update({ deletedAt: this.#props.deletedAt })
                .where({ order: this.#props.order.id, product: this.#props.product.id, deletedAt: null });
            if(data !== 1)
                throw new CustomError("Order item not exist");
            res = true;
        } catch (err) {
            if(isDevelopment) console.log(err);
            if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
            else
                throw err;
        }
        return res;
    }

}

module.exports = {
    Order,
    OrderItem
}
