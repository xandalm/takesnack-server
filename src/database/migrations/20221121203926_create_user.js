/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('User', function(table) {
    table.string('id', 32).primary()
    table.string('phoneNumber', 25).unique().notNullable();
    table.string('name', 40).notNullable();
    table.string('pwd', 64).notNullable();
    table.integer('role');
    table.integer('status').notNullable();
    table.dateTime('createdAt').notNullable();
    table.dateTime('updatedAt');
    table.dateTime('deletedAt');
    table.foreign('role').references('UserRole.id').withKeyName('fk_user_user-role');
    table.foreign('status').references('UserStatus.id').withKeyName('fk_user_user-status');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('User');
};
