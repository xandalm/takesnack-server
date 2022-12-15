const { v4:uuid } = require('uuid');
const { isDevelopment } = require('../config/server.config');
const connection = require('../database/connection');
const CustomError = require("../utils/errors");
const FieldRewriter = require("../utils/field-rewriter");
const { clearStringGaps } = require('../utils/util');
const { Ingredient } = require('./Ingredient');
const Model = require("./model");
const { ProductCategory } = require("./ProductCategory");
const { ProductStatus } = require("./ProductStatus");
const { SqliteError } = require("better-sqlite3");

class Product extends Model {

    static _tablename_ = 'Product';
    static _filterable_ = [ 'id', 'name', 'price' ];
    static _sortable_ = [ 'name', 'price', 'createdAt', 'updatedAt', 'deletedAt' ];

    static fieldRewriter = new FieldRewriter();

    static {
        this.fieldRewriter.add('id', `${this._tablename_}.id`, `${this._tablename_}_id`);
        this.fieldRewriter.add('name', `${this._tablename_}.name`, `${this._tablename_}_name`);
        this.fieldRewriter.add('description', `${this._tablename_}.description`, `${this._tablename_}_description`);
        this.fieldRewriter.add('category', `${this._tablename_}.category`, `${this._tablename_}_category`);
        this.fieldRewriter.add('price', `${this._tablename_}.price`, `${this._tablename_}_price`);
        this.fieldRewriter.add('status', `${this._tablename_}.status`, `${this._tablename_}_status`);
        this.fieldRewriter.add('createdAt', `${this._tablename_}.createdAt`, `${this._tablename_}_createdAt`);
        this.fieldRewriter.add('updatedAt', `${this._tablename_}.updatedAt`, `${this._tablename_}_updatedAt`);
        this.fieldRewriter.add('deletedAt', `${this._tablename_}.deletedAt`, `${this._tablename_}_deletedAt`);
    }

    #props = {
        id: null,
        name: null,
        description: null,
        category: null,
        price:  null,
        ingredients: null,
        status: null,
        createdAt: null,
        updatedAt: null,
        deletedAt: null
    }

    constructor(props) {
        super();
        this.name = props?.name;
        this.description = props?.description;
    }

    set name(value) {
        if(value == undefined)
            this.#props.name = null;
        if(value != undefined) {
            if(typeof value !== 'string')
                throw new TypeError("'value' must be string");
            value = clearStringGaps(value);
            if(value.length > 30)
                throw new CustomError("Name can't be too long (max. length = 40)");
            this.#props.name = value;
        }
    }
    
    set description(value) {
        if(value == undefined)
            this.#props.description = null;
        else {
            if(typeof value !== 'string')
                throw new TypeError("'value' must be string");
            value = clearStringGaps(value);
            if(value.length > 100)
                throw new CustomError("Description can't be too long (max. length = 100)");
            this.#props.description = value;
        }
    }

    set category(value) {
        if(value == undefined)
            this.#props.category = null;
        else {
            if(!(value instanceof ProductCategory))
                throw new TypeError("Must be ProductCategory type");
            this.#props.category = value;
        }
    }
    
    set price(value) {
        if(value == undefined)
            this.#props.price = null;
        else {
            if(typeof(value) !== 'number')
                throw new TypeError("Must be number type");
            this.#props.price = Math.trunc(value * 100) / 100;
        }
    }
    
    set status(value) {
        if(value == undefined)
            this.#props.status = null;
        else {
            if(!(value instanceof ProductStatus))
                throw new TypeError("Must be ProductStatus type");
            this.#props.status = value;
        }
    }
    
    get id() { return this.#props.id; }
    get name() { return this.#props.name; }
    get description() { return this.#props.description; }
    get category() { return this.#props.category; }
    get price() { return this.#props.price; }
    get ingredients() {
        return (async (product) => {
            product.#props.ingredients = await ProductIngredient.getProductIngredients(product.id)
            return product.#props.ingredients;
        })(this);
    }
    get status() { return this.#props.status; }
    get createdAt() { return this.#props.createdAt; }
    get updatedAt() { return this.#props.updatedAt; }
    get deletedAt() { return this.#props.deletedAt; }

    _fromDB(obj) {
        // if it doesn't have id then it doesn't exist, so it's null
        if(obj == undefined || obj[`${Product._tablename_}_id`] == undefined)
            return null;
        this.#props = {
            id: obj[`${Product._tablename_}_id`],
            name: obj[`${Product._tablename_}_name`],
            description: obj[`${Product._tablename_}_description`],
            category: obj.category,
            price: obj[`${Product._tablename_}_price`],
            status: obj.status,
            createdAt: obj[`${Product._tablename_}_createdAt`],
            updatedAt: obj[`${Product._tablename_}_updatedAt`],
            deletedAt: obj[`${Product._tablename_}_deletedAt`]
        };
        this.#props.createdAt = this.createdAt!=undefined? new Date(this.createdAt): this.createdAt;
        this.#props.updatedAt = this.updatedAt!=undefined? new Date(this.updatedAt): this.updatedAt;
        this.#props.deletedAt = this.deletedAt!=undefined? new Date(this.deletedAt): this.deletedAt;
        return this;
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

    static async getAll(config = {}) {
        var res = [];
        try {
            const { limit, offset, where, orderBy } = this._prepareQueryConfig(config);
            var data = await connection.with('A', (c) => {
                c.select(Product.fieldRewriter.transform.all())
                .from(Product._tablename_)
                .whereRaw(where.statement, where.params)
                .orderBy(orderBy)
                .limit(limit)
                .offset(offset)
            })
            .select(
                this.fieldRewriter.alias.all().concat(
                    ProductCategory.fieldRewriter.transform.all(),
                    ProductStatus.fieldRewriter.transform.all()
                )
            )
            .from('A')
            .leftJoin(ProductCategory._tablename_, this.fieldRewriter.aliases.category, ProductCategory.fieldRewriter.absolutes.id)
            .leftJoin(ProductStatus._tablename_, this.fieldRewriter.aliases.status, ProductStatus.fieldRewriter.absolutes.id);

            res = Array.from(data).map(e => (new Product)._fromDB({
                ...e,
                category: (new ProductCategory)._fromDB(e),
                status: (new ProductStatus)._fromDB(e)
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
    
    static async get(id) {
        var res;
        try {
            var data = await connection.with('A', (c) => {
                c.select(Product.fieldRewriter.transform.all())
                .from(Product._tablename_)
                .where({ id })
            })
            .select(
                this.fieldRewriter.alias.all().concat(
                    ProductCategory.fieldRewriter.transform.all(),
                    ProductStatus.fieldRewriter.transform.all()
                )
            )
            .from('A')
            .leftJoin(ProductCategory._tablename_, this.fieldRewriter.aliases.category, ProductCategory.fieldRewriter.absolutes.id)
            .leftJoin(ProductStatus._tablename_, this.fieldRewriter.aliases.status, ProductStatus.fieldRewriter.absolutes.id)
            .first();
            if(data)
                res = (new Product)._fromDB({
                    ...data,
                    category: (new ProductCategory)._fromDB(data),
                    status: (new ProductStatus)._fromDB(data)
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
        if(!this.name)
            throw new CustomError("Name is required");
    }

    async insert() {
        var res = false;
        this.isValid();
        try {
            this.status = await ProductStatus.get(2); // INACTIVE
            var [found] = await connection(Product._tablename_)
                .select('*')
                .where({ name: this.name });
            if(found) {
                if(found.deletedAt == null)
                    throw new CustomError("Name already in use");
                else {
                    this.#props.id = found.id;
                    this.#props.updatedAt = new Date;
                    await connection(Product._tablename_)
                        .update({
                            name: this.name,
                            description: this.description,
                            category: this.category ? this.category.id : null,
                            price: this.price,
                            status: this.status.id,
                            updatedAt: this.updatedAt,
                            deletedAt: this.deletedAt
                        })
                        .where({ id: this.id });
                    res = true;
                }
            } else {
                this.#props.id = uuid();
                this.#props.createdAt = new Date;
                await connection(Product._tablename_)
                    .insert({
                        id: this.id,
                        name: this.name,
                        description: this.description,
                        category: null,
                        price: this.price,
                        status: this.status.id,
                        createdAt: this.createdAt
                    });
                res = true;
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
        var res = false;
        this.isValid();
        try {
            var [found] = await connection(Product._tablename_)
                .select('*')
                .where({ name: this.name });
            if(found && found.id != this.id) {
                throw new CustomError("Name already in use");
            } else {
                this.#props.updatedAt = new Date;
                await connection(Product._tablename_)
                    .update({
                        name: this.name,
                        description: this.description,
                        category: this.category ? this.category.id : null,
                        price: this.price,
                        status: this.status.id,
                        updatedAt: this.updatedAt
                    })
                    .where({ id: this.id });
                res = true;
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
        try {
            this.#props.deletedAt = this.deletedAt??new Date;
            await connection(Product._tablename_)
                .update({ deletedAt: this.deletedAt })
                .where({ id: this.id, deletedAt: null });
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

class ProductIngredient extends Model {

    static _tablename_ = 'ProductIngredient';

    static fieldRewriter = new FieldRewriter();

    static {
        this.fieldRewriter.add('product', `${this._tablename_}.product`, `${this._tablename_}_product`);
        this.fieldRewriter.add('ingredient', `${this._tablename_}.ingredient`, `${this._tablename_}_ingredient`);
        this.fieldRewriter.add('quantity', `${this._tablename_}.quantity`, `${this._tablename_}_quantity`);
        this.fieldRewriter.add('createdAt', `${this._tablename_}.createdAt`, `${this._tablename_}_createdAt`);
        this.fieldRewriter.add('updatedAt', `${this._tablename_}.updatedAt`, `${this._tablename_}_updatedAt`);
        this.fieldRewriter.add('deletedAt', `${this._tablename_}.deletedAt`, `${this._tablename_}_deletedAt`);
    }

    #props={
        product: null,
        ingredient: null,
        quantity: null,
        createdAt: null,
        updatedAt: null,
        deletedAt: null
    };

    constructor(props) {
        super();
        this.product = props?.product;
        this.ingredient = props?.ingredient;
        this.quantity = props?.quantity;
    }

    set product(value) {
        if(value == undefined)
            this.#props.product = null;
        else {
            if(!value instanceof Product)
                throw new Error("'value' must be Product type");
            this.#props.product = value;
        }
    }

    set ingredient(value) {
        if(value == undefined)
            this.#props.ingredient = null;
        else {
            if(!value instanceof Ingredient)
                throw new TypeError("'value' must be Ingredient type");
            this.#props.ingredient = value;
        }
    }

    set quantity(value) {
        if(value == undefined)
            this.#props.quantity = null;
        else {
            if(typeof(value) !== 'number' && Number.isInteger(value) && value > 0)
                throw new TypeError("'value' must be positive integer type");
            this.#props.quantity = value;
        }
    }

    get product() { return this.#props.product; }
    get ingredient() { return this.#props.ingredient; }
    get quantity() { return this.#props.quantity; }
    get createdAt() { return this.#props.createdAt; }
    get updatedAt() { return this.#props.updatedAt; }
    get deletedAt() { return this.#props.deletedAt; }

    _fromDB(obj) {
        if(obj.product != null && !(obj instanceof Product))
            throw new Error("Product must be resolved before");
        if(obj.ingredient != null && !(obj.ingredient instanceof Ingredient))
            throw new Error("Ingredient must be resolved before");
        this.#props = {
            product: obj?.product,
            ingredient: obj?.ingredient,
            quantity: obj[`${ProductIngredient._tablename_}_quantity`],
            createdAt: obj[`${ProductIngredient._tablename_}_createdAt`],
            deletedAt: obj[`${ProductIngredient._tablename_}_deletedAt`]
        };
        this.#props.createdAt = this.createdAt? new Date(this.createdAt): this.createdAt;
        this.#props.deletedAt = this.deletedAt? new Date(this.deletedAt): this.deletedAt;
        return this;
    }

    toJSON() {
        return {
            ...this.#props
        }
    }

    static async getProductIngredients(productId) {
        var res = [];
        try {
            const product = await Product.get(productId);
            var data = await connection.with('A', (c) => {
                c.select(ProductIngredient.fieldRewriter.transform.all())
                .from(ProductIngredient._tablename_)
                .where({ product: productId, deletedAt: null })
            })
            .select(ProductIngredient.fieldRewriter.alias.all().concat(Ingredient.fieldRewriter.transform.all()))
            .from('A')
            .join(Ingredient._tablename_, ProductIngredient.fieldRewriter.aliases.product, Ingredient.fieldRewriter.absolutes.id);
            res = Array.from(data).map(e => (new ProductIngredient)._fromDB({
                ...e,
                product,
                ingredient: (new Ingredient)._fromDB(e)
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

    static async get(productId, ingredientId) {
        var res;
        try {
            const product = await Product.get(productId);
            var data = await connection.with('A', (c) => {
                c.select(ProductIngredient.fieldRewriter.transform.all())
                .from(ProductIngredient._tablename_)
                .where({ product: productId, ingredient: ingredientId })
            })
            .select(
                ProductIngredient.fieldRewriter.transform.select(['createdAt', 'updatedAt', 'deletedAt'].concat(
                    Ingredient.fieldRewriter.transform.all()
                )
            ))
            .from('A')
            .join(Ingredient._tablename_, ProductIngredient.fieldRewriter.absolutes.ingredient, Ingredient.fieldRewriter.absolutes.id)
            .first();
            if(data)
                res = (new ProductIngredient)._fromDB({
                    ...data,
                    product,
                    ingredient: (new Ingredient)._fromDB(data)
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
        if(!this.product)
            throw new CustomError("Product is required");
        if(!this.ingredient)
            throw new CustomError("Ingredient is required");
        if(!this.quantity)
            throw new CustomError("Quantity is required");
    }

    async insert() {
        var res = false;
        this.isValid();
        try {
            var [found] = await connection(ProductIngredient._tablename_)
                .select('*')
                .where({ product: this.product.id, ingredient: this.ingredient.id });
            if(found) {
                if(found.deletedAt == null)
                    throw new CustomError("Ingredient already included");
                else {
                    this.#props.createdAt = found.createdAt;
                    this.#props.updatedAt = new Date;
                    this.#props.deletedAt = null;
                    await connection(ProductIngredient._tablename_)
                        .update({
                            quantity: this.quantity,
                            updatedAt: this.updatedAt,
                            deletedAt: this.deletedAt
                        })
                        .where({ product: this.product.id, ingredient: this.ingredient.id })
                    res = true;
                }
            } else {
                this.#props.createdAt = new Date;
                await connection(ProductIngredient._tablename_)
                    .insert({
                        product: this.product.id,
                        ingredient: this.ingredient.id,
                        quantity: this.quantity,
                        createdAt: this.createdAt
                    });
                res = true;
            }
        } catch (err) {
            if(isDevelopment)
            if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
            else
                throw err;
        }
        return res;
    }

    async update() {
        var res = false;
        this.isValid();
        try {
            var [found] = await connection(ProductIngredient._tablename_)
                .select('*')
                .where({ product: this.product.id, ingredient: this.ingredient.id, deletedAt: null });
            if(!found) {
                throw new CustomError("Product ingredient not exist");
            } else {
                this.#props.updatedAt = new Date;
                await connection(ProductIngredient._tablename_)
                    .update({
                        product: this.product.id,
                        ingredient: this.ingredient.id,
                        quantity: this.quantity,
                        updatedAt: this.updatedAt
                    });
                res = true;
            }
        } catch (err) {
            if(isDevelopment)
            if(err instanceof SqliteError)
                throw new CustomError("Internal server error");
            else
                throw err;
        }
        return res;
    }

    async delete() {
        var res = false;
        try {
            this.#props.deletedAt = this.deletedAt??new Date;
            var data = await connection(ProductIngredient._tablename_)
                .update({ deletedAt: this.deletedAt })
                .where({ product: this.product.id, ingredient: this.ingredient.id, deletedAt: null });
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
    Product,
    ProductIngredient
}
