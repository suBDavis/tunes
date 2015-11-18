from flask import Flask, jsonify, render_template
from utils import SQL, Config, Youtube, YTparam
from flask.ext.cors import CORS

config = Config()
app = Flask(__name__)
CORS(app)
sql = SQL(config)
yt = Youtube()

@app.route("/")
def index():
    return render_template('index.html', id=config.getVersion())

@app.route("/api")
def hello():
    return "Spotitunes API Version " + config.getVersion()

@app.route("/api/mysql")
def mysql():
    sql = SQL(config)
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

@app.route("/api/search/<terms>")
def search(terms):
    return jsonify(sql.search(terms))

@app.route("/api/search/artist/<artist>/title/<title>")
def finiteSearch(artist, title):
    return jsonify(sql.finiteSearch(artist, title))

@app.route("/api/ytsearch/video/<query>")
def ytsearch(query):
    options = YTparam()
    setattr(options, 'q' , query)
    setattr(options, 'max_results' , 10)
    setattr(options, 'type' , 'video')
    response = yt.youtube_search(options)
    return jsonify(response)

if __name__ == "__main__":
    #do our startup routine here
    app.run(debug=True)