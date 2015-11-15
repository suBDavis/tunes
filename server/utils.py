import os
import json

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
        creds = config.getSQLCreds()
        print(" * Loading SQL on user " + creds['host'] + ":" + creds['port'])
        sql = "set"
