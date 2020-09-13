#### Vidstream [WIP]
A full featured streaming service on kubernetes

#### Running
This guide assumes you have a running kubernetes cluster and have > 8GB RAM.

- Install [skaffold](https://skaffold.dev)
- Run `requirements.sh`
- Run `skaffold dev`

#### TODO
- [API] Migrate proxy, graphql services to golang.
- [Web] Add comments/like support
- [Web] Add views increment support
- [Web] Add recommendation/search service
- [Web] Add recents/trending page
- [Web] Add pagination support
- [Web] Add profile/banner upload support
- [API] Add playlist support
- [API/Web] Split metadata code into smaller modules