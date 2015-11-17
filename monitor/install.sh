#!/bin/bash

apt-get install apache2-utils -y
#htdigest -c admin.htdigest localhost admin
htpasswd -c /admin.htpasswd admin
docker run \
	--volume=/:/rootfs:ro \
	--volume=/var/run:/var/run:rw \
	--volume=/sys:/sys:ro \
	--volume=/var/lib/docker/:/var/lib/docker:ro \
	--publish=8080:8080 \
	--detach=true \
	--name=cadvisor \
	google/cadvisor:latest \
	-http_auth_file /rootfs/admin.htpasswd --http_auth_realm localhost
