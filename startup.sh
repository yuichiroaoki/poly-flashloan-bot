#!/bin/bash

app="poly-flashloan-bot"

docker build -t ${app} . 
docker run ${app}
