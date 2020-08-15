module.exports = {
    "mappings": {
        "properties": {
            "name": {
                "type": "search_as_you_type"
            },
            "username": {
                "type": "keyword"
            },
            "model_factor": {
                "type": "dense_vector",
                "dims" : 20
            },
            "model_version": {
                "type": "keyword",
                "index": false
            },
            "model_timestamp": {
                "type": "date",
                "index": false
            }
        }
    }
}