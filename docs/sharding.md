## Sharding

Sharding is achieved through [vitess](https://vitess.io/). It can be enabled by following the steps below.

### Setup
- Follow the guide [here](https://vitess.io/docs/get-started/operator/) to get your vitess operator up and running. Proceed with this guide once vtctlclient and operator are installed.
- Start your mysql cluster
```bash
# 2 shards are created by default.
$ kubectl apply -f deploy/kubectl/db/cluster.yml
```
- Create vitess schemas and table for your mysql database.
```bash
# Setup port-forwarding to access remotely
$ curl https://raw.githubusercontent.com/vitessio/vitess/master/examples/operator/pf.sh | sh

# Create lookup schema
$ vtctlclient ApplySchema -sql="$(cat deploy/kubectl/db/schema/lookup/lookup_schema.sql)" lookup
$ vtctlclient ApplyVSchema -vschema="$(cat deploy/kubectl/db/schema/lookup/vschema.json)" lookup

# Create users schema
$ vtctlclient ApplySchema -sql="$(cat deploy/kubectl/db/schema/user/*.sql)" vidstream
$ vtctlclient ApplyVSchema -vschema="$(cat deploy/kubectl/db/schema/user/vschema.json)" vidstream

# Get db service url
$ kubectl get service --selector="planetscale.com/component=vtgate,planetscale.com/cell" -o name
```
- Update db service url in configmap.
- Cleanup
```bash
# Stop port-forwarding after unalias
$ unalias mysql
$ unalias vtctlclient
```