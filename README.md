[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<p align="center">
  <a href="https://github.com/arjit95/vidstream">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Vidstream</h3>
  <p align="center">    
    A streaming service built on kubernetes with a vue frontend
    <br />
    <a href="docs/"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/arjit95/vidstream/issues">Report Bug</a>
    ·
    <a href="https://github.com/arjit95/vidstream/issues">Request Feature</a>
  </p>
</p>


<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the project](#about-the-project)
  * [Built With](#built-with)
* [Features](#features)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
    * [Third party services](#third-party-services)
  * [Installation](#installation)
* [Usage](#usage)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)
* [Acknowledgements](#acknowledgements)

## About the project
![Vidstream demo](images/demo.gif "Vidstream demo")

I started this project to get a hands on experience on kubernetes and docker. There are a lot of things which can be improved. You may suggest changes by raising an issue or creating a pull request by forking this repo.

### Built with
Majority of the code is written in typescript. Here is the list of all frameworks that are used.

- [MySQL](https://www.mysql.com/) - Database
- [Typescript](https://www.typescriptlang.org/)/[Nodejs](https://nodejs.org)/[Python](https://www.python.org/) - Backend
- [Vue](https://vuejs.org/)/[Nuxtjs](https://nuxtjs.org/) - Frontend 
- JWT - Authentication
- [GraphQL](https://graphql.org/)/Rest - API Requests
- [Elasticsearch](https://www.elastic.co/) - Search
- [Apache Spark](https://spark.apache.org/) - Calculating user views, generate video recommendations, trending videos
- [FFMpeg](https://ffmpeg.org/), [Shaka Packager](https://github.com/google/shaka-packager) - Video processing
- [RabbitMQ](https://www.rabbitmq.com/) - Distributed transcoding
- [Skaffold](https://skaffold.dev/) - Code reloads during developement
- [Kuberentes](https://kubernetes.io)/[Docker](https://www.docker.com/) - Microservices management

There are some additional optional frameworks which are used to improve scalibility, those will be covered in their individual guides.


## Features
- Material Design
- Login/Signup
- Adaptive video playback
- Video uploads
- Channel subscription
- Video likes, comments
- Turn off lights
- Trending, recent videos
- Recommended videos based on watch history
- Distributed video transcoding
- And many [more](docs/features.md).

## Getting Started
To get a local copy up and running you need to have docker and kubernetes cluster running. Ensure you have at least > 8GB RAM available.

### Prerequisite
- [Skaffold](https://skaffold.dev/) is needed for easier build process. Download the binary and add it to your system path.

- [Helm](https://helm.sh) can also be installed to speed up the process.
- This guide assumes that both helm and skaffold are installed.

- Start by cloning the repo
```bash
git clone https://github.com/arjit95/vidstream
cd vidstream
```

- Setup a new kuberentes namespaces
```bash
# Create a new kubernetes namespace
$ kubernetes create ns vidstream

# Switch to the new namespace
$ kubectl config set-context --current --namespace=vidstream
```
- Setup storage
```bash
# Create a new nfs volume
# Add bitnami repo for nfs server chart
$ helm repo add stable https://kubernetes-charts.storage.googleapis.com
$ helm repo update
$ helm install nfs-server stable/nfs-server-provisioner

# Create new volume and claims
# These will be used to store your videos/assets
# Before this step, change the hostPath in pv.yml to match your machine configuration 
$ kubernetes apply -f deploy/kubectl/volume/pv.yml

# Apply claim
$ kubernetes apply -f deploy/kubectl/volume/claim.yml
```
#### Third party services
- RabbitMQ

```bash
$ helm repo add bitnami https://charts.bitnami.com/bitnami
$ helm repo update
$ helm install \
    --set auth.username=<username>,auth.password=<password>,persistence.enabled=false \
    rabbitmq bitnami/rabbitmq
```
- Elasticsearch
```bash
## bare bones es installation
$ kubectl apply -f deploy/kubectl/elasticsearch.yml
```
- Update `deploy/kubectl/secrets.yml` with your rabbitmq username/password and assign new values for db username password. All values are base64 encoded. Here's the field mapping
`SECRET_QUEUE_USERNAME`: RabbitMQ username
`SECRET_QUEUE_PASSWORD`: RabbitMQ password
`SECRET_DB_USERNAME`: MySQL username
`SECRET_DB_PASSWORD`: MySQL password

- Mysql. To deploy a sharded cluster follow this [guide](docs/sharding.md)
```bash
## bare bones mysql isntallation
$ kubectl apply -f deploy/kubectl/mysql.yml

## Get mysql pod name using
$ kubectl get pods

## Exec into pod and create a new database. DB name is defined in deploy/kubectl/configmap.yml
$ kubectl exec -it <pod name> -- sh
```

### Installation
- Update `SECRET_JWT_TOKEN` in `deploy/kubectl/secrets.yml` with a random value. This will be used as a hash to generate jwt tokens.
- Get your minikube ip and private ip and update `deploy/kubectl/configmap.yml`
- Update `CONFIG_API_SERVICE` with `<minikube ip>:32767`
- Update `CONFIG_CORS_ALLOWED_ORIGINS` with `<private ip>:3000`

- Start all the services.

```bash
$ skaffold run --tail
# Or start in dev mode to enable code reloads on change.
$ skaffold dev
```
- The first build will take some time depending upon your machine.
- Meanwhile open a separate terminal and run the following commands to start your frontend service.

```bash
$ cd src/web
## Replace with your minikube ip
$ export API_SERVICE_ADDR="<minikube ip>:32767"

# Start frontend server
$ npm run dev

# Or alternatively
$ yarn dev
```

- With this setup, users will get related videos based on similar keywords. If you want user based recommendations, view counter updates, trending video generation etc, you need to setup some spark jobs to process user data. Docs for spark jobs can be viewed [here](docs/spark.md).

### Usage
If everything works up until now, you can visit the below url in your browser.

`
http://<private_ip>:3000
`

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## License

Most of the code is distributed under the MIT License, with parts of code under Apache License. See `LICENSE` for more information.

## Contact
Arjit Srivastava - [Email](mailto:srivastavarjit@gmail.com)

## Acknowledgements
- [Img Shields](https://shields.io/)
- [Vuetify](https://vuetifyjs.com/)
- [mt](https://github.com/mutschler/mt)
- [Videojs](https://videojs.com/)
- [Sintel](https://durian.blender.org/), [Big Buck Bunny](https://peach.blender.org/)

[issues-shield]: https://img.shields.io/github/issues/arjit95/vidstream.svg
[issues-url]: https://github.com/arjit95/vidstream/issues
[license-shield]: https://img.shields.io/github/license/arjit95/vidstream.svg
[license-url]: https://github.com/arjit95/vidstream/blob/master/LICENSE