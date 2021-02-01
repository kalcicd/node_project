#!/usr/bin/env bash

# Forces running containers to stop.
sudo docker-compose kill

# Forcefully removes any stopped service containers.
sudo docker-compose rm -f

sudo docker-compose build

# Runs the app with port(s) enabled and mapped to the host. Removes the container after run.
sudo docker-compose run --rm --service-ports app
