#!/bin/bash

apt-get install apache2-utils -y
htdigest -c admin.htdigest localhost admin
docker run \
	--volume=/:/rootfs:ro \
	--volume=/var/run:/var/run:rw \
	--volume=/sys:/sys:ro \
	--volume=/var/lib/docker/:/var/lib/docker:ro \
	--volume=$(pwd):/root/monitor:r \
	--publish=8080:8080 \
	--detach=true \
	--name=cadvisor \
	google/cadvisor:latest \
	-http_digest_file /root/monitor/admin.htdigest --http_digest_realm localhost
