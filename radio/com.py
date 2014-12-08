import radio
import json
from pymongo import MongoClient
import time


def radio_thread():
    
    client = MongoClient()
    db = client.test
    
    messages = db.messages

    r = radio.Radio()
    with open('message.json') as json_message:
        message = json.load(json_message)
        print message
        print message["message_type"]

    message_id = messages.insert(message)
    print message_id
    
    while True:
#        message_string = r.receive()
#        message = json.loads(command_string)
#Placeholders
        message = receive('message.json')
        message["received_time"] = int(time.time())
        print message
        return


def receive(file):

    with open(file) as json_file:
        return json.load(json_file)

        
if __name__ == "__main__":
    radio_thread()

