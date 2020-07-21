#!/bin/bash

helm install --set auth.username=test \
    --set auth.password=test \
    --set persistence.enabled=false \
    rabbitmq bitnami/rabbitmq

helm install --set storageClass.mountOptions[0]="vers=4.2" \
    nfs-server stable/nfs-server-provisioner

kubectl apply -f kubernetes-manifests/pv.yml