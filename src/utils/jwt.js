
const util = require('util');
const { randomUUID, createHmac } = require('crypto');

class JWTError extends Error {
    constructor(name, message) {
        super(message);
        this.name = name;
    }
}

const _1_MINUTE = 60;
const _10_MINUTES =_1_MINUTE * 10;
const _30_MINUTES =_10_MINUTES * 3;
const _1_HOUR =_30_MINUTES * 2;
const _6_HOURS =_1_HOUR * 6;
const _12_HOURS =_6_HOURS * 2;
const _1_DAY = _12_HOURS * 2;

const JWTExpiration = { _1_MINUTE, _10_MINUTES, _30_MINUTES, _1_HOUR, _6_HOURS, _12_HOURS, _1_DAY }

function isJSON(src) {
    if(!Array.isArray(src))
        return typeof(src) === 'object';
    return false;
}

const HMACSHA256 = (data, secret) => {
    const hmac = createHmac('sha256', secret);
    return hmac.update(data).digest('base64url');
}

class JWT {

    #props = {};
    static #config = {
        header: { alg: "HS256", typ: "JWT" }
    };
    static #claims = {};

    constructor(encodedHeader, encodedPayload, signature) {
        if(typeof(encodedHeader) !== 'string' || typeof(encodedPayload) !== 'string' || typeof(signature) !== 'string')
            throw new TypeError("Invalid Token");
        this.#props.encodedHeader = encodedHeader;
        this.#props.encodedPayload = encodedPayload;
        this.#props.signature = signature;
    }

    [util.inspect.custom](depth, opts) {
        return this.export();
    }

    get signature() { return this.#props.signature; }
    get encodedHeader() { return this.#props.encodedHeader; }
    get encodedPayload() { return this.#props.encodedPayload; }
    get header() {
        if(!this.#props.header)
            this.#props.header = JSON.parse(Buffer.from(this.encodedHeader,'base64url').toString('ascii'));
        return this.#props.header;
    }
    get payload() {
        if(!this.#props.payload)
            this.#props.payload = JSON.parse(Buffer.from(this.encodedPayload,'base64url').toString('ascii'));
        return this.#props.payload;
    }

    static get header() { return this.#config.header }
    static get secret() { return this.#config.secret }
    static get iss() { return this.#claims.iss }
    static get aud() { return this.#claims.aud }

    static setConfig({ secret, claims: { iss, aud } }) {
        if(typeof(secret) !== 'string')
            throw new TypeError("'secret' must be string");
        if(typeof(iss) !== 'string')
            throw new TypeError("'iss' must be string");
        if(typeof(aud) !== 'string')
            throw new TypeError("'aud' must be string");
        this.#config.secret = secret;
        this.#claims.iss = iss;
        this.#claims.aud = aud;
    }

    /**
     * 
     * @param {*} src 
     * @returns {JWT}
     */
    static from(src) {
        if(typeof(src) === 'string') {
            try {
                const [encodedHeader, encodedPayload, signature] = src.split('.');
                return new JWT(encodedHeader, encodedPayload, signature);
            } catch(err) {
                throw new TypeError("Invalid Token");
            }
        }
    }

    static generate(payload, options) {
        /*
            TO DO
            - validate claims according to IANA JSON Web Token Registry
        */
        if(!JWT.iss || !JWT.aud || !JWT.secret)
            throw new Error("Please, define 'iss' and/or 'aud' claims with 'setConfig' method");
        if(options?.expirationTime && !((Number.isFinite(options?.expirationTime) && options?.expirationTime > _1_MINUTE)))
            throw new TypeError("The 'exp' claim must be finite and bigger than 1 minute");
        const exp =  options?.expirationTime;
        if(!isJSON(payload))
            throw new TypeError("The 'payload' must be JSON object");
        const iat = Math.floor(Date.now() / 1000);
        payload = {
            jit: randomUUID(),
            iss: JWT.iss,
            aud: JWT.aud,
            ...payload,
            iat
        };
        if(exp!=undefined)
            payload.exp = iat + exp;
        const encodedHeader = Buffer.from(JSON.stringify(JWT.header)).toString('base64url');
        const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
        const data = encodedHeader + "." + encodedPayload;
        return new JWT(encodedHeader, encodedPayload, HMACSHA256(data, JWT.secret));
    }

    export() {
        return `${this.encodedHeader}.${this.encodedPayload}.${this.signature}`;
    }

    check() {
        try {
            if( 
                !this.encodedHeader || 
                !this.encodedPayload || 
                !this.header || 
                !this.payload 
            )
                throw new JWTError("Unauthorized","Invalid access token");
            if(this.payload.iss !== JWT.iss || this.payload.aud !== JWT.aud)
                throw new JWTError("Unauthorized","Illegal access token");
            if(this.payload.exp && this.payload.exp * 1000 < Date.now())
                throw new JWTError("Unauthorized","The access token has already expired");
            else {
                const signature = HMACSHA256(this.encodedHeader + "." + this.encodedPayload, JWT.secret);
                if(signature !== this.signature)
                    throw new JWTError("Unauthorized","Invalid access token");
            }
            return true;
        } catch (err) {
            if(err instanceof JWTError)
                throw err;
            throw new JWTError("Unauthorized","Invalid access token");
        }
    }

}

module.exports = {
    JWT,
    JWTError,
    JWTExpiration
};