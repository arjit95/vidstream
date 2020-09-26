## Setting up spark
Spark job will run every 24hr to generate trending videos, user recommendations, video view count. This setting can be changed by modifying there yml files.

### Setup
- Prepare kubernetes spark operator
```bash
## Prepare spark kubernetes operator
$ helm repo add incubator http://storage.googleapis.com/kubernetes-charts-incubator
$ helm repo update

# Install spark operator
$ kubectl create ns spark-operator
$ helm install incubator/sparkoperator:v1beta2-1.1.2-2.4.5 --namespace spark-operator
```
- Build docker image
```bash
$ cd src/spark
$ docker build . -t docker.pkg.github.com/arjit95/vidstream/spark-jobs:v1
$ cd ../
```
- Schedule spark pods
```bash
$ kubectl apply -f deploy/kubectl/spark/serviceaccount.yml

# schedule recommender pod
$ kubectl apply -f deploy/kubectl/spark/recommender.yml

# schedule trending, user view count pod
$ kubectl apply -f deploy/kubectl/spark/trends.yml
```