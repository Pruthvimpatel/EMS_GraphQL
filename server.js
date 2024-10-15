require('dotenv').config();
const  {ApolloServer} = require('apollo-server-express');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./models');
const {userResolvers} = require('./resolvers/user-resolver');
const {eventResolvers} = require('./resolvers/event-resolver');
const {userDefs} = require('./schemas/user-schema');
const {eventDefs} = require('./schemas/event-schema');
const verifyToken = require('./middleware/auth-jwt');
const {mergeResolvers} = require('@graphql-tools/merge');
const combineResolvers = mergeResolvers([
    userResolvers,
    eventResolvers
  ]);

const { mergeTypeDefs } = require('@graphql-tools/merge');
const combineTypeDefs = mergeTypeDefs([
    userDefs,
    eventDefs
]);

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

db.sequelize.sync({force: false}).then(() => {
    console.log('drop and re-sync db.');
});


async function startApolloServer() {
    const server = new ApolloServer({
        typeDefs: combineTypeDefs,
        resolvers: combineResolvers,
        introspection: true,
        context: verifyToken
    });

    await server.start();
    server.applyMiddleware({ app });

    const PORT = process.env.PORT;

    app.listen(PORT,() => {
        console.log(`apollo server started at  http://localhost:${PORT}/graphql`);
    });
}

startApolloServer();