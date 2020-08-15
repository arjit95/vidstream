#!/bin/bash

helm install \
    --set auth.username=test,auth.password=test,persistence.enabled=false,service.type=LoadBalancer \
    rabbitmq bitnami/rabbitmq

helm install nfs-server stable/nfs-server-provisioner

kubectl apply -f deploy/kubectl/volume/pv.yml
kubectl apply -f deploy/kubectl/volume/claim.yml
