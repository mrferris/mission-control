import radio
import json
from pymongo import MongoClient
import time
import redis


def com_thread():
    print "IN COM THREAD"
    #Instantiate db and radio.
    client = MongoClient()
    rdb = redis.StrictRedis('localhost')
    db = client.test
    
    #Create db collections
    messages = db.messages
    files = db.files
    beacons = db.beacons

    r = radio.Radio()
    
    while True:
        
        message_string = r.receive_sim_data()
        message = None
        print "Message_string: " + message_string
        print "Message_len: " + str(len(message_string))
        try:
            message = json.loads(message_string)

        except ValueError:
            print "Malformed JSON received."
        
        if message is not None:
            rdb.publish('beacon_update',message_string)
#        message = receive('message.json')



def receive(file_name):

    with open(file_name) as json_file:
        return json.load(json_file)

        
#if __name__ == "__main__":
#    com_thread()

