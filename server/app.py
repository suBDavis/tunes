from flask import Flask
from utils import SQL
import os
import json

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World"

if __name__ == "__main__":
    
    #do our startup routine here
    #Load config into memory and print version
    basepath = os.path.dirname(os.path.abspath(__file__))
    with open(basepath + "\\" + 'config.json') as config:
        j = json.loads(config.read())
        print(" * Version " + j['version'])
    
    app.run()