import jinja2
from flask import Flask
from flask import redirect, render_template, request, session
import datetime

from server.database_manager import DatabaseManager
from server.util import Util

app = Flask(__name__)
app.secret_key = 'BLAh'
dbm = DatabaseManager.create()


@app.route('/')
@app.route('/home')
def home():
  user = session.get('user', None)
  posts = dbm.fetch_all_posts();
  return render_template('index.html', user=user, posts=posts)


@app.route('/post', methods=['GET', 'POST'])
def post():
  if request.method == 'GET':
    return redirect('/')

  user = session.get('user', None)
  title = request.form.get('title', '').strip()
  content = request.form.get('content', '').strip()
  timestamp = datetime.datetime.now().strftime("%A, %d. %B %Y %I:%M%p")
  if user:
    dbm.add_post(user, title, content,timestamp)
  return redirect('/')

@app.route('/myposts')
def myposts():
    user = session.get('user',None)
    posts = dbm.get_posts_by_user(user)
    return render_template('myposts.html',user=user,posts=posts)

@app.route('/edit/<post_id>', methods=['GET', 'POST'])
def edit(post_id):
  if request.method == 'GET':
    user = session.get('user',None)
    posts = dbm.get_posts_by_user(user)
    app.jinja_env.add_extension(jinja2.ext.loopcontrols)
    return render_template('edit.html',user = user, posts = posts,post_id = int(post_id))

  title = request.form.get('title', '').strip()
  content = request.form.get('content', '').strip()
  timestamp = datetime.datetime.now().strftime("%A, %d. %B %Y %I:%M%p")

  user = session.get('user', None)
  if user:
    post = dbm.get_post_by_id(post_id)
    if post and post[1] == user:
      dbm.edit_post(post_id, title, content, timestamp)
  return redirect('/')


@app.route('/signup', methods=['GET', 'POST'])
def signup():
  if request.method == 'GET':
    return render_template('signup.html')

  fullname = request.form.get('fullname', '')
  username = request.form.get('username', '')
  password = request.form.get('password', '')
  confirm_password = request.form.get('confirmPassword', '')

  # Check the validity of the username.
  if Util.checkUsername(username) and password == confirm_password:
    # If the username was valid, attempt to register the user.
    if dbm.register_user(username, password, fullname):
      # If the registration was successful, redirect them to the
      # homepage.
      session['user'] = username
      return redirect('/')
    # If the registration was not successful, keep them here and
    # tell them the error.
    return render_template('signup.html', message='Username taken.')
  # If their username was invalid, tell them so.
  return render_template('signup.html', message='Invalid username.')


@app.route('/login', methods=['GET', 'POST'])
def login():
  if request.method == 'GET':
    return redirect('/')

  # Logs the user in if they are authorized.
  username = request.form.get('username', '')
  password = request.form.get('password', '')
  if dbm.is_user_authorized(username, password):
    session['user'] = username
    return redirect('/')
  return render_template('index.html', message='Invalid credentials.')


@app.route('/logout', methods=['GET', 'POST'])
def logout():
  if session.get('user', None):
    session['user'] = 0;
  return redirect('/')

if __name__ == '__main__':
  app.debug = True
  app.run()
