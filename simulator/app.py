#!/usr/bin/python
# This is the app file that is run on the server.
# Author: alvin.lin.dev@gmail.com (Alvin Lin)

from flask import Flask
from flask import redirect, render_template, request, session

import argparse
import json
import os
import traceback

def create_app(debug, secret_key, bower):
    app = Flask(__name__)
    app.debug = debug
    app.secret_key = secret_key

    @app.route("/")
    def index():
        config = session.get('config', [
            {
                'initial-population': 20,
                'starting-health': 100,
                'starting-fuel': 100
            },
            {
                'initial-population': 15,
                'starting-health': 100,
                'starting-fuel': 100
            },
            {
                'initial-population': 15,
                'starting-health': 100,
                'starting-fuel': 100
            },
            {
                'initial-population': 15,
                'starting-health': 100,
                'starting-fuel': 100
            }
        ])
        return render_template("index.html",
                               bower=bower,
                               config=config)

    @app.route("/config", methods=["POST"])
    def config():
        session["config"] = []
        try:
            for i in range(4):
                session["config"].append({
                    "initial-population": int(request.form.get(
                        "iro%s-initial-population" % i)),
                    "starting-health": int(request.form.get(
                        "iro%s-starting-health" % i)),
                    "starting-fuel": int(request.form.get(
                        "iro%s-starting-fuel" % i))
                })
            return json.dumps({
                'error': None
            })
        except:
            traceback.print_exc()
            return json.dumps({
                'error': 'One of your configuration parameters was invalid!'
            })

    return app

app = None

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Runs the server.")
    parser.add_argument("--debug", action="store_true")
    parser.add_argument("--bower", action="store_true")
    args = parser.parse_args()

    app = create_app(args.debug, os.environ.get("APP_SECRET", "secret"),
                     args.bower)
    app.run()
else:
    app = create_app(False, os.environ.get("APP_SECRET", "secret"),
                     False)
    app.run(host="0.0.0.0")
