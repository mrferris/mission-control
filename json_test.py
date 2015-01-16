import json

if __name__ == "__main__":
    
    with open('telem_sim_1.json') as json_file:
        beacon = json.load(json_file)


    print beacon['beacon']['cdh']
