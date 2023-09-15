var express = require("express");
const fs = require('fs');
const GraphQL2REST = require('graphql2rest');
const { buildSchema, execute } = require('graphql');
const path = require('path');
const bodyParser = require('body-parser');


var router = express.Router();

router.use(bodyParser.json());

var db = JSON.parse(fs.readFileSync("db.json", "utf8"));

const writeFile = (data) => {
  fs.writeFile("db.json", data, 'utf8', function (err) {
    if (err) {
      console.log("An error occurred while writing JSON Object to File.");
    }
    console.log("JSON file has been edited.");
  });
}

var schema = buildSchema(`#graphql
  type Game {
    id: ID!
    title: String!
    platform: [String!]!
  }
  type AllGameResponse {
    success: Boolean!
    message: String!
    data: [Game]
  }
  type GameById {
    success: Boolean!
    message: String!
    data: Game
  }
  type Response {
    success: Boolean!
    message: String!
  }
  type Query {
    getAllGames: AllGameResponse
    getGameById(id: ID!): GameById
  }
  type Mutation {
    addGame(game: AddGameInput!): Response
    deleteGame(id: ID!): Response
    updateGame(id: ID!, game: EditGameInput): Response
  }
  input AddGameInput {
    title: String!,
    platform: [String!]!
  }
  input EditGameInput {
    title: String,
    platform: [String!]
  }
`)

var resolvers = {
  getAllGames: () => {
    return {
      success: true,
      message: "Games founded successfully.",
      data: db.games
    }
  },
  getGameById: ({ id }) => {
    return {
      success: true,
      message: "Games founded successfully.",
      data: db.games.find((game) => game.id === id)
    }
  },
  addGame(args) {
    let game = {
      ...args.game,
      id: Date.now().toString()
    }
    db.games.push(game)
    writeFile(JSON.stringify(db))
    return {
      success: true,
      message: "Game added successfully."
    }
  },
  deleteGame(args) {
    db.games = db.games.filter((g) => g.id !== args.id)
    writeFile(JSON.stringify(db))
    return {
      success: true,
      message: "Game deleted successfully."
    }
  },
  updateGame(args) {
    db.games = db.games.map((g) => {
      if (g.id === args.id) {
        return { ...g, ...args.game }
      }
      return g
    })
    writeFile(JSON.stringify(db))
    return {
      success: true,
      message: "Game updated successfully."
    }
  }
};

const executeFn = ({ query, variables, context }) => {
  return execute({
    schema,
    document: query,
    variableValues: variables,
    contextValue: context,
    rootValue: resolvers
  });
}

const GQL_FOLDER = path.resolve(__dirname, '../myGqlFiles');
const MANIFEST_FILE = path.resolve(__dirname, '../myManifest.json');

GraphQL2REST.generateGqlQueryFiles(schema, GQL_FOLDER);

const restAPI = GraphQL2REST.init(schema, executeFn, {
  apiPrefix: '/v1',
  gqlGeneratorOutputFolder: GQL_FOLDER,
  manifestFile: MANIFEST_FILE
});

router.use('/', restAPI);

module.exports = router;