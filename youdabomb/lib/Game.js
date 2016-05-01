/**
 * @fileoverview Game class on the server to manage the state of existing
 * players and entities.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

var HashMap = require('hashmap');

var Constants = require('../shared/Constants');
var Util = require('../shared/Util');

var Bomb = require('./Bomb');
var Explosion = require('./Explosion');
var Player = require('./Player');

/**
 * This is the constructor for the Game class, which manages the state of
 * all the players and entities on the server.
 * @constructor
 */
function Game() {
  /**
   * This is a hashmap containing all the connected socket ids and socket
   * instances as well as the packet number of the socket and their latency.
   */
  this.clients = new HashMap();

  /**
   * This is a hashmap containing all the connected socket ids and the players
   * associated with them. This should always be parallel with sockets.
   */
  this.players = new HashMap();

  /**
   * These arrays contain entities in the game world. They do not need to be
   * stored in a hashmap because they do not have a unique id.
   * @type {Array<Entity>}
   */
  this.bombs = [];

  this.explosions = [];
}

/**
 * This is the factory method for the Game class.
 * @return {Game}
 */
Game.create = function() {
  return new Game();
};

/**
 * Creates a new player with the given name and ID.
 * @param {string} name The display name of the player.
 * @param {Object} socket The socket object of the player.
 */
Game.prototype.addNewPlayer = function(name, socket) {
  this.clients.set(socket.id, socket);
  var player = Player.generateNewPlayer(name, socket.id);
  this.players.set(socket.id, player);
};

/**
 * Removes the player with the given socket ID and returns the name of the
 * player removed.
 * @param {string} id The socket ID of the player to remove.
 * @return {string}
 */
Game.prototype.removePlayer = function(id) {
  if (this.clients.has(id)) {
    this.clients.remove(id);
  }
  var player = {};
  if (this.players.has(id)) {
    player = this.players.get(id);
    this.players.remove(id);
  }
  return player.name;
};

/**
 * Returns the name of the player with the given socket id.
 * @param {string} id The socket id to look up.
 * @return {?string}
 */
Game.prototype.getPlayerNameBySocketId = function(id) {
  var player = this.players.get(id);
  if (player) {
    return player.name;
  }
  return null;
};

/**
 * This method updates the player with the given ID according to the
 * input state sent by that player's client.
 * @param {string} id The socket ID of the the player to update.
 * @param {Object} keyboardState The user input that the player is sending.
 * @param {number} mouseAngle The angle of the player's mouse.
 * @param {Array<number>} mouseCoords The coordinates of the player's mouse.
 * @param {boolean} mouseClick The state of the player's left click.
 */
Game.prototype.updatePlayerOnInput = function(id, keyboardState,
                                              mouseAngle, mouseCoords,
                                              mouseClick) {
  var player = this.players.get(id);
  var client = this.clients.get(id);
  if (player) {
    var context = this;
    player.updateOnInput(keyboardState, mouseAngle, mouseCoords, mouseClick,
        function(x, y, targetLocation) {
          context.bombs.push(Bomb.create(x, y, targetLocation));
        }
    );
  }
};

/**
 * This method updates the state of all the objects in the game.
 */
Game.prototype.update = function() {
  var context = this;

  // Update all the players.
  var players = this.getPlayers();
  for (var i = 0; i < players.length; ++i) {
    players[i].update();
  }

  // Update all the bombs.
  for (var i = 0; i < this.bombs.length; ++i) {
    /*
     * We can safely use use slice on the bombs array because it creates a
     * copy of the array with references to the same objects.
     */
    var otherBombs = this.bombs.slice(0, i).concat(this.bombs.slice(i + 1));
    this.bombs[i].update(players, otherBombs, function(x, y) {
      context.explosions.push(Explosion.create(x, y));
    });
    if (this.bombs[i].hasExploded()) {
      this.bombs.splice(i, 1);
      i--;
    }
  }

  // Updates all the explosions.
  for (var i = 0; i < this.explosions.length; ++i) {
    this.explosions[i].update();
    if (!this.explosions[i].shouldExist()) {
      this.explosions.splice(i, 1);
      i--;
    }
  }
};

/**
 * Returns an array of the currently active players.
 * @return {Array<Player>}
 */
Game.prototype.getPlayers = function() {
  return this.players.values();
};

/**
 * Sends the state of the game to all the connected sockets after
 * filtering them appropriately.
 */
Game.prototype.sendState = function() {
  var ids = this.clients.keys();
  for (var i = 0; i < ids.length; ++i) {
    var currentPlayer = this.players.get(ids[i]);
    var currentClient = this.clients.get(ids[i]);
    currentClient.emit('update', {
      self: currentPlayer,
      players: this.players.values().filter(function(player) {
        // Filter out only the players that are visible to the current
        // player. Since the current player is also in this array, we will
        // remove the current player from the players packet and send it
        if (player.id == currentPlayer.id) {
          return false;
        }
        return player.isVisibleTo(currentPlayer);
      }),
      bombs: this.bombs.filter(function(bomb) {
        return bomb.isVisibleTo(currentPlayer);
      }),
      explosions: this.explosions.filter(function(explosion) {
        return explosion.isVisibleTo(currentPlayer);
      })
    });
  }
};

/**
 * This line is needed on the server side since this is loaded as a module
 * into the node server.
 */
module.exports = Game;
