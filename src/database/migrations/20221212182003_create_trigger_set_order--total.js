/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return Promise.all([
        knex.raw(
            "CREATE TRIGGER `tg_update_order--total_new-item` BEFORE INSERT ON OrderItem "+
            "FOR EACH ROW "+
            "BEGIN "+
            "UPDATE `Order` SET `total` = `total` + (NEW.`price` * NEW.`quantity`) WHERE `id` = NEW.`order`; "+
            "END"
        ),
        knex.raw(
            "CREATE TRIGGER `tg_update_order--total_update-item-increase` BEFORE UPDATE ON `OrderItem` "+
            "FOR EACH ROW "+
            "WHEN NEW.deletedAt IS NULL "+
            "BEGIN "+
            "UPDATE `Order` SET `total` = `total` + (NEW.`price` * NEW.`quantity`) WHERE `id` = NEW.`order`; "+
            "END"
        ),
        knex.raw(
            "CREATE TRIGGER `tg_update_order--total_update-item-decrease` BEFORE UPDATE ON `OrderItem` "+
            "FOR EACH ROW "+
            "WHEN NEW.deletedAt IS NOT NULL "+
            "BEGIN "+
            "UPDATE `Order` SET `total` = `total` - (OLD.`price` * OLD.`quantity`) WHERE `id` = OLD.`order`; "+
            "END"
        ),
        knex.raw(
            "CREATE TRIGGER `tg_update_order--total_delete-item` BEFORE DELETE ON `OrderItem` "+
            "FOR EACH ROW "+
            "BEGIN "+
            "UPDATE `Order` SET `total` = `total` - (OLD.`price` * OLD.`quantity`) WHERE `id` = OLD.`order`; "+
            "END"
        )
    ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return Promise.all([
        knex.raw("DROP TRIGGER IF EXISTS `tg_update_order--total_new-item`;"),
        knex.raw("DROP TRIGGER IF EXISTS `tg_update_order--total_update-item-increase`;"),
        knex.raw("DROP TRIGGER IF EXISTS `tg_update_order--total_update-item-decrease`;"),
        knex.raw("DROP TRIGGER IF EXISTS `tg_update_order--total_delete-item`;"),
    ]);
};
