/**
 * Server configuration file
 * @author Renner Yannick
 * @cretedOn 02.18.2021
 */

const { ApolloServer } = require('apollo-server');
const { importSchema } = require('graphql-import');
const { PrismaClient } = require("@prisma/client");
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

const prisma = new PrismaClient();


const typeDefs = importSchema('./graphql/schema/schema.graphql');

const resolverMap = {
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date Custom Scalar',
        parseValue(value) {
            return new Date(value);
        },
        serialize(value) {
            return value.getTime();
        },
        parseLiteral(ast) {
            console.log(ast.value);
            if (ast.Kind === Kind.INT) {
                return parseInt(ast.value, 10);
            }
            return null;
        },
    }),
};

const resolvers = {
    Query : {
        info: () => `This is a test API with GraphQL`,
        allTodos:  ( async (parent, args, context) => {
            return await context.prisma.todo.findMany();
        }),
        getATodo: (async (parent, args, context) => {
            const {id} = args;
            const todoAsync = context.prisma.todo.findUnique({
                where: {
                    id: parseInt(id),
                },
            });
            return await todoAsync;
        }),
    },
    Mutation: {
        createTodo: async (parent, args, context) => {
            const {name, description, state, dueDate} = args;
            let date = new Date();
            date.setDate(date.getDate() + 1);
            const newTodo = await context.prisma.todo.create({
                data: {
                    name,
                    description,
                    state,
                    active: true,
                    dueDate: dueDate === null ?  date : dueDate // like Date must be in JSON format "2021-12-12T00:00:00.0000Z"
                },
                
            });
            return newTodo;
        },

        postponeTodo: async (parent, args, context) => {
            const { id, numberOfDay } = args;
            const todo = await context.prisma.todo.findUnique({
                where: {
                    id: parseInt(id),
                },
                
            });

            const newDueDate = todo.dueDate;
            newDueDate.setDate(newDueDate.getDate() + numberOfDay);
            await context.prisma.todo.update({
                where: {
                    id: parseInt(id),
                },
                data: {
                    dueDate: newDueDate,
                },
            });
            return todo;
        },


        changeDescription: async (parent, args, context) => {
            const { id, description} = args;
            await context.prisma.todo.update({
                where: {
                    id: parseInt(id),
                },
                data: {
                    description
                }
            }) 
            return `The todo ${id} has been updated!`
        },

        takeTodo: (async (parent, args, context) => {
            const {id} = args;
            const todo = await context.prisma.todo.update({
                where: {
                    id: parseInt(id)
                },
                data: {
                    state: "Taked"
                },
            });
            return todo;
        }),

        closeTodo: (async (parent, args, context) => {
            const {id} = args;
            const todo = await context.prisma.todo.update({
                where: {
                    id: parseInt(id),
                },
                data: {
                    state: "CLOSED",
                    active: false,
                },
            });
            return todo;
        }),

        deleteTodo: (async (parent, args, context) => {
            const {id} = args;
            const todo = await context.prisma.todo.findUnique({
                where: {
                    id: parseInt(id),
                },
            });
            await context.prisma.todo.delete({
                where: {
                    id: parseInt(id),
                },
            });
            return todo;
        })
    }
}

const server = new ApolloServer({
    typeDefs,
    resolverMap,
    resolvers,
    context: ({ req, }) => {
        return {
            ... req,
            prisma
        }
    },
});


server.listen()
    .then(({url,}) => {
        console.log(`Server listend on ${url}`);
    }).catch(error => {
        console.error(`An error occurred: ${error}`);
    });
