import radio
import json
from pymongo import MongoClient
import time
import redis
import re


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
    remove_list = ['\x10','\x03']

    while True:
        
        message_string = r.receive()
        message_string = message_string[2:][:-2]
        message_list =  list(message_string)
        message_list = [x for x in message_list if x not in remove_list]
        message_string = ''.join(message_list)
        json_file = open("received.json","w")
        json_file.write(message_string)
        json_file.close()

            
        print message_string
        message = None
        received_json = None
        try:
            with open("received.json") as file:
#                print list(file.read())
                received_json = json.load(file)

        except ValueError:
            print "Malformed JSON received."
        
        if received_json is not None:
            if received_json['type'] == 'beacon':
                rdb.publish('beacon_update',message_string)
            elif received_json['type'] == 'images':
                rdb.publish('image_update',message_string)
            else:
                print "GOT A WRONG DOWNLINK TYPE"



def receive(file_name):

    with open(file_name) as json_file:
        return json.load(json_file)

        
if __name__ == "__main__":
    com_thread()

