from flask import Flask, render_template
import time, json, random

app = Flask(__name__)

random.seed(int(time.time()))

@app.route("/")
def index():
    return render_template("index.jinja")

@app.route("/beacon_update")
def beacon_update():
    while(int(time.time())%1 != 0):
        pass
    time.sleep(1)
    telem_sim_json_dict = generate_sim_data()
    return json.dumps(telem_sim_json_dict)

def generate_sim_data():
    json_dict = {}
    json_dict['timestamp'] = int(time.time()) * 1000
    json_dict['com'] = sim_com_data()
    json_dict['thermal'] = sim_thermal_data()
    json_dict['power'] = sim_power_data()
    json_dict['cdh'] = sim_cdh_data()
    json_dict['adc'] = sim_adc_data()
    return json_dict

def sim_com_data():
    com_data = {}
    com_data['rssi'] = random_float(-40, 0, 3)
    com_data['ack'] = random.randint(0, 10)
    com_data['nack'] = random.randint(0, 10)
    return com_data

def sim_thermal_data():
    thermal_data = {}
    thermal_data['vis_cam'] = random_temp()
    thermal_data['vis_lens_1'] = random_temp()
    thermal_data['vis_lens_2'] = random_temp()
    thermal_data['inf_cam'] = random_temp()
    thermal_data['inf_lens_1'] = random_temp()
    thermal_data['inf_lens_2'] = random_temp()
    thermal_data['rxn_wheels'] = random_temp()
    thermal_data['csk_stack'] = random_temp()
    thermal_data['edison_stack'] = random_temp()
    thermal_data['battery'] = random_temp()
    thermal_data['+y_panel'] = random_temp()
    thermal_data['-y_panel'] = random_temp()
    thermal_data['-z_panel'] = random_temp()
    thermal_data['+z_panel'] = random_temp()
    thermal_data['+x_panel'] = random_temp()
    thermal_data['-x_panel'] = random_temp()
    return thermal_data

def sim_power_data():
    power_data = {}
    power_data['+x_current'] = random_current()
    power_data['-x_current'] = random_current()
    power_data['-y_current'] = random_current()
    power_data['+y_current'] = random_current()
    power_data['+z_current'] = random_current()
    power_data['-z_current'] = random_current()
    power_data['+x_voltage'] = random_voltage()
    power_data['-x_voltage'] = random_voltage()
    power_data['-y_voltage'] = random_voltage()
    power_data['+y_voltage'] = random_voltage()
    power_data['+z_voltage'] = random_voltage()
    power_data['-z_voltage'] = random_voltage()
    power_data['battery_voltage'] = random_float(50, 100, 1)
    power_data['5v_current'] = random_current()
    power_data['3v3_current'] = random_current()
    power_data['12v_current'] = random_current()
    power_data['rxn_current'] = random_current()
    power_data['vis_cam_current'] = random_current()
    power_data['inf_cam_current'] = random_current()
    return power_data

def sim_cdh_data():
    cdh_data = {}
    cdh_data['cpu_usage'] = random_float(0, 1, 2)
    cdh_data['memory_usage'] = random_float(0, 1, 2)
    cdh_data['storage_usage'] = random_float(0, 100, 2)
    return cdh_data

def sim_adc_data():
    adc_data = {}
    adc_data['rxn_x_torque'] = random_torque()
    adc_data['rxn_y_torque'] = random_torque()
    adc_data['rxn_z_torque'] = random_torque()
    adc_data['magnetorquer_x_current'] = random_current()
    adc_data['magnetorquer_y_current'] = random_current()
    adc_data['magnetorquer_z_current'] = random_current()
    return adc_data

def random_float(low, high, precision):
    random_float = random.random()*(high - low) + low
    return round(random_float, precision)

def random_torque():
    return random_float(2, 20, 1)

def random_temp():
    return random_float(70, 100, 2)

def random_current():
    return random_float(1500, 3000, 0)

def random_voltage():
    return random_float(5, 20, 1)

if __name__ == "__main__":
    app.run(host="0.0.0.0")
