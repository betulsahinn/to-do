// app.js
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { json } = require('body-parser');

const app = express();

// In-memory veritabanı (gerçek uygulamada bir veritabanı kullanılmalı)
let todos = [];
let idCounter = 1;

// GraphQL type tanımlamaları
const typeDefs = `
  type Todo {
    id: ID!
    title: String!
    description: String
    completed: Boolean!
    createdAt: String!
  }

  type Query {
    todos: [Todo!]!
    todo(id: ID!): Todo
  }

  type Mutation {
    createTodo(title: String!, description: String): Todo!
    updateTodo(id: ID!, title: String, description: String, completed: Boolean): Todo
    deleteTodo(id: ID!): Boolean!
  }
`;

// Resolver fonksiyonları
const resolvers = {
  Query: {
    todos: () => todos,
    todo: (_, { id }) => todos.find(todo => todo.id === parseInt(id))
  },
  Mutation: {
    createTodo: (_, { title, description }) => {
      const todo = {
        id: idCounter++,
        title,
        description,
        completed: false,
        createdAt: new Date().toISOString()
      };
      todos.push(todo);
      return todo;
    },
    updateTodo: (_, { id, title, description, completed }) => {
      const todoIndex = todos.findIndex(todo => todo.id === parseInt(id));
      if (todoIndex === -1) return null;

      const todo = todos[todoIndex];
      todos[todoIndex] = {
        ...todo,
        title: title || todo.title,
        description: description !== undefined ? description : todo.description,
        completed: completed !== undefined ? completed : todo.completed
      };
      return todos[todoIndex];
    },
    deleteTodo: (_, { id }) => {
      const todoIndex = todos.findIndex(todo => todo.id === parseInt(id));
      if (todoIndex === -1) return false;
      todos.splice(todoIndex, 1);
      return true;
    }
  }
};

async function startServer() {
  // Apollo Server kurulumu
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  // Server'ı başlat
  await server.start();

  // Middleware'leri ekle
  app.use(json());
  app.use('/graphql', expressMiddleware(server));

  // Server'ı dinlemeye başla
  const port = 3000;
  app.listen(port, () => {
    console.log(`🚀 GraphQL server ready at http://localhost:${port}/graphql`);
  });
}

startServer();