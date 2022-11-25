/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('Ingredient', function(table) {
    table.increments('id');
    table.string('name', 40).unique().notNullable();
    table.string('description', 100);
    table.dateTime('createdAt').notNullable();
    table.dateTime('updatedAt');
    table.dateTime('deletedAt');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('Ingredient');
};
