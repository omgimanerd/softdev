from flask import Flask
from flask import redirect, render_template, request, session

from server.database_manager import DatabaseManager
from server.text_api import TextAPI
from server.util import Util
from server.weather_api import WeatherAPI

import atexit
import threading
import time

dbm = DatabaseManager.create()
text_api = TextAPI.create()
weather_api = WeatherAPI.create()
sent_today = False

# Creates a background thread in the Flask app so that we can constantly check
# for times and send texts when necessary.
def create_app():
  app = Flask(__name__)
  sent_today = False
  thread = threading.Thread()

  def interrupt():
    thread.cancel()

  def run():
    global sent_today
    if not sent_today and str(time.strftime('%H:%M')) == '08:00':
      users = dbm.get_all_users()
      for user in users:
        text_api.send_text(user['phone'],
                           weather_api.get_forecast_string(user['zipcode']))
      sent_today = True

    if sent_today and str(time.strftime('%H:%M')) == '16:00':
      sent_today = False
    thread = threading.Timer(50, run, ())
    thread.start()

  run()
  atexit.register(interrupt)
  return app

app = create_app()
app.secret_key = 'blah'

## HOME PAGE ##
@app.route('/')
@app.route('/home')
def index():
  user = session.get('user', None)
  username = None
  if user:
    userdata = dbm.get_user_by_username(user)
    username = userdata['username']
  return render_template('index.html', username=username)


## ABOUT PAGE: outlines project, specifically how it works ##
@app.route('/about')
def about():
  return render_template('about.html')


## REGISTER PAGE: registers users for access to weather alerts ##
@app.route('/register', methods=['GET', 'POST'])
def register():
  if request.method == 'GET':
    return render_template('register.html')

  username = request.form.get('username', '')
  password = request.form.get('password', '')
  confirm_password = request.form.get('confirm_password', '')
  zipcode = request.form.get('zipcode', '')
  phone = request.form.get('phone', '')

  # Check the validity of the username.
  if Util.checkUsername(username) and password == confirm_password:
    # If the username was valid, attempt to register the user.
    if dbm.register_user(username, password, zipcode, phone):
      # If the registration was successful, redirect them to their user
      # settings page.
      session['user'] = username
      text_api.send_text(phone, 'Welcome to Weather Text!')
      text_api.send_text(phone, weather_api.get_forecast_string(zipcode))
      return redirect('/user')
    # If the registration was not successful, keep them here and
    # tell them the error.
    return render_template('register.html', message='Username taken.')
  # If their username was invalid, tell them so.
  return render_template('register.html', message='Invalid username.')


## LOGIN PAGE ##
@app.route('/login', methods=['GET', 'POST'])
def login():
  user = session.get('user', None)
  if user:
    return redirect('/user')
  if request.method == 'GET':
    return render_template('login.html')

  # Logs the user in if they are authorized.
  username = request.form.get('username', '')
  password = request.form.get('password', '')
  if dbm.is_user_authenticated(username, password):
    session['user'] = username
    return redirect('/user')
  return render_template('login.html', message='Invalid credentials.')


## USER SETTINGS PAGE ##
@app.route('/user')
def user():
  user = session.get('user', None)
  if not user:
    return render_template('register.html',
                           message='You are not a registered user!')
  userdata = dbm.get_user_by_username(user)
  return render_template('user.html', userdata=userdata)

## CHANGE SETTINGS ROUTE ##
@app.route('/change_settings', methods=['GET', 'POST'])
def change_settings():
  if request.method == "GET":
    return redirect('/user')

  user = session.get('user', None)
  if not user:
    return render_template('register.html',
                           message='You are not a registered user!')

  zipcode = request.form.get('zipcode', '')
  phone = request.form.get('phone', '')
  metric = request.form.get('metric', '') == 'Celsius'
  dbm.set_user_data(user, zipcode, phone, metric)

  userdata = dbm.get_user_by_username(user)
  return render_template('user.html', userdata=userdata,
                         message='Settings updated.')

## CHANGE PASSWORD ROUTE ##
@app.route('/change_password', methods=['GET', 'POST'])
def change_password():
  user = session.get('user', None)
  if not user:
    return render_template('register.html',
                           message='You are not a registered user!')

  old_password = request.form.get('old_password', '')
  new_password = request.form.get('new_password', '')
  confirm_new_password = request.form.get('confirm_new_password', '')
  if dbm.is_user_authenticated(user, old_password) and (
    new_password == confirm_new_password):
    dbm.set_user_password(user, new_password)

  return redirect('/user')


## LOGOUT ##
@app.route('/logout')
def logout():
  session.clear()
  return redirect('/')


if __name__ == '__main__':
  app.debug = True
  app.run()
