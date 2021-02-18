/**
 * Server configuration file
 * @author Renner Yannick
 * @cretedOn 02.18.2021
 */

const { ApolloServer, PubSub } = require('apollo-server');
const { importSchema } = require('graphql-import');

const typeDefs = importSchema('./graphql/schema/schema.graphql');

const pubSub = new PubSub();

const todos = [
    {id: 0, name: "First Todo", description: "A Description", state: "OPEN", active: false}
];

const resolvers = {
    Query : {
        info: () => `This is a test API with GraphQL`
    },
    Mutation: {
        createTodo: ((parent, args) => {
            const {name, description, state} = args;
            const newTodo = {id: todos.length, name, description, state, active: true };
            const _todos = [...todos].push(newTodo);
            todos = _todos;
            return newTodo;
        })
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, }) => {
        return {
            ... req,
            pubSub
        }
    },
});

server.listen()
    .then(({url,}) => {
        console.log(`Server listend on ${url}`);
    }).catch(error => {
        console.error(`An error occurred: ${error}`);
    });
