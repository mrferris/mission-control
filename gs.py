from flask import Flask
from flask import render_template
from flask import request
from radio import com
from pymongo import MongoClient
import threading
import redis

app = Flask(__name__)
r = redis.Redis('localhost')

#Welcome/future-login screen
@app.route("/index")
def welcome():

    return render_template('index.jinja')


#GET for telemetry beacon updates. Called via ajax.
@app.route("/beacon_update")
def beacon_update():

    pubsub = r.pubsub()
    pubsub.subscribe('beacon_update')
    for item in pubsub.listen():
        if item['data'] != 1:
            print "GOT BEACON DATA"
            print str(item['data'])
            return str(item['data'])
    

#POST for telemetry request with JSON {"request":"adc"} for example
@app.route("/request_update")
def request_telemetry():

    #Alert com thread to transmit telemetry request
    request_json = request.get_json()
    request_type = request.form['requested_telem']
    if request_type is None or request_type not in valid_telem_requests:
        return 100

    r.publish('request',request_type)
    #Wait for response from com
    pubsub = r.pubsub()
    pubsub.subscribe(request_type)
    for item in pubsub.listen():
        if isinstance(item['data'],str):
            return item['data']


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
    app.run(host='0.0.0.0',debug=True,use_reloader=False,threaded=True)    

