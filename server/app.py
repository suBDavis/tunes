from flask import Flask
from utils import SQL, Config
import os
import json

config = Config()
app = Flask(__name__)
sql = SQL(config)

@app.route("/")
def hello():
    return "Hello World"


if __name__ == "__main__":
    #do our startup routine here
    app.run()