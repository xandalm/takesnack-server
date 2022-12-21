/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('UserRoleGrant', function(table) {
    table.integer('role').notNullable();
    table.integer('privilege').notNullable();
    table.dateTime('createdAt').notNullable();
    table.dateTime('deletedAt');
    table.foreign('role').references('UserRole.id').withKeyName('fk_user-grant_user-role');
    table.foreign('privilege').references('Privilege.id').withKeyName('fk_user-grant_privilege');
  }).then(async () => {
    let privileges = await knex.select('id').from('Privilege');
    let toInsert = [];
    for(const privilege of privileges)
      toInsert.push({ role: 1/* ADMINISTRATOR */, privilege: privilege.id, createdAt: new Date().toISOString() });
    return knex('UserRoleGrant').insert(toInsert);
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('UserRoleGrant');
};
