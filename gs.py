from flask import Flask
from flask import render_template
from flask import request
from radio import com
from pymongo import MongoClient
import kiss
import threading
import redis



app = Flask(__name__)
r = redis.StrictRedis('localhost')
serial = kiss.KISS("/dev/ttyS0",9600)

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

@app.route("/image_command")
def request_image():
    
    serial.write("i")
    pubsub = r.pubsub()
    pubsub.subscribe('image_update')
    for item in pubsub.listen():
        if item['data'] != 1:
            print "GOT IMAGES"
            return item['data']


@app.route("/torquer_command")
def command_torquer():

    command_map = {}
    command_map['x','forward'] = 'a'
    command_map['x','reverse'] = 'b'
    command_map['x','off'] = 'c'
    command_map['y','forward'] = 'd'
    command_map['y','reverse'] = 'e'
    command_map['y','off'] = 'f'
    command_map['z','forward'] = 'g'
    command_map['z','backward'] = 'h'
    command_map['z','off'] = 'i'

    torquer = request.form['axis']
    command = request.form['command']

    serial.write(command_map[torquer,command])

@app.route("/rxn_wheel_command")
def command_rxn():

    command_map = {}

        

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

