from flask import Flask
from flask import render_template
from radio import com
from pymongo import MongoClient
import threading
import redis

app = Flask(__name__)

@app.route("/index")
def welcome():
    
    return render_template('index.jinja')

@app.route("/livetest")
def test():

    r = redis.Redis('localhost')
    pubsub = r.pubsub()
    pubsub.subscribe('live_telem')
    for item in pubsub.listen():
        if item['data'] != 1:
            return str(item['data'])
    


@app.route("/missioncontrol")
def missioncontrol():

    return "Mission control. Displays telemetry and provides control interface. Telemetry in close-to-realtime."

if __name__ == "__main__":

    client = MongoClient()
    db = client.test
    r = redis.Redis()
    messages = db.messages

    
    
    t = threading.Thread(target=com.com_thread)
    t.start()
    app.run(host='0.0.0.0',debug=True)

