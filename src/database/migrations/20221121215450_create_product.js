/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('Product', function(table) {
    table.string('id', 32).primary();
    table.string('name', 40).unique().notNullable();
    table.string('description', 100);
    table.decimal('price', 2);
    table.integer('category');
    table.integer('status').notNullable();
    table.dateTime('createdAt').notNullable();
    table.dateTime('updatedAt');
    table.dateTime('deletedAt');
    table.foreign('category').references('ProductCategory.id').withKeyName('fk_product_product-category');
    table.foreign('status').references('ProductStatus.id').withKeyName('fk_product_product-status');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('Product');
};
