import os
import json
import pymysql.cursors
from apiclient.discovery import build
from apiclient.errors import HttpError
from oauth2client.tools import argparser


class Config:

    def __init__(self):
        #Load config into memory and print version
        fdiv = "/"
        if os.name == "nt":
            # change based on OS - Windows is "nt"? WTF
            fdiv = "\\"
        basepath = os.path.dirname(os.path.abspath(__file__)) #this works on any OS now
        with open(basepath + fdiv + 'config.json') as config_file:
            self.config = json.loads(config_file.read())
            print(" * Version " + self.config['version'])

    def getSQLCreds(self):
        return self.config['sql']

    def getVersion(self):
        return self.config['version']

class SQL:

    def __init__(self, config):
        # just comment out the #bind-address line in /etc/mysql/my.cnf for global access
        self.creds = config.getSQLCreds()
        print(" * Loading SQL on user " + self.creds['host'] + ":" + self.creds['port'])
        self.connection = pymysql.connect(host = self.creds['host'],
                                    user=self.creds['user'],
                                    password=self.creds['pass'],
                                    db=self.creds['db'],
                                    charset = 'utf8mb4',
                                    cursorclass=pymysql.cursors.DictCursor)

    def getConnectionData(self):
        return { "server" : self.creds['host'] , "connection" : str(self.connection) }

    def tracksByPlaylist(self, plid):
        sql = "SELECT songid, plid, artist, title, album FROM sp_relation R JOIN sp_songs S ON S.guid = R.songid WHERE plid = %s"
        params = (plid,)
        result = self.query(sql, params)
        return self.checkReturn(result, "tracks")

    def allCounts(self):
        sql = "SELECT Songs, relations, users, maxid, plcount, (relations - Songs) AS diff FROM  (  SELECT COUNT(*) AS Songs, relations, users, maxid, plcount FROM sp_songs JOIN (SELECT COUNT(*) AS relations FROM sp_relation) AS rel  JOIN (SELECT COUNT(*) AS users FROM sp_users) AS usr  JOIN (SELECT MAX(id) AS maxid FROM sp_users) AS m  JOIN (SELECT COUNT(*) AS plcount FROM sp_playlists) AS pl  ) AS counts"
        params = ()
        result = self.query(sql, params)
        return self.checkReturn(result, "counts")

    def topArtists(self, artist):
        sql = "SELECT artist, COUNT(*) C FROM sp_songs WHERE artist LIKE %s GROUP BY artist ORDER BY C DESC LIMIT 10"
        params = (artist + "%",)
        result = self.query(sql, params)
        return self.checkReturn(result, "artists")

    def search(self, searchterm):
        sql = "(SELECT guid, artist, title, COUNT(*) C FROM sp_songs WHERE title LIKE %s GROUP BY title ORDER BY C DESC LIMIT 10) UNION (SELECT guid, artist , '' title, COUNT(*) AS C FROM sp_songs WHERE artist LIKE %s GROUP BY artist ORDER BY C DESC LIMIT 10) ORDER BY C DESC LIMIT 10"
        params = (searchterm + "%", "%"+searchterm+"%")
        result = self.query(sql, params)
        return self.checkReturn(result, "search_result")

    def finiteSearch(self, artist, title):
        sql = "SELECT artist, title, album, guid FROM sp_songs WHERE title LIKE %s AND artist LIKE %s LIMIT 10"
        params = (title, artist)
        result = self.query(sql, params)
        return self.checkReturn(result, "search_result")
    
    #this section manages playlist stuff

    def addToPL(self, type, resourceID, title, artist, plid):
        #we will pass it this for every insert.  
        #type:  sc - soundcloud
        #       yt - youtube
        #       db - already in our db.
        #resourceid
        #       the song guid if we already have it
        #       the soundcloud resource id if they have it
        #       the youtube resource id if yt.  
        #Let's put out user-created playlists into a new table called "playlists"
        #   reason being, the sp_playlists table is just too damn big and we don't want to corrupt or screw it up.
        #If the playlist isn't there, we will create it.  check that the playlist exists every single time.  This is easier than having the client manage this crap.
        pass

    def removeFromPL(self, songid, plid):
        #if a remove happens, then the song must already have been in the db.  
        #if the song was already in the db, we can referr to it by the db it (guid from sp_songs)
        #if either songid or plid are not found, return a new internal error.
        pass

    def getPL(self, plid):
        pass

    #This runs the query against the server.        
    def query(self, query, params):
        try:
            with self.connection.cursor() as c:
                c.execute(query, params)
                res = c.fetchall()
                #print(params)
                return res 
        except:
            return self.error()
    #This creates a new error message
    def error(self):
        return { "error" : "internal"}
    #this packs the message to go back to the user
    def checkReturn(self, result, setname):
        if (isinstance(result, dict)):
            return result
        else:
            return { setname : result }

class Youtube:
    def __init__(self):
        self.DEVELOPER_KEY = "AIzaSyDPjXLEMUg88abHOXhL-PoOTWnkcvHU11o"
        self.YOUTUBE_API_SERVICE_NAME = "youtube"
        self.YOUTUBE_API_VERSION = "v3"

    def youtube_search(self,options):
        youtube = build(self.YOUTUBE_API_SERVICE_NAME, self.YOUTUBE_API_VERSION,
        developerKey=self.DEVELOPER_KEY)
        # Call the search.list method to retrieve results matching the specified
        # query term.
        search_response = youtube.search().list(
            q=options.q,
            part="id,snippet",
            maxResults=options.max_results,
            type=options.type
        ).execute()
        return search_response

class YTparam(object):
    pass