#!/usr/bin/python
# This class contains utility methods used throughout the backend.
# Author: Alvin Lin (alvin.lin.dev@gmail.com)

import hashlib
import imghdr
import os
import re
import time

BASE_APP_PATH = os.path.dirname(os.path.dirname(os.path.realpath(__name__)))

class Util:
  def __init__(self):
    """
    Constructor for the Util class, should not be called since all of Util's
    methods are static.
    """
    raise NotImplementedError("This constructor should not be called.")

  @staticmethod
  def sha256(text):
    """
    This method returns the sha256 hash of a given string.

    Parameters:
      text: string, the text to hash

    Returns:
      string
    """
    return hashlib.sha256(text).hexdigest()

  @staticmethod
  def generate_uid():
    """
    This method returns the sha256 hash of the current time for use as a
    unique indentifier.

    Parameters:
      None

    Returns:
      string
    """
    return Util.sha256(str(time.time()))

  @staticmethod
  def is_valid_username(username):
    """
    This method returns True if the given string is a valid username (only
    contains alphanumerics).

    Parameters:
      username: string, the username to test

    Returns:
      boolean
    """
    return not re.search("[^A-Za-z0-9]", username)

  @staticmethod
  def get_file_extension(filename):
    """
    This methid returns the extension of the given file name as a string.

    Parameters:
      filename: string, the file name

    Returns:
      string
    """
    return filename.split(".")[-1]

  @staticmethod
  def is_allowed_image(filestream):
    """
    This method returns True if the given filestream is a png, jpg, or jpeg
    image. To reuse the filestream, you must seek back to beginning. This is
    important to note for app.py.

    Parameters:
      filestream: file, the data stream of the file to test

    Returns:
      boolean
    """
    ALLOWED_IMAGES = ['png', 'jpg', 'jpeg']
    return imghdr.what(None, filestream.read()) in ALLOWED_IMAGES

if __name__ == "__main__":
  print Util.sha256("asdf")
  print BASE_APP_PATH
  print Util.is_valid_username("bob2#")
  print Util.generate_uid()
