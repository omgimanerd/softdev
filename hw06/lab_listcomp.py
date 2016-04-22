#!/usr/bin/python
# Author: Alvin Lin

import re

def password_validator(password):
  must_contain = ["[A-Z]", "[a-z]", "[0-9]"]
  return all([re.search(m, password) for m in must_contain])

def password_strengthifier(password):
  def get_pvalue(c):
    if c.isalpha():
      return 0.75
    elif c.isdigit():
      return 0.5
    elif c in ['.', '?', '!', '&', '#', ',', ';', ':', '-', '_', '*']:
      return 1.0
  return int(min(sum([get_pvalue(c) for c in password]), 10))

print password_validator("hi")
print password_validator("ab3F")
print password_validator("abF")
print password_validator("3F")
print password_strengthifier("abcd13")
print password_strengthifier("wha#oish")
