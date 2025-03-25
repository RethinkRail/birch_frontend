#!/usr/bin/env bash
docker kill birch_frontend
docker stop birch_frontend
docker rm birch_frontend
docker build -t birch_frontend .
#docker run -d --name birch_backend -p 8090:8090 birch_backend:latest
#docker run -d -p 8090:8090 birch_backend:latest
docker run -d --name birch_frontend -p 3000:80 birch_frontend:latest

docker logs birch_frontend >& birch_frontend.log