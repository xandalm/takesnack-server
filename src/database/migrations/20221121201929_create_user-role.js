/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('UserRole', function(table) {
    table.increments('id');
    table.string('name', 30).unique().notNullable();
    table.string('description', 100);
    table.dateTime('createdAt').notNullable();
    table.dateTime('updatedAt');
    table.dateTime('deletedAt');
  }).then(function() {
    return knex('UserRole').insert([
        { name: 'ADMINISTRATOR', createdAt: new Date().toISOString() },
    ])
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('UserRole');
};
