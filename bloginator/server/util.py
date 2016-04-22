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

if __name__ == '__main__':
  print Util.hash('what the')
  print Util.checkUsername('omgimanerd')
  print Util.checkUsername('omgimanerd1')
  print Util.checkUsername('')
  print Util.checkUsername('uh')
  print Util.checkUsername('A#F#')
