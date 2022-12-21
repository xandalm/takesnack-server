const express = require('express');
const compression = require('compression');
const { graphqlHTTP } = require('express-graphql');
const GQLSchema = require('./graphql');
const { isDevelopment } = require('./config/server.config');
const { JWT, JWTExpiration } = require('./utils/jwt');
const CustomError = require('./utils/errors');
const app = express();

JWT.setConfig({
    secret: 'topsecret',
    claims: {
        iss: 'takesnack',
        aud: 'takesnack-client'
    }
})

app.use(compression());
app.use(
    '/graphql',
    graphqlHTTP((req, res, { variables }) => ({
        schema: GQLSchema,
        context: {
            token: (() => {
                if(req.headers?.authorization) {
                    try {
                        var [_, jwt] = req.headers.authorization.split(' ');
                        jwt = JWT.from(jwt);
                        if(/^Bearer$/.test(_) && jwt.check())
                            return jwt;
                    } catch(err) {
                        if(isDevelopment) console.log(err);
                        throw err;
                    }
                    throw new CustomError("Invalid authorization header");
                }
            })()
        },
        graphiql: isDevelopment,
        customFormatErrorFn(err) {
            return {
                code: err.code,
                message: err.message
            }
        }
    }))
)

app.get('/', (req, res) => {
    res.send("GraphQL is listenning on /graphql");
})

// app.get('/login', express.json(), (req, res, next) => {
//     if(!isDevelopment && req.headers?.authorization) {
//         try {
//             var [_, jwt] = req.headers.authorization.split(' ');
//             jwt = JWT.from(jwt);
//             if(/^Bearer$/.test(_) && jwt.check()) {
//                 next(new CustomError("Already authenticated"));
//                 return;
//             }
//         } catch(err) {
//             if(isDevelopment) console.log(err);
//             next(err);
//             return;
//         }
//         next(new CustomError("Invalid authorization header"));
//         return;
//     }
//     const { phoneNumber, pwd } = req.body;
//     const customer = CustomerController.fromCredentials(phoneNumber, pwd)
//     var tk = JWT.generate({
//         role: 'guest'
//     },{
//         exp: JWTExpiration._10_MINUTES
//     });
//     console.log(tk.check());
//     res.send(tk.export());
// });

app.use((err, req, res, next) => {
    res.status(200).send({ errors: [{ message: err.message }]});
});

module.exports = app;
