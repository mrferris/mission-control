from flask import Flask
from flask import render_template
app = Flask(__name__)

@app.route("/index")
def welcome():
    return render_template('index.jinja')


@app.route("/missioncontrol")
def missioncontrol():
    return "Mission control. Displays telemetry and provides control interface. Telemetry in close-to-realtime."

if __name__ == "__main__":
    
    app.run(debug = True)

