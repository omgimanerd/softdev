#!/usr/bin/python
# This class file handles all database access.
# Author: Alvin Lin (alvin.lin.dev@gmail.com)

from snapshot.util import Util

import pymongo

DATABASE_NAME = "snapshot"

class DatabaseManager():
  def __init__(self, client, db):
    """
    Constructor for a DatabaseManager class, this should never be called except
    for unit testing.
    """
    self.client = client
    self.db = db

  @staticmethod
  def create():
    """
    Factory method to create a DatabaseManager class. Connects to the default
    MongoDB server.
    """
    client = pymongo.MongoClient()
    db = client[DATABASE_NAME]
    db.users.create_index("username", unique=True)
    db.games.create_index("game_name", unique=True)
    return DatabaseManager(client, db)

  def register_user(self, name, username, password, email):
    """
    This method will register a user in the database given a username and a
    password. The password will be hashed and the method will return True if
    the registration was successful. This method returns False it the username
    is already registered.

    Parameters:
      username: string, the username of the user to register
      password: string, the password of the user to register
      email: string, the email of the user to register

    Returns:
      boolean
    """
    try:
      self.db.users.insert_one({
        "name": name,
        "username": username,
        "password": Util.sha256(password),
        "email": email,
        "total_kills":0,
        "selfie_uids": [],
        "face_uids": [],
        "kills": 0,
        "deaths": 0,
      })
      return True
    except pymongo.errors.DuplicateKeyError:
      return False

  def is_user_authenticated(self, username, password):
    """
    This method checks the given username and password against the database and
    returns True if the user with the given username has the corresponding
    password hash.

    Parameters:
      username: string, the username of the user to authenticate
      password: string, the password of the user to authenticate

    Returns:
      boolean
    """
    user = self.db.users.find_one({
      "username": username
    })
    if user:
      return user["password"] == Util.sha256(password)
    return False

  def can_user_play(self, username):
    """
    This method checks the given username against the database and returns True
    if the given user has uploaded their base selfies and can participate in
    a game. It returns False if the given username is not a registered user.

    Parameters:
      username: string, the username of the user to check

    Returns;
      boolean
    """
    user = self.db.users.find_one({
      "username": username
    })
    if user:
      return len(user.get("selfie_uids", [])) >= 5
    return False

  def change_user_password(self, username, newpassword):
    """
    This method changes the password of a user given their username and the new
    password. It will return True if the change was successful.

    Parameters:
      username: string, the username of the user whose password should be changed
      newpassword: string, the new password of the user

    Returns:
      boolean
    """
    result =  self.db.users.update({
      "username": username
    }, {
      "$set": {
        "password": Util.sha256(newpassword)
      }
    })
    return result.get("n", 0) == 1

  def change_user_email(self, username, new_email):
    """
    This method changes the email of the user with the given username

    Parameters:
      username: string, the username of the user to query
      new_email: string, the email to replace the exisiting one

    Returns:
      boolean
    """
    result = self.db.users.update({
      "username": username
    }, {
      "$set": {
        "email": new_email
      }
    })
    return result.get("n",0) == 1

  def add_user_image_uid(self, username, uid):
    """
    This method adds a uid to the given user's array of image uids. It will
    return True if the change was successful.

    Parameters:
      username: string, the username of the user to add the uid to
      uid: string, the uid of the image

    Returns:
      boolean
    """
    result = self.db.users.update({
      "username": username
    }, {
      "$push": {
        "selfie_uids": uid
      }
    })
    return result.get("n", 0) == 1

  def add_user_face_uid(self, username, uid):
    """
    This method adds a uid to the given user's array of face uids. It will
    return True if the change was successful.

    Parameters:
      username: string, the username of the user to add the uid to
      uid: string, the uid of the face

    Returns:
      boolean
    """
    result = self.db.users.update({
      "username": username
    }, {
      "$push": {
        "face_uids": uid
      }
    })
    return result.get("n", 0) == 1

  def get_user(self, username):
    """
    This method returns all the data pertinent to the user given the username of
    the user to query.

    Parameters:
      username: string, the username of the user to query

    Returns:
      dict
    """
    return self.db.users.find_one({
      "username": username
    })

  def add_kills_to_user(self, username, number):
    """
    This method modifies the number of kills to the user given the username of
    the user to query and the number of kills to add. Returns True upon success

    Parameters:
      username: string, the username of the user to query

    Returns:
      boolean
    """
    result = self.db.users.update({
      "username": username
    }, {
      "$inc": {
        "kills": number
      }
    })
    return result.get("n", 0) == 1

  def add_deaths_to_user(self, username, number):
    """
    This method modifies the number of deaths to the user given the username of
    the user to query and the number of deaths to add. Returns True upon success

    Parameters:
      username: string, the username of the user to query

    Returns:
      boolean
    """
    result = self.db.users.update({
      "username": username
    }, {
      "$inc": {
        "deaths": number
      }
    })
    return result.get("n", 0) == 1

  def delete_user(self, username):
    """
    This method removes a user from the database given their username. It will
    return True if the change was successful.

    Parameters:
      username: string, the username of the user who should be deleted

    Returns:
      boolean
    """
    result = self.db.users.remove({
        "username": username
    })
    return result.get("n", 0) == 1

  def create_game(self, owner, game_name):
    """
    This method creates a new game session and returns true is successfully made,
    false if not.

    Parameters:
      owner: string, the username of the owner of the game session (first player)

    Returns:
      boolean
    """
    try:
      self.db.games.insert_one({
        "game_name": game_name,
        "players": {
          owner: {
            "kills": 0,
            "deaths": 0,
            "uploads": 0,
            "victims": [],
            "killer":"None"
          }
        },
      })
      return True
    except pymongo.errors.DuplicateKeyError:
      return False

  def join_game(self, username, game_name):
    """
    This method adds a player to a game given the player's username and the
    game's id. Returns True upon success.

    Parameters:
      game_name: string, the name of the game to add the player to
      username: string, the username of the player

    Returns:
      boolean
    """
    if username in self.get_game(game_name).get("players"):
      return False
    result = self.db.games.update({
      "game_name": game_name
    }, {
      "$set": {
        ("players.%s" % username): {
          "kills": 0,
          "deaths": 0,
          "uploads": 0,
          "victims": [],
          "killer": "None"
        }
      }
    })
    return result.get("n", 0) == 1

  def get_game(self, game_name):
    """
    This method returns the data for the game with the specified name.

    Parameters:
      game_name: string, the name of the game to query

    Returns:
      dict
    """
    return self.db.games.find_one({
      "game_name": game_name
    })

  def get_all_games(self):
    """
    This method returns all the data pertinent every game in the database.

    Parameters:
      None

    Returns:
      [dict]
    """
    return [game for game in self.db.games.find()]

  def find_games_with_player(self, username):
    """
    This method returns all the games that the given player is participating in.

    Parameters:
      username: string, the username of the player to query

    Returns:
      [dict]
    """
    return filter(lambda e: username in e.get("players", []),
                  [x for x in self.db.games.find()])

  def add_kill_to_user_in_game(self, game_name, killer_username, victim_username):
    """
    This method modifies the number of kills to the user given the username of
    the user to query.
    Will also add the name of victim to the user given the username of killer and victim.
    Returns True upon success

    Parameters:
      game_name: string, name of the game the user is playing
      killer_username: string, username of the user to query
      victim_username: string, the username of the victim

    Returns:
      boolean
    """
    result = self.db.games.update({
      "game_name": game_name
    }, {
      "$inc": {
        ("players.%s" % killer_username):{
          "kills": 1
        }
      },
      "$push": {
        ("players.%s" % killer_username):{
          "victims": victim_username
        }
      }
    })
    return result.get("n", 0) == 2

  def add_death_to_user_in_game(self, game_name, username, number):
    """
    This method modifies the number of deaths to the user given the username of
    the user to query and the number of deaths to add. Returns True upon success

    Parameters:
      game_id: string, the name of the game the user is playing
      username: string, the username of the user to query

    Returns:
      boolean
    """
    result = self.db.games.update({
      "game_name": game_name
    }, {
      "$inc": {
        ("players.%s" % username):{
          "deaths": number
        }
      }
    })
    return result.get("n", 0) == 1

if __name__ == "__main__":
  dbm = DatabaseManager.create()
  #print dbm.register_user("test2", "test2", "t2", "bob@bob.com")
  #dbm.register_user("test3", "test3", "t3", "bob@bob.com")
  #dbm.register_user("test4", "test4", "t4", "bob@bob.com")
  #dbm.create_game("test2" , "fuckmeup")
  # dbm.add_deaths_to_user_in_game(
  #dbm.add_kills_to_user_in_game(, 2)
  # print dbm.add_user_image_uid("test2", "t2")
  # print dbm.can_user_play("test2")
  # id = dbm.create_game("omgimanerd")
  # print dbm.find_games_with_player("asdfa")
  # dbm.register_user("Sara", "thing","123456", "this@gmail.com");
  # dbm.add_user_kill("thing");
  #print dbm.change_user_email("blwu", "sarawu@gmail.com")
  #print dbm.register_user("Sara", "thing","123456", "this@gmail.com")
  #print dbm.register_user("Sara", "thing","123456", "this@gmail.com")
  #print dbm.create_game("thing", "test1")
  print dbm.add_kill_to_user_in_game("Thing", "swizzle", "blwu")
