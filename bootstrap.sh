#!/usr/bin/env bash

apt-get update
apt-get install -y python-pip vim

pip install -r /vagrant/requirements.txt
