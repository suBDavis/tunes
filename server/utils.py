import os
import json
import pymysql.cursors
from apiclient.discovery import build
from apiclient.errors import HttpError
from oauth2client.tools import argparser
import string
import random

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

    def getYoutube(self):
        return self.config['youtube']

class SQL:

    notset = "--none--" #if we want to pass an empty field to the api

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
        sql = "(SELECT guid, artist, title, COUNT(*) C FROM sp_songs WHERE title LIKE %s AND rid != 'na' GROUP BY title ORDER BY C DESC LIMIT 10) UNION (SELECT guid, artist , '' title, COUNT(*) AS C FROM sp_songs WHERE artist LIKE %s AND rid != 'na' GROUP BY artist ORDER BY C DESC LIMIT 10) ORDER BY C DESC LIMIT 10"
        params = (searchterm + "%", "%"+searchterm+"%")
        result = self.query(sql, params)
        return self.checkReturn(result, "search_result")

    def finiteSearch(self, artist, title):
        sql = "SELECT artist, title, album, guid, resource_id, type FROM sp_songs S JOIN resource R ON S.rid = R.rid WHERE title LIKE %s AND artist LIKE %s AND S.rid != 'na' LIMIT 10"
        params = (title, artist)

        if self.isNotSet(title):
            title = '%'
            params = (title, artist)
        if self.isNotSet(artist):
            artist = '%'
            params = (title, artist)

        print(params)
        result = self.query(sql, params)
        return self.checkReturn(result, "search_result")

    def correlation(self, artist, title):
        # '--none--' means we don't want this param set
        sql = "SELECT title, artist, album, S.guid, type, resource_id, COUNT(R2.songid) CT  FROM sp_relation R JOIN sp_relation R2 ON R.plid = R2.plid JOIN sp_songs S ON R2.songid = S.guid JOIN resource Re ON S.rid = Re.rid WHERE R.songid IN ( SELECT guid FROM sp_songs WHERE title LIKE %s AND artist LIKE %s ) AND artist NOT LIKE %s GROUP BY title ORDER BY CT DESC LIMIT 10"
        params = (title, artist, artist)

        if self.isNotSet(artist):
            artist = '%'
            #we don't want to use the "artist not like" stipulation if there is no artist.
            sql = "SELECT title, artist, album, S.guid, type, resource_id, COUNT(R2.songid) CT  FROM sp_relation R JOIN sp_relation R2 ON R.plid = R2.plid JOIN sp_songs S ON R2.songid = S.guid JOIN resource Re ON S.rid = Re.rid WHERE R.songid IN ( SELECT guid FROM sp_songs WHERE title LIKE %s AND artist LIKE %s ) GROUP BY title ORDER BY CT DESC LIMIT 10"
            params = (title, artist)
        if self.isNotSet(title):
            title = '%'
            params = (title, artist, artist)
        print(params)
        result = self.query(sql, params)
        return self.checkReturn(result, "suggestions")

    #this section manages playlist stuff

    def id_generator(self, size=6, chars=string.ascii_uppercase + string.digits):
        return ''.join(random.choice(chars) for _ in range(size))
        #put everything in the same playlist so I can purge it all later.
        #return "TEMPPL"
        
    def addToPL(self, songtype, resourceID, title, artist, plid, index):
        
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
        
        #See if the song needs to be added to songs
        findSong = "SELECT guid, artist, title, rid FROM sp_songs WHERE rid = (SELECT rid  FROM resource R WHERE resource_id = %s AND R.type = %s);"
        params = (resourceID, songtype)
        result = self.query(findSong, params)
        print(result)
        
        if len(result) == 0:
            #add it to resource
            insertResource = "INSERT INTO resource (resource_id, type) VALUES (%s, %s);"
            params = (resourceID, songtype)
            result = self.query(insertResource, params)

            #insert in sp_songs
            insertSong = "INSERT INTO sp_songs (guid, artist, title, album, rid) VALUES (%s, %s, %s, %s, %s);"
            params = (resourceID, artist, title, "na", self.lastRowID())
            result = self.query(insertSong, params)
            
        #Now put it in the playlist.
        #logic for playlist location.  This will be done by the 
        if plid == "new":
            #we didn't find it.  make a new one
            plid = self.id_generator()  #TODO - check that this hasnt been used before.
            print(plid)
            # findPlaylist = "SELECT plid FROM db_playlists WHERE plid = %s"
            # params = (plid)
            # result = self.query(findPlaylist, params)

        insPLID = "INSERT INTO db_relation (plid, songid, i) VALUES (%s, %s, %s);"
        params = (plid, resourceID, index)
        result = self.query(insPLID, params)
        print(result)
        return self.checkReturn({"plid" : plid}, "addToPL")

    def removeFromPL(self, songid, plid, index):
        sql = "DELETE FROM db_relation WHERE plid=%s AND songid=%s AND i=%s"
        params = (plid, songid, index)
        result = self.query(sql, params)
        #shift the others in the database down one to compensate
        sql = "UPDATE db_relation SET i = i-1 WHERE i > %s AND plid = %s"
        params = (index, plid)
        result2 = self.query(sql, params)
        #TODO: handle error when song not found
        #if a remove happens, then the song must already have been in the db.  
        #if the song was already in the db, we can referr to it by the db it (guid from sp_songs)
        #if either songid or plid are not found, return a new internal error.
        return self.checkReturn(result, "pl_remove_result")

    def getPL(self, plid):
        sql="SELECT artist, title, album, S.guid, R.resource_id, R.type, D.i FROM db_relation D, sp_songs S, resource R WHERE D.plid = %s AND D.songid = R.resource_id AND S.rid = R.rid GROUP BY R.rid ORDER BY i asc;"
        params=(plid)
        result = self.query(sql,params)
        return(self.checkReturn(result, "pl_result"))

    #This runs the query against the server.        
    def query(self, query, params):
        try:
            with self.connection.cursor() as c:
                c.execute(query, params)
                self.connection.commit()    #commit the changes to db or they wont happen. srsly wtf this took me 30 min to find because literally who makes changes to a database and doesnt want them to stay there??????? ok tbh i guess i can think of a bunch of reasons but im still bitter 
                res = c.fetchall()
                #print(params)
                #print (res)
                return res 
        except:
            return self.error()
    def lastRowID(self):
        result = self.query("SELECT last_insert_id() as id", ())
        return result[0]['id']
    def getMaxIndexFromPLID(self, plid):
        maxIndex = "SELECT MAX(i) as max FROM db_relation WHERE plid = %s"
        params = (plid)
        result = self.query(maxIndex, params)
        return result[0]['max']
    #This creates a new error message
    def error(self):
        return { "error" : "internal"}
    #this packs the message to go back to the user
    def checkReturn(self, result, setname):
        if (isinstance(result, dict)):
            return result
        else:
            return { setname : result }

    def isNotSet(self, string):
        return string == self.notset

class Youtube:
    def __init__(self, config):
        yt_cfg = config.getYoutube()
        self.DEVELOPER_KEY = yt_cfg['DEVELOPER_KEY']
        self.YOUTUBE_API_SERVICE_NAME = yt_cfg['YOUTUBE_API_SERVICE_NAME']
        self.YOUTUBE_API_VERSION = yt_cfg['YOUTUBE_API_VERSION']
        self.youtube = build(self.YOUTUBE_API_SERVICE_NAME, self.YOUTUBE_API_VERSION,developerKey=self.DEVELOPER_KEY)

    def youtube_search(self,options):
        # Call the search.list method to retrieve results matching the specified
        # query term.
        search_response = self.youtube.search().list(
            q=options.q,
            part="id,snippet",
            maxResults=options.max_results,
            type=options.type
        ).execute()
        return search_response

class YTparam(object):
    pass