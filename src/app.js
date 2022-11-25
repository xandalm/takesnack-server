const express = require('express');
const compression = require('compression');
const { graphqlHTTP } = require('express-graphql');
const GQLSchema = require('./graphql');
const app = express();

app.use(compression());
app.use(
    '/graphql',
    graphqlHTTP((req, res, { variables }) => ({
        schema: GQLSchema,
        context: { req, res },
        graphiql: true,
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

app.use((err, req, res, next) => {
    res.status(200).send({ errors: [{ message: err.message }]});
});

module.exports = app;
