#!/bin/bash

helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add stable https://kubernetes-charts.storage.googleapis.com
helm repo add incubator http://storage.googleapis.com/kubernetes-charts-incubator

helm install \
    --set auth.username=test,auth.password=test,persistence.enabled=false,service.type=LoadBalancer \
    rabbitmq bitnami/rabbitmq

helm install nfs-server stable/nfs-server-provisioner

kubectl apply -f deploy/kubectl/volume/pv.yml
kubectl apply -f deploy/kubectl/volume/claim.yml

kubectl create ns spark-operator
helm install incubator/sparkoperator:v1beta2-1.1.2-2.4.5 --namespace spark-operator