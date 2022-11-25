class FieldRewriter {
    constructor(fields) {
        this.fields = fields??{};
    }

    select(fields) {
        if(!Array.isArray(fields))
            throw new TypeError("'fields' must be array type");
        const res = [];
        for (const field of fields)
            res.push(this.fields[field]);
        return res;
    }

    all() {
        return Object.values(this.fields);
    }
}

module.exports = FieldRewriter;
