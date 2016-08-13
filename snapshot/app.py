#!/usr/bin/python

from flask import Flask
from flask import redirect, render_template, request, flash
from flask import send_from_directory, session
from datetime import timedelta
from werkzeug.contrib.fixers import ProxyFix

from snapshot.betaface_api import BetafaceApi
from snapshot.database_manager import DatabaseManager
from snapshot.util import Util

from bson.json_util import dumps

import argparse
import json
import os
import sys
import time

# This upload URL is the default used for deploy.
UPLOADS_URL = "http://snapshot.sytes.net/uploads/"
BASE_APP_PATH = os.path.dirname(os.path.realpath(__name__))

app = Flask(__name__)
app.config["UPLOADS_FOLDER"] = os.path.join(BASE_APP_PATH, "uploads")
app.secret_key = os.environ.get("SNAPSHOT_SECRET_KEY", "secret")
app.wsgi_app = ProxyFix(app.wsgi_app)

dbm = DatabaseManager.create()
# This api object is reinitialized with a different uploads url if it is provided
# in the arguments
api = BetafaceApi.create(UPLOADS_URL)

# Homepage
@app.route("/")
def index():
  user = session.get("user", None)
  return render_template("index.html",
                         debug=app.debug,
                         user=user)

# Registration
@app.route("/register", methods=["GET", "POST"])
def register():
  if request.method == "GET":
    return redirect("/")

  name = request.form.get("name", None)
  username = request.form.get("username", None)
  password = request.form.get("password", None)
  confirm_password = request.form.get("confirmPassword", None)
  email = request.form.get("email", None)

  error = None
  if username in session:
    error = "You must log out before registering a user."
  elif not Util.is_valid_username(username):
    error = "Invalid username."
  elif len(password) < 6:
    error = "Your password was too short."
  elif password != confirm_password:
    print password, confirm_password
    error = "Your passwords did not match."
  elif not dbm.register_user(name, username, password, email):
    error = "This username is taken."
  if error:
    return json.dumps({
      "success": False,
      "message": error
    })

  session["user"] = username
  return json.dumps({
    "success": True,
    "message": "Successfully registered!"
  })

# Login
@app.route("/login", methods=["GET", "POST"])
def login():
  if request.method == "GET":
    return redirect("/")

  username = request.form.get("username", None)
  password = request.form.get("password", None)

  if dbm.is_user_authenticated(username, password):
      session.permanent = True
      app.permanent_session_lifetime = timedelta(minutes=60)
      session["user"] = username
      return json.dumps({
        "success": True,
        "message": "Successfully logged in."
    })
  return json.dumps({
    "success": False,
    "message": "Invalid credentials."
  })

@app.route("/changePassword", methods=["GET", "POST"])
def changePassword():
    password = request.form.get("password")
    confirm_password = request.form.get("confirm")
    if len(password) < 6:
        message = "Password Too Short"
    elif password != confirm_password:
        message = "Passwords Do Not Match"
    else:
        dbm.change_user_password(session["user"], password)
        return json.dumps({
          "success": True,
          "message": "Success"
          })
    return json.dumps({
      "success": False,
      "message": message
    })

@app.route("/changeEmail", methods=["GET", "POST"])
def changeEmail():
    email = request.form.get("email")
    dbm.change_user_email(session["user"], email)
    return json.dumps({
      "success": True,
      "message": "Success"
      })

# Logout
@app.route("/logout", methods=["GET", "POST"])
def logout():
  session["user"] = None
  return redirect("/")

# Dashboard
@app.route("/dashboard")
def dashboard():
  user = session.get("user", None)
  if not user:
      return redirect("/")
  user_info = dbm.get_user(user)
  if not dbm.can_user_play(user):
      flash("Please Upload 5 Selfies")
      return render_template("dashboard.html",
                             debug=app.debug,
                             name=user_info.get("name"),
                             user=user_info.get("username"),
                             username=user_info.get("username"),
                             email=user_info.get("email"),
                             selfie_uids=user_info.get("selfie_uids"))

  return render_template("dashboard.html",
                         debug=app.debug,
                         name=user_info.get("name"),
                         user=user_info.get("username"),
                         username=user_info.get("username"),
                         email=user_info.get("email"),
                         selfie_uids=user_info.get("selfie_uids"))

# Dashboard selfies
@app.route("/dashboard_selfies", methods=["GET", "POST"])
def dashboard_selfies():
  if request.method == "GET":
    return redirect("/dashboard")

  user = session.get("user", None)
  if not user:
    return json.dumps({
      "success": False,
      "message": "You are not logged in!"
    })

  user_info = dbm.get_user(user)
  image = request.files.get("selfie", None)
  error_message = None

  # Check if the image is a valid upload.
  if Util.is_allowed_image(image):
    image.stream.seek(0)
    imagename = "%s_%s.%s" % (
      user, len(user_info.get("selfie_uids", [])),
      Util.get_file_extension(image.filename))
    # If the image is a valid image file, then proceed to upload it to Betaface
    # to see if there are recognizable faces in the image.
    image.save(os.path.join(app.config["UPLOADS_FOLDER"], imagename))
    image_uid = api.upload_image(imagename)
    # If you are using the ngrok workflow to serve and test images locally,
    # then running this via Python will NOT work and this api call will time
    # out since Flask is single-threaded. While sending this request to
    # Betaface, Betaface will send a request back to the server for the
    # uploaded image asset, so the API call will hang since the server cannot
    # handle serving the uploaded image asset at the same time. You must run
    # this with gunicorn with at least 1 other worker.
    image_info = api.get_image_info(image_uid)
    # If there is one and only one recognizable face, then database the uid
    # of this image and set the faces ID to the persons namespace.
    if len(image_info.get("faces", [])) == 1:
      dbm.add_user_image_uid(user, image_uid)
      face_uid = image_info["faces"][0]["uid"]
      dbm.add_user_face_uid(user, face_uid)
      api.set_face_uids_to_person([face_uid], user)
      return json.dumps({
        "success": True,
        "message": "Successfully uploaded picture."
      })
    else:
      error_message = "Your image should contain only your own face in it."
  return json.dumps({
    "success": False,
    "message": error_message if error_message else "Invalid picture."
  })

# Uploaded Images
@app.route("/uploads/<filename>")
def images(filename):
  return send_from_directory(app.config["UPLOADS_FOLDER"], filename)

# Game Page
@app.route("/game")
def game():
  user = session.get("user", None)
  if not user:
    return redirect("/")
  if not dbm.can_user_play(user):
      flash("Please Upload 5 Selfies")
      return redirect("/dashboard")
  games = dbm.find_games_with_player(user)
  user_info = dbm.get_user(user)
  return render_template("game.html",
                         debug=app.debug,
                         name=user_info.get("name"),
                         selfie_uids=user_info.get("selfie_uids"),
                         user=user,
                         games=games)

# Create game
@app.route("/create_game", methods=["GET", "POST"])
def create_game():
  if request.method == "GET":
    return redirect("/dashboard")
  user = session.get("user", None)
  if not user:
    return json.dumps({
      "success": False,
      "message": "You are not logged in."
    })
  game_name = request.form.get("gameName")
  dbm.create_game(user, game_name)
  return dumps({
    "success": True,
    "data": dbm.find_games_with_player(user)
  })

# Join game
@app.route("/join_game", methods=["GET", "POST"])
def join_game():
  if request.method == "GET":
      flash("Please Upload 5 Selfies")
      return redirect("/dashboard")
  user = session.get("user", None)
  if not user:
    return json.dumps({
      "success": False,
      "message": "You are not logged in."
    })
  game_name = request.form.get("gameName", None)
  return dumps({
    "success": dbm.join_game(user, game_name),
    "data": dbm.find_games_with_player(user)
  })

# Active games
@app.route("/active_games", methods=["GET", "POST"])
def active_games():
  user = session.get("user", None)
  if not user:
    return json.dumps({
      "success": False,
      "message": "You are not logged in."
    })
  return json.dumps({
    "success": True,
    "data": dbm.find_games_with_player(user)
  })

# Query game
@app.route("/query_game", methods=["GET", "POST"])
def query_game():
  user = session.get("user", None)
  if not user:
    return json.dumps({
      "success": False,
      "message": "You are not logged in."
    })
  game_name = request.form.get("gameName", None)
  return dumps({
    "success": True,
    "data": dbm.get_game(game_name)
  })

# Upload an image to kill
@app.route("/game_kill", methods=["POST"])
def game_kill():
  user = session.get("user", None)
  if not user:
    return json.dumps({
      "success": False,
      "message": "You are not logged in."
    })

  user_info = dbm.get_user(user)
  game_name = request.form.get("gameName", None)
  target = request.form.get("target", None)
  if not target or not game_name:
    return json.dumps({
      "success": False,
      "message": "Invalid request."
    })
  image = request.files.get("image", None)
  error_message = None

  # Check if the image is a valid upload.
  if Util.is_allowed_image(image):
    image.stream.seek(0)
    imagename = "%s.%s" % (
      Util.generate_uid(),
      Util.get_file_extension(image.filename))
    # If the image is a valid image file, then proceed to upload it to Betaface
    # to see if there are recognizable faces in the image.
    image.save(os.path.join(app.config["UPLOADS_FOLDER"], imagename))
    image_uid = api.upload_image(imagename)
    # If you are using the ngrok workflow to serve and test images locally,
    # then running this via Python will NOT work and this api call will time
    # out since Flask is single-threaded. While sending this request to
    # Betaface, Betaface will send a request back to the server for the
    # uploaded image asset, so the API call will hang since the server cannot
    # handle serving the uploaded image asset at the same time. You must run
    # this with gunicorn with at least 1 other worker.
    image_info = api.get_image_info(image_uid)
    # If there is one and only one recognizable face, then database the uid
    # of this image and set the faces ID to the persons namespace.
    if len(image_info.get("faces", [])) == 1:
      recognition_request = api.queue_face_recognition_request(
        image_info["faces"][0]["uid"], "all")
      recognition_result = api.get_recognition_result(recognition_request)
      if len(recognition_result.get("face_matches") == 0):
        return json.dumps({
          "success": True,
          "kill": False,
          "message": "Successfully uploaded picture. Did not match %s" % target
        })

      for match in recognition_result.get("faces_matches")[0]["matches"]:
        if match.get("person_name").split("@")[0] == target and match.get("is_match"):
          ##############################################################
          ##############################################################
          ##############################################################
          ##############################################################
          ##############################################################
          ##############################################################
          # TODO: SARA THIS DOESNT WORK
#          dbm.add_kills_to_user(user, 1)
#          dbm.add_kill_to_user_in_game(game_name, user, target)
          return json.dumps({
            "success": True,
            "kill": True,
            "message": "Successfully killed %s" % target
          })
      return json.dumps({
        "success": True,
        "kill": False,
        "message": "Successfully uploaded picture. Did not match %s" % target
      })
    else:
      error_message = "No faces detected."
  return json.dumps({
    "success": False,
    "message": error_message if error_message else "Invalid picture."
  })


# remove after deploy
app.debug = True

if __name__ == "__main__":
  parser = argparse.ArgumentParser(description="Runs the server.")
  parser.add_argument("--uploads_url", default=UPLOADS_URL)
  parser.add_argument("--debug", default=False, action="store_true")
  args = parser.parse_args()
  if args.uploads_url != UPLOADS_URL:
    api = BetafaceApi.create(args.uploads_url)
  app.debug = "debug" in args
  app.run()
