#!/bin/bash
################################################################################
#title           :install.sh
#description     :This script will install nodejs and yarn packages in ubuntu
#                 system
#author		       :Prashant Pokhriyal
#date            :15-11-2017
#version         :1.0.0
#usage		       :sudo ./install.sh
#bash_version    :4.1.5(1)-release
################################################################################

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update
sudo apt-get install -y yarn
sudo apt-get install -y nodejs
sudo apt-get install -y build-essential
yarn install
