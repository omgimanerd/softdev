# You Da Bomb
You Da Bomb is a multiplayer open-world game in which you control a single
player with the ability to throw a bomb. Bombs explode after a set time when they
land and push away all nearby bombs in addition to damaging all nearby players.

# Creators:
  - Alvin Lin (omgimanerd)
  - Bi Ling Wu (bilingwu)
  - Raymond Wu (Nydroam)

# Technical:
  - Made with NodeJS and Socket.IO
  - The states of all the objects are all instantiated, updated, and managed
  server side. All calculations are done server side.
  - The client merely sends intents to the server, which are processed. The
  server returns a series of JSON objects that hold the state of the world to
  the client for rendering.
  - The server holds authoritative determination over the positions and states
  of all the objects.

# Setting Up:
  This project requires node version 0.12 or greater.
  npm, bower and gulp should be installed globally on your system.
  ```
  npm install
  bower install
  gulp
  ```
  The project Gulpfile already has a few custom processes to run.
  ```bash
  gulp            # will compile the JS and LESS assets and lint the JS files

  gulp lint       # Will lint the JS assets for errors

  gulp js         # will compile and lint the JS assets

  gulp less       # will compile only the LESS assets

  gulp watch      # will watch the JS and LESS assets and compile them when
                  # they are modified

  gulp watch-js   # will only watch the JS assets

  gulp watch-less # will only watch the LESS assets
  ```
  Start the server in dev mode using `node server --dev` to serve uncompiled
  JS files during development.

# Contributing:
  - Fork this repository and set it up on your computer.
  - Commit to your own fork and send a pull request to the master repository.
  - The `search-src` script will help you search for TODOs in the source code.
  Run `search-src todo` to find things that need to be fixed or modified.
  - Note that only compiled sources are exposed on the server but are not
  committed to this repository. Do not commit compiled sources (/static/dist).
  - Your code will be reviewed and must be approved before it is merged.
  - Please use our convention of **2 space tabs that are space characters and
  not tab characters**. Document any code that you write.

Code based used with permission from Penumbra Games
