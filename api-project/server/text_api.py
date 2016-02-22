#!/usr/bin/python
# This class factors out all calls to the Twilio API for sending text
# notifications.
# Author: Alvin Lin (alvin.lin.dev@gmail.com)

from twilio.rest import TwilioRestClient 

import os

class TextAPI():

  def __init__(self, client):
    """
    Constructor for a TextAPI class instance.
    """
    self.client = client

  @staticmethod
  def create():
    """
    Factory method for creating an instance of a TextAPI.
    """
    SID = os.environ.get('TWILIO_SID', None)
    TOKEN = os.environ.get('TWILIO_TOKEN', None)
    if not SID:
      with open('./server/.twilio_sid.credentials') as f:
        SID = f.read()
    if not TOKEN:
      with open('./server/.twilio_token.credentials') as f:
        TOKEN = f.read()
    return TextAPI(TwilioRestClient(SID, TOKEN))

  def send_text(self, receiver, body):
    """
    Method to send a text to a given number. Returns the status of the text.

    Params:
    receiver: the number to send the text to
    body: the message to send to the receiver

    Returns:
    True if the request succeeded and False otherwise.
    """
    try:
      status = self.client.messages.create(
        to='%s' % str(receiver),
        from_='+19177460791',
        body=body
      )
      return True
    except:
      return False

if __name__ == '__main__':
  client = TextAPI.create()
  print client.send_text('17188019971', 'test')
