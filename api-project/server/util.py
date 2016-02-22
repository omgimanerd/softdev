# This file contains utility methods used on the server side.
# Author: Alvin Lin (alvin.lin@stuypulse.com)

import hashlib
import re

class Util():

  @staticmethod
  def hash(text):
    return hashlib.sha256(text).hexdigest()

  @staticmethod
  def checkUsername(username):
    return not re.search('[^a-zA-Z0-9]', username) and len(username) > 0
