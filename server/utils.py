import os
import json
import pymysql.cursors

class Config:

    def __init__(self):
        #Load config into memory and print version
        fdiv = "/"
        if os.name == "nt":
            # change based on OS
            fdiv = "\\"
        basepath = os.path.dirname(os.path.abspath(__file__)) #this works on any OS
        with open(basepath + fdiv + 'config.json') as config_file:
            self.config = json.loads(config_file.read())
            print(" * Version " + self.config['version'])

    def getSQLCreds(self):
        return self.config['sql']

class SQL:

    def __init__(self, config):
        # just comment out the #bind-address line in /etc/mysql/my.cnf
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
        if (isinstance(result, dict)):
            return result
        else:
            return {"tracks" : result}

    def allCounts(self):
        sql = "SELECT Songs, relations, users, maxid, plcount, (relations - Songs) AS diff FROM  (  SELECT COUNT(*) AS Songs, relations, users, maxid, plcount FROM sp_songs  JOIN (SELECT COUNT(*) AS relations FROM sp_relation) AS rel  JOIN (SELECT COUNT(*) AS users FROM sp_users) AS usr  JOIN (SELECT MAX(id) AS maxid FROM sp_users) AS m  JOIN (SELECT COUNT(*) AS plcount FROM sp_playlists) AS pl  ) AS counts"
        params = ()
        result = self.query(sql, params)
        if (isinstance(result, dict)):
            return result
        else:
            return {"counts" : result}
            
    def query(self, query, params):
        try:
            with self.connection.cursor() as c:
                c.execute(query, params)
                res = c.fetchall()
                return res
        except:
            return self.error()

    def error(self):
        return { "error" : "internal" }