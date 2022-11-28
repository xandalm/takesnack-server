class FieldRewriter {
    
    constructor() {
        this.absolutes = {};
        this.aliases = {};
        this.transforms = {};
    }

    get transform() {
        return {
            all: () => {
                return Object.values(this.transforms);
            },
            select: (fields) => {
                if(!Array.isArray(fields))
                    throw new TypeError("'fields' must be array type");
                const res = [];
                for (const field of fields)
                    res.push(this.transforms[field]);
                return res;
            }
        }
    }

    get alias() {
        return {
            all: () => {
                return Object.values(this.aliases);
            },
            select: (fields) => {
                if(!Array.isArray(fields))
                    throw new TypeError("'fields' must be array type");
                const res = [];
                for (const field of fields)
                    res.push(this.aliases[field]);
                return res;
            }
        }
    }

    get absolute() {
        return {
            all: () => {
                return Object.values(this.absolutes);
            },
            select: (fields) => {
                if(!Array.isArray(fields))
                    throw new TypeError("'fields' must be array type");
                const res = [];
                for (const field of fields)
                    res.push(this.absolutes[field]);
                return res;
            }
        }
    }

    add(field, absolute, alias) {
        this.absolutes[field] = absolute;
        this.aliases[field] = alias;
        this.transforms[field] = `${absolute} as ${alias}`;
    }

}

module.exports = FieldRewriter;
