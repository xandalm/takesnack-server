/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('ProductIngredient', function(table) {
      table.string('product', 32).notNullable();
      table.integer('ingredient').notNullable();
      table.integer('quantity').notNullable();
      table.dateTime('createdAt').notNullable();
      table.dateTime('updatedAt');
      table.dateTime('deletedAt');
      table.primary(['product','ingredient']);
      table.foreign('product').references('Product.id').withKeyName('fk_product-ingredient_product');
      table.foreign('ingredient').references('Ingredient.id').withKeyName('fk_product-ingredient_ingredient');
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('ProductIngredient');
};
