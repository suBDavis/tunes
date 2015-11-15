from flask import Flask, jsonify, render_template
from utils import SQL, Config
from flask.ext.cors import CORS

config = Config()
app = Flask(__name__)
CORS(app)
sql = SQL(config)

@app.route("/")
def index():
    return render_template('index.html', id=config.getVersion())

@app.route("/api")
def hello():
    return "Spotitunes API Version " + config.getVersion()

@app.route("/api/mysql")
def mysql():
    return jsonify(sql.getConnectionData())

@app.route("/api/playlist/<plid>/tracks")
def tracksByPlaylist(plid):
    return jsonify(sql.tracksByPlaylist(plid))

@app.route("/api/mysql/counts")
def mysqlCounts():
    return jsonify(sql.allCounts())

@app.route("/api/artists/<name>")
def topArtists(name):
    return jsonify(sql.topArtists(name))

if __name__ == "__main__":
    #do our startup routine here
    app.run(debug=True)