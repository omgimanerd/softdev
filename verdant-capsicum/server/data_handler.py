#!/usr/bin/python
# This file handles all data access to Google and handles the parsing of the
# data it retrieves.

from bs4 import BeautifulSoup

import google
import re
import requests

from text_parser import TextParser

class DataHandler():
  def __init__(self):
    pass

  @staticmethod
  def create():
    return DataHandler() 

  def _search_google(self, query, limit=4):
    urls = []
    result = google.search(query, start=0, stop=10)
    for r in result:
      urls.append(r)
    return urls[:min(len(urls), limit)]

  def _get_page(self, url, souped=False):
    response = requests.get(url)
    if response.status_code == 200:
      if souped:
        soup = BeautifulSoup(response.text, 'html.parser')
        for script in soup(["script", "style"]):
          script.extract() 
        return soup.get_text()
      return response.text
    return None

  def search(self, query, hits=10):
    urls = self._search_google(query)
    text_parser = TextParser.create()

    if 'who' in query.lower():
      names_aggregation = {}
      for url in urls:
        names = text_parser.find_names(self._get_page(url))
        for name in names:
          if names_aggregation.get(name, None):
            names_aggregation[name] += 1
          else:
            names_aggregation[name] = 1
      data = sorted(names_aggregation,
                    key=names_aggregation.get)[::-1][:10]
      return {
        'keyword': 'who',
        'data': data
      }

    elif 'where' in query.lower():
      places_aggregation = {}
      for url in urls:
        places = text_parser.find_names(self._get_page(url))
        for place in places:
          if places_aggregation.get(place, None):
            places_aggregation[place] += 1
          else:
            places_aggregation[place] = 1
      data = sorted(places_aggregation,
                    key=places_aggregation.get)[::-1][:10]
      return {
        'keyword': 'where',
        'data': data
      }

    else:
      hitword_aggregation = {}
      for url in urls:
        words = text_parser.find_hitwords(self._get_page(url, souped=True))
        for word in words:
          if hitword_aggregation.get(word, None):
            hitword_aggregation[word] += 1
          else:
            hitword_aggregation[word] = 1
      data = sorted(hitword_aggregation,
                    key=hitword_aggregation.get)[::-1][:10]
      return {
        'keyword': None,
        'data': data
      }
  
if __name__ == '__main__':
  d = DataHandler.create()
  print d.search("who played spiderman")
