const fs = require('fs');
const path = require('path');

module.exports.addGame = fs.readFileSync(path.join(__dirname, 'addGame.gql'), 'utf8');
module.exports.deleteGame = fs.readFileSync(path.join(__dirname, 'deleteGame.gql'), 'utf8');
module.exports.updateGame = fs.readFileSync(path.join(__dirname, 'updateGame.gql'), 'utf8');
