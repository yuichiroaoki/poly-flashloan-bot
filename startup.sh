#!/bin/bash
app="flashbot"
docker build -t ${app} . 
docker run ${app}