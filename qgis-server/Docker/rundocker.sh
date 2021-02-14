#!/bin/bash 

docker build -f Dockerfile -t qgis-server ./
docker network create qgis
docker run -d --rm --name qgis-server --net=qgis --hostname=qgis-server \
              -v $(pwd)/data:/data:ro -p 5555:5555 \
              -e "QGIS_PROJECT_FILE=/data/osm.qgs" \
              qgis-server
			  
			  
docker run -d --rm --name nginx --net=qgis --hostname=nginx \
              -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf:ro -p 8080:80 \
              nginx:1.13
