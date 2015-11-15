from flask import Flask, jsonify
from utils import SQL, Config
from flask.ext.cors import CORS
import os
import json

config = Config()
app = Flask(__name__)
CORS(app)
sql = SQL(config)

@app.route("/")
def hello():
    return "Hello World"

@app.route("/mysql")
def mysql():
    #print the connection stats for mysql
    return jsonify(sql.getConnectionData())

@app.route("/playlist/<plid>/tracks")
def tracksByPlaylist(plid):
    return(jsonify(sql.tracksByPlaylist(plid)))

@app.route("/mysql/counts")
def mysqlCounts():
    return(jsonify(sql.allCounts()))

if __name__ == "__main__":
    #do our startup routine here
    app.run(debug=True)