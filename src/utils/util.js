const { IntegerRegExp } = require("./regexp-patterns");

const parseToSafeInteger = (value) => {
    if(!IntegerRegExp.test(value))
        throw new TypeError("Cannot be safe integer");
    value = parseInt(value,10);
    if(!Number.isSafeInteger(value))
        throw new TypeError("Cannot be safe integer");
    return value;
}

module.exports = {
    parseToSafeInteger
}
