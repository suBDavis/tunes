from flask import Flask, jsonify, render_template, request
from utils import SQL, Config, Youtube, YTparam
from flask.ext.cors import CORS

config = Config()
app = Flask(__name__)
CORS(app)
sql = SQL(config)
yt = Youtube(config)

@app.route("/")
def index():
    return render_template('index.html', id=config.getVersion(), plid="")

@app.route("/<plid>")
def indexwithplid(plid):
    return render_template('index.html', id=config.getVersion(), plid=plid)

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

#--------------------
# Search-related queries
#--------------------

@app.route("/api/search/<terms>")
def search(terms):
    return jsonify(sql.search(terms))

@app.route("/api/search/artist/<artist>/title/<title>")
def finiteSearch(artist, title):
    # artist = artist.replace("--none--" , '%')
    # title = title.replace("--none--", '%')
    return jsonify(sql.finiteSearch(artist, title))

@app.route("/api/ytsearch/video/<query>")
def ytsearch(query):
    query = query.replace("--none--", "")
    options = YTparam()
    setattr(options, 'q' , query)
    setattr(options, 'max_results' , 10)
    setattr(options, 'type' , 'video')
    response = yt.youtube_search(options)
    return jsonify(response)

@app.route("/api/suggestions/artist/<artist>/title/<title>")
def suggestions(artist, title):
    return jsonify(sql.correlation(artist, title))

#-------------------
# Playlist-related queries - currently unimplemented
#-------------------

@app.route("/api/playlist/<plid>/song", methods=['POST'])
def addToPL(plid):
    #since this is a post, we can assume the client wants to add a track.
    #let's get the other info from the POST request using 'request' library
    song_type = request.form['type']
    song_title = request.form['title']
    song_artist = request.form['artist']
    resource_id = request.form['song_id']
    index = request.form['index']
    playlist_id = plid
    return jsonify(sql.addToPL(song_type, resource_id, song_title, song_artist, playlist_id, index))

@app.route("/api/playlist/<plid>/song", methods=["DELETE"])
def removeFromPL(plid):
    #since this is a delete, we can assume the client wants to remove a track.
    #because the track must already be in the DB, we only need songid and plid
    song_id = request.form['song_id']
    #print(song_id)
    order = request.form['index']
    #print(order)
    playlist_id = plid  
    #print(plid)
    return jsonify(sql.removeFromPL(song_id, playlist_id, order))

@app.route("/api/playlist/<plid>", methods=['GET'])
def getPL(plid):
    return jsonify(sql.getPL(plid))

if __name__ == "__main__":
    #do our startup routine here
    app.run(debug=True)