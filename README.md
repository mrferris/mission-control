<h1>Mission Control</h1>
This is ground station software for the UB nanosat project.
<h2>Vagrant setup</h2>
To initialize vagrant environment, you must first install <a href="http://www.vagrantup.com/downloads.html">Vagrant
</a> and <a href="https://www.virtualbox.org/wiki/Downloads">virtualbox</a> on your computer. Then, run the command 
`vagrant up` in the root project directory. When that finishes running (should take a few minutes), run `vagrant ssh` 
to ssh into the vagrant machine.
<h2>Telemetry Simulation</h2>
To simulate receiving telemetry data, first ssh into your vagrant machine, then `cd /vagrant`. Run
`python telem_sim.py `*`secondsBetweenBeacons`* where *secondsBetweenBeacons* is an optional argument specifying
the frequency of beacons. Go to localhost:8080 in your web browser to begin seeing the simulation.
