# This class handles the all queries to the database to get or modify
# data.
# Author: Alvin Lin (alvin.lin@stuypulse.com)

import sqlite3
import time

from util import Util

DATABASE = 'db/bloginator.db'

class DatabaseManager():
  def __init__(self, database):
    self.database = database

  @staticmethod
  def create():
    connection = sqlite3.connect(DATABASE);
    c = connection.cursor()
    c.execute("""CREATE TABLE IF NOT EXISTS users (
              username text NOT NULL PRIMARY KEY,
              password text NOT NULL,
              fullname text NOT NULL);
              """)
    c.execute("""CREATE TABLE IF NOT EXISTS posts (
              username text NOT NULL,
              title text,
              content text,
              timestamp text NOT NULL)
              """)
    c.execute("""CREATE TABLE IF NOT EXISTS comments (
              postId text NOT NULL,
              username text NOT NULL,
              content text,
              timestamp integer NOT NULL)
              """)
    connection.commit()
    connection.close()
    return DatabaseManager(DATABASE)
  """
  This registers a user and adds them to the database assuming all validity
  checks have passed on the username except for uniqueness. This function
  will return True if the registration was successful and False if there
  already exists a user with given username.
  """
  def register_user(self, username, password, fullname):
    connection = sqlite3.connect(self.database);
    c = connection.cursor()
    result = True
    try:
      c.execute('INSERT INTO users VALUES (?, ?, ?)',
                (username, Util.hash(password), fullname))
    except sqlite3.IntegrityError:
      result = False
    connection.commit()
    connection.close()
    return result

  """
  This checks if a user is authorized given their username and password.
  Returns True if and only if the given user exists and the given password
  matches the stored password. Returns False if the given user does not
  exist or the given password does not match the stored one.
  """
  def is_user_authorized(self, username, password):
    connection = sqlite3.connect(self.database)
    c = connection.cursor()
    # We can assume username is a unique field.
    c.execute('SELECT password FROM users WHERE username=?',
              (username,))
    actual_password = c.fetchone()
    connection.close()
    if actual_password:
      return actual_password[0] == Util.hash(password)
    return False

  """
  This method adds a post into the database given the username of the person
  posting and the content of the post.
  """
  def add_post(self, username, title, content, timestamp):
    connection = sqlite3.connect(self.database)
    c = connection.cursor()
    c.execute('INSERT INTO posts VALUES (?, ?, ?, ?)',
              (username, title, content, timestamp))
    connection.commit()
    connection.close()

  """
  This method updates a post given the post id and the new title and content.
  """
  def edit_post(self, post_id, title, content,timestamp):
    connection = sqlite3.connect(self.database)
    c = connection.cursor()
    try:
      c.execute("""
                UPDATE posts SET title=?,content=?,timestamp=?
                WHERE rowid=?
                """,
                (title, content, timestamp, post_id))
      connection.commit()
      connection.close()
      return True
    except:
      connection.close()
      return False

  """
  This method returns the data of a post given the id of the post.
  """
  def get_post_by_id(self, post_id):
    connection = sqlite3.connect(self.database)
    c = connection.cursor()
    c.execute("""SELECT rowid,username,title,content,timestamp
              FROM posts WHERE rowid=?""",
              (post_id,))
    post = c.fetchone()
    connection.close()
    return post

  """
  This method fetches all the posts from a specific user.
  """
  def get_posts_by_user(self, user):
    connection = sqlite3.connect(self.database)
    c = connection.cursor()
    c.execute("""SELECT rowid,username,title,content,timestamp
              FROM posts WHERE username=?""",
              (user,))
    posts = c.fetchall()
    connection.close()
    return posts
  
  """
  This method fetches all the data we have stored on registered users.
  """
  def fetch_all_users(self):
    connection = sqlite3.connect(self.database)
    c = connection.cursor()
    c.execute('SELECT * FROM users');
    users = c.fetchall()
    connection.close()
    return users

  """
  This method fetches all the data we have stored on user posts.
  """
  def fetch_all_posts(self):
    connection = sqlite3.connect(self.database)
    c = connection.cursor()
    c.execute('SELECT rowid,username,title,content,timestamp FROM posts')
    posts = c.fetchall()
    connection.close()
    return posts

  """
  This method fetches all the data we have stored on user comments.
  """
  def fetch_all_comments(self):
    connection = sqlite3.connect(self.database)
    c = connection.cursor()
    c.execute('SELECT * FROM comments')
    comments = c.fetchall()
    connection.close()
    return comments

if __name__ == '__main__':
  d = DatabaseManager.create()
  print d.register_user('username', 'password', 'blah')
  print d.register_user('bob', 'de bilder', 'blah')
  d.add_post('bob', 'yo')
