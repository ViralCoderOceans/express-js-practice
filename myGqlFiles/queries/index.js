const fs = require('fs');
const path = require('path');

module.exports.getAllGames = fs.readFileSync(path.join(__dirname, 'getAllGames.gql'), 'utf8');
module.exports.getGameById = fs.readFileSync(path.join(__dirname, 'getGameById.gql'), 'utf8');
