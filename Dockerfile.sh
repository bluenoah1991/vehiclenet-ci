#!/bin/bash

repository_path=$1
image_name=$2
container_name=$3
host_port=$4
container_port=$5
options=$6

echo "Repository Path: ${repository_path}"
echo "Image Name: ${image_name}"
echo "Container Name: ${container_name}"
echo "Host Port: ${host_port}"
echo "Container Port: ${container_port}"
echo "Options: \"${options}\""

cd ${repository_path}

echo "Stop Container (${container_name})"
docker stop ${container_name}
echo "Remove Container (${container_name})"
docker rm ${container_name}
echo "Build Image (${image_name})"
docker build -t ${image_name} .
echo "Create Container (${container_name})"
docker run -itd \
	--name ${container_name} \
	-p ${host_port}:${container_port} \
	${options} \
	${image_name}
echo "Success"

