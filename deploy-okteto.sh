#!/bin/bash

helm install \
    --set auth.username=test,auth.password=test,persistence.enabled=false \
    rabbitmq bitnami/rabbitmq
