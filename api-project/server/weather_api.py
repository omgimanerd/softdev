#!/usr/bin/python
# This class handles all request to the Wunderground API.
# Author: Alvin Lin (alvin.lin.dev@gmail.com)

import requests
import os

BASE_URL = "https://api.wunderground.com/api/%s/%s/q/%s.json"

class WeatherAPI():
  def __init__(self, key):
    """
    Constructor for the WeatherAPI class that handles calls to the
    Wunderground API.
    """
    self.key = key

  @staticmethod
  def create():
    """
    Factory method to create a WeatherAPI class.
    """
    key = os.environ.get('WUNDERGROUND_API_KEY', None)
    if not key:
      with open('./server/.wunderground_api_key.credentials') as f:
        key = f.read()
    return WeatherAPI(key)

  def _query(self, features, location):
    """
    Sends a base request to Wunderground and returns the data returned.
    This method is intended to only be a private method of this class.
    """
    request = requests.get(BASE_URL % (self.key, features, location))
    return request.json()

  def get_forecast_string(self, zipcode, metric=False):
    """
    This method returns the forecast string that will be texted to the users
    given the zipcode of the user and their preference on measurements.
    """
    try:
      data = self._query(
        'forecast', zipcode)['forecast']['txt_forecast']['forecastday']
      today = '%s: %s' % (data[0]['title'], data[0]['fcttext'])
      if metric:
        today = '%s: %s' % (data[0]['title'], data[0]['fcttext_metric'])
      tonight = '%s: %s' % (data[1]['title'], data[1]['fcttext'])
      if metric:
        tonight = '%s: %s' % (data[1]['title'], data[1]['fcttext_metric'])
      return '%s\n%s' % (today, tonight)
    except:
      return 'Your zip code is invalid!'

if __name__ == '__main__':
  w = WeatherAPI.create()
  print w.get_forecast_string('11219', metric=True)
