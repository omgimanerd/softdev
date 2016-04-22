#!/usr/bin/python
# This class handles the parsing of text.

import re
import requests
import xmltodict

NAME_MATCH_REGEXP = '\s[A-Z][a-z]+ [A-Z][a-z]+'
TIME_MATCH_REGEXP = '[0-9]+-[0-9]+-[0-9]{2,}|[A-Z][a-z]+ [0-9]+([a-z]{2})?, [0-9]{4}|[0-9]+/[0-9]+/[0-9]{2,}'
HITWORD_MATCH_REGEXP = "\s[A-Za-z']+"

class TextParser():
  def __init__(self, stopwords):
    self.stopwords = stopwords

  @staticmethod
  def create():
    stopwords = []
    with open('./stopwords.txt') as f:
      stopwords = map(lambda x: x.strip(), f.readlines())
    return TextParser(stopwords)

  def find_names(self, text):
    if text:
      return re.findall(NAME_MATCH_REGEXP, text)
    return []

  def find_dates(self, text):
    if text:
      return re.findall(TIME_MATCH_REGEXP, text)
    return []

  def find_places(self, text):
    place_match_regexp = self._generate_place_regexp()
    if text:
      return re.findall(place_match_regexp, text)
    return []

  def find_hitwords(self, text):
    if text:
      data = []
      for word in re.findall(HITWORD_MATCH_REGEXP, text):
        if word.lower().strip() in self.stopwords:
          continue
        data.append(word.lower().strip())
      return data
    return []

  def _generate_place_regexp(self):
    ending = ["Avenue", "Street", "Road", "Lane", "Boulevard", "Parkway",
              "Alley"]
    newexp = ""
    for i in ending:
      newexp += "[0-9]* ?[A-Z][a-z]+ " + i + "|"

    newexp += "([A-Z][a-z]+ ?)+, ([A-Z][a-z]+ ?)+"
    return newexp


if __name__ == '__main__':
  t = TextParser.create()
  print t.find_hitwords("functino() {} javascript dfha wioe hit word")

  print t.generate_place_regexp()
