import radio
import json
from pymongo import MongoClient
import time
import redis

def com_thread():
    
    #Instantiate db and radio.
    client = MongoClient()
    r = redis.Redis()
    db = client.test
    
    #Create db collections
    messages = db.messages
    files = db.files
    beacons = db.beacons

    r = radio.Radio()
    
    while True:
        
        message_string = r.receive()
        message = json.loads(message_string)
#        message = receive('message.json')
        message["received_time"] = int(time.time())
        message_id = messages.insert(message)
        print message_id
        print message



def receive(file_name):

    with open(file_name) as json_file:
        return json.load(json_file)

        
if __name__ == "__main__":
    com_thread()

