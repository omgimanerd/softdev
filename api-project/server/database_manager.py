# Database Manager for the server side. Handles all queries to the MongoDB
# database.
# Author: Alvin Lin (alvin.lin.dev@gmail.com)

from bson.objectid import ObjectId
from pymongo import MongoClient

import os
import time

from util import Util

DATABASE_NAME = 'api-project'
DATABASE_URL = os.environ.get('MONGOLAB_URI', None)

class DatabaseManager():
  def __init__(self, client, db):
    """
    Constructor for a DatabaseManager. This constructor should never
    be called directly except for unit testing.
    """
    self.client = client
    self.db = db

  @staticmethod
  def create():
    """
    Factory method to create the DatabaseManager for api-project.
    Call this method to get a DatabaseManager. This method takes no
    parameters.
    """
    client = MongoClient()
    if DATABASE_URL:
      client = MongoClient(DATABASE_URL)
    db = client[DATABASE_NAME]
    db.users.create_index('username', unique=True)
    return DatabaseManager(client, db)

  def register_user(self, username, password, zipcode, phone):
    """
    Registers a user into the database and returns True upon success or
    False if the registration failed. This method will fail if the user
    exists already. This method takes the username, password, and email
    of the user to register as arguments.
    """
    try:
      self.db['users'].insert_one({
        'username': username,
        'password': Util.hash(password),
        'zipcode': zipcode,
        'phone': phone,
        'metric': False
      })
      return True
    except:
      return False

  def is_user_authenticated(self, username, password):
    """
    This method returns True if the given password matches the password
    stored in the database for the given user. This method takes a plaintext
    username and password to check as arguments.
    """
    user = self.get_user_by_username(username)
    if user:
      return user['password'] == Util.hash(password)
    return False
    
  def get_user_by_id(self, user_id):
    """
    This method returns a dictionary containing the data of a user given
    the user's ID as a string or ObjectId.
    """
    if type(user_id) is str:
      user_id = ObjectId(user_id)
    return self.db['users'].find_one({
      '_id': user_id
    })

  def get_user_by_username(self, username):
    """
    This method returns a dictionary containing the data of a user given
    the user's username.
    """
    return self.db['users'].find_one({
        'username': username
    })

  def get_all_users(self):
    """
    This method returns a list of all the registered users.
    """
    users = []
    for user in self.db['users'].find():
      users.append(user)
    return users

  def set_user_password(self, username, password):
    """
    This method changes the password of a user given the username and the new
    password of the user to change. Returns True if the change was successful
    and False otherwise.
    """
    try:
      self.db['users'].update({
        'username': username
      }, {
        '$set': {
          'password': Util.hash(password)
        }
      })
      return True
    except:
      return False

  def set_user_data(self, username, zipcode, phone, metric):
    """
    This method sets a user's personal data given the username, zipcode,
    phone number, and measurement preference of the user. Returns True if
    the change was successful and False otherwise.
    """
    try:
      self.db['users'].update({
        'username': username
      }, {
        '$set': {
          'zipcode': zipcode,
          'phone': phone,
          'metric': metric
        }
      })
      return True
    except:
      return False

if __name__ == '__main__':
  dbm = DatabaseManager.create()
  print dbm.get_all_users()
