from flask import Flask, render_template
app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.jinja")

@app.route("/beacon_update")
def beacon_update():
    telem_sim_file = open('telemsim.json')
    return telem_sim_file.read()

if __name__ == "__main__":
    app.run(host="0.0.0.0")
