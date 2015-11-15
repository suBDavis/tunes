from flask import Flask, jsonify
from utils import SQL, Config
from flask.ext.cors import CORS

config = Config()
app = Flask(__name__)
CORS(app)
sql = SQL(config)

@app.route("/")
def hello():
    return "Spotitunes API Version " + config.getVersion()

@app.route("/mysql")
def mysql():
    return jsonify(sql.getConnectionData())

@app.route("/playlist/<plid>/tracks")
def tracksByPlaylist(plid):
    return jsonify(sql.tracksByPlaylist(plid))

@app.route("/mysql/counts")
def mysqlCounts():
    return jsonify(sql.allCounts())

@app.route("/artists/<name>")
def topArtists(name):
    return jsonify(sql.topArtists(name))

if __name__ == "__main__":
    #do our startup routine here
    app.run(debug=True)