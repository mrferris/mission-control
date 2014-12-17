import kiss
from time import sleep


class Radio():

    def __init__(self):

        print "Radio"
        self.serial = kiss.KISS("/dev/ttyS0",9600)
        self.serial.start()


    def receive(self):

        received_bytes = ""

        #Append bytes from serial port to message until null is received.
        while received_bytes[-3:] != 'EOT':

            new_data = self.serial.read()
            new_data = new_data[:-1]
            new_data = self.remove_non_ascii(new_data)
            
            print "new data: " + new_data
            received_bytes += new_data
            print received_bytes
            
        #Strip null
        received_bytes = received_bytes[:-3]
        return received_bytes

    telemsim = open('telemsim.json')

    def receive_sim_data(self):

        received_bytes = telemsim.readline()
        if received_bytes == '':
            telemsim.seek(0)
            received_bytes = telemsim.readline()
        sleep(0.5)
        return received_bytes

    
    def receive_one(self):
        
        return self.serial.read()

    def remove_non_ascii(self,s):

        return "".join(i for i in s if ord(i)<128)

    

if __name__ == "__main__":
    
#    r = Radio()
    while True:
        print r.receive()
        print "Received packet."


        
    
