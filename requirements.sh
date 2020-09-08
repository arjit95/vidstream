#!/bin/bash

helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add stable https://kubernetes-charts.storage.googleapis.com
helm repo add incubator http://storage.googleapis.com/kubernetes-charts-incubator

helm install \
    --set auth.username=test,auth.password=test,persistence.enabled=false \
    rabbitmq bitnami/rabbitmq

# Create a nfs server, this will be used to temporarily store files during transcode.
# The transcoded files could be uploaded to a permanent storage once the process completes.
helm install nfs-server stable/nfs-server-provisioner

kubectl apply -f deploy/kubectl/volume/pv.yml
kubectl apply -f deploy/kubectl/volume/claim.yml

# Install spark operator
kubectl create ns spark-operator
helm install incubator/sparkoperator:v1beta2-1.1.2-2.4.5 --namespace spark-operator

# Install vitess operator, setup db
kubectl apply -f https://raw.githubusercontent.com/vitessio/vitess/master/examples/operator/operator.yaml
kubectl apply -f deploy/kubectl/db/cluster.yml

# Start port-forward
curl https://raw.githubusercontent.com/vitessio/vitess/master/examples/operator/pf.sh | sh

# Create lookup schema
vtctlclient ApplySchema -sql="$(cat deploy/kubectl/db/schema/lookup/lookup_schema.sql)" lookup
vtctlclient ApplyVSchema -vschema="$(cat deploy/kubectl/db/schema/lookup/vschema.json)" lookup

# Create users schema
# Vitess throws an error for the below statement, but the query executes successfully.
# We can ignore it for now. We can avoid this by merging foreign keys while creating the table
# so a single sql file will be executed.
vtctlclient ApplySchema -sql="$(cat deploy/kubectl/db/schema/user/*.sql)" vidstream
vtctlclient ApplyVSchema -vschema="$(cat deploy/kubectl/db/schema/user/vschema.json)" vidstream

# Update configmap to use db service
set +H
DB_SERVICE=$(kubectl get service --selector="planetscale.com/component=vtgate,planetscale.com/cell" -o name)
DB_SERVICE=($(echo "$DB_SERVICE" | tr '/' '\n'))
set -H
sed -i -e "s/<DB_SERVICE_ADDR>/${DB_SERVICE[2]}:3306/g" deploy/kubectl/configmap.yml

unalias mysql
unalias vtctlclient