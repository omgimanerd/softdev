from flask import Flask
from flask import render_template, request

from server.data_handler import DataHandler

import sys

app = Flask(__name__)
data_handler = DataHandler.create()

@app.route('/')
def index():
  return render_template('index.html')

@app.route('/search')
def search():
  query = request.args.get('query')
  data = data_handler.search(query)
  randColor = [1, 2, 3, 4]
  return render_template('index.html', data=data, randColor=randColor, query=query)

if __name__ == '__main__':
  app.debug = '--debug' in sys.argv
  app.run()
