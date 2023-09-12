var express = require("express")
var { graphqlHTTP } = require("express-graphql")
var { buildSchema } = require("graphql")
const fs = require('fs');

const db = {
  games: [
    { id: '1', title: 'Zelda, Tears of the Kingdom', platform: ['Switch'] },
    { id: '2', title: 'Final Fantasy 7 Remake', platform: ['PS5', 'Xbox'] },
    { id: '3', title: 'Elden Ring', platform: ['PS5', 'Xbox', 'PC'] },
    { id: '4', title: 'Mario Kart', platform: ['Switch'] },
    { id: '5', title: 'Pokemon Scarlet', platform: ['PS5', 'Xbox', 'PC'] },
  ],
  authors: [
    { id: '1', name: 'mario', verified: true },
    { id: '2', name: 'yoshi', verified: false },
    { id: '30', name: 'peach', verified: true },
  ],
  reviews: [
    { id: '1', rating: 9, content: 'lorem ipsum', author_id: '1', game_id: '2' },
    { id: '2', rating: 10, content: 'lorem ipsum', author_id: '2', game_id: '1' },
    { id: '3', rating: 7, content: 'lorem ipsum', author_id: '3', game_id: '3' },
    { id: '4', rating: 5, content: 'lorem ipsum', author_id: '2', game_id: '4' },
    { id: '5', rating: 8, content: 'lorem ipsum', author_id: '2', game_id: '5' },
    { id: '6', rating: 7, content: 'lorem ipsum', author_id: '1', game_id: '2' },
    { id: '7', rating: 10, content: 'lorem ipsum', author_id: '3', game_id: '1' },
  ]
}

var schema = buildSchema(`#graphql
  type Game {
    id: ID!
    title: String!
    platform: [String!]!
  }
  type Review {
    id: ID!
    rating: Int!
    content: String!
    author: Author!
  }
  type Author {
    id: ID!
    name: String!
    verified: Boolean!
  }
  type Query {
    games: [Game]
    game(id: ID!): Game
    reviews: [Review]
    review(id: ID!): Review
    authors: [Author]
    author(id: ID!): Author
  }
  type Mutation {
    addGame(game: AddGameInput!): Game
    deleteGame(id: ID!): [Game]
    updateGame(id: ID!, edits: EditGameInput): Game
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

const writeFile = (data) => {
  fs.writeFile("db.json", data, 'utf8', function (err) {
    if (err) {
      console.log("An error occurred while writing JSON Object to File.");
    }
    console.log("JSON file has been edited.");
  });
}

var root = () => {
  var db
  fs.readFile('db.json', 'utf8', function (err, data) {
    if (err) {
      console.log("Something went wrong, while fetching data")
    }
    db = JSON.parse(data);
  })
  return {
    games() {
      return db.games
    },
    game(args) {
      return db.games.filter((game) => game.id === args.id)[0]
    },
    authors() {
      return db.authors
    },
    author(args) {
      return db.authors.find((author) => author.id === args.id)
    },
    reviews() {
      return db.reviews
    },
    review(args) {
      return db.reviews.find((review) => review.id === args.id)
    },
    addGame(args) {
      let game = {
        ...args.game,
        id: Date.now().toString()
      }
      db.games.push(game)
      writeFile(JSON.stringify(db))
      return game
    },
    deleteGame(args) {
      db.games = db.games.filter((g) => g.id !== args.id)
      writeFile(JSON.stringify(db))
      return db.games
    },
    updateGame(args) {
      db.games = db.games.map((g) => {
        if (g.id === args.id) {
          return { ...g, ...args.edits }
        }
        return g
      })
      writeFile(JSON.stringify(db))
      return db.games.find((g) => g.id === args.id)
    }
  }
}

var router = express.Router();

router.use(
  "/",
  graphqlHTTP({
    schema: schema,
    rootValue: root(),
    graphiql: true,
  })
)

module.exports = router;