#!/usr/bin/env bash
docker kill birch_frontend_staging
docker stop birch_frontend_staging
docker rm birch_frontend_staging
docker build -t birch_frontend_staging .
#docker run -d --name birch_backend -p 8090:8090 birch_backend:latest
#docker run -d -p 8090:8090 birch_backend:latest
docker run -d --name birch_frontend_staging -p 5000:5000 birch_frontend_staging:latest
docker logs birch_frontend_staging >& birch_frontend_staging.log