# -*- coding: utf-8 -*-


import kiss
from time import sleep


class Radio():

    def __init__(self):

        self.serial = kiss.Kiss("/dev/ttyS0",9600)
        self.serial.start()


    def receive(self):

        received_bytes = ""

        #Append bytes from serial port to message until null is received.
        while received_bytes[-3:] != 'EOT':
        
            new_data = self.serial.read()
#            new_data = self.receive_sim_data()
            
#            new_data = new_data[:-1]
            new_data = self.remove_non_ascii(new_data)
#            new_data = new_data.replace()

            print "new data: " + new_data
            received_bytes += new_data

            
            
        #Strip null
        received_bytes = received_bytes[:-3]
        print received_bytes
        return received_bytes


    def receive_sim_data(self):
        telemsim = open('../received.json')
        received_bytes = self.telemsim.readline()
        if received_bytes == '':
            self.telemsim.seek(0)
            received_bytes = self.telemsim.readline()
        sleep(0.5)
        return received_bytes

    
    def receive_one(self):
        
        return self.serial.read()

    def remove_non_ascii(self,s):

        return "".join(i for i in s if (ord(i)<128 and i != '@' and i != "`"))
    
    def transmit(self,payload):
        return self.serial.write(payload)

    

if __name__ == "__main__":
#    print int("▒▒▒▒▒▒▒▒")
    r = Radio()
    while True:
#        r.receive()
        print r.transmit("this is a string it is a test this is long")
        sleep(1)



        
    
