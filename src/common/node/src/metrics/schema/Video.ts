export const VideoSchema = {
    "mappings": {
        "properties": {
            "title": {
                "type": "search_as_you_type"
            },
            "user_id": {
                "type": "keyword"
            },
            "genres": {
                "type": "dense_vector",
                "dims": 5 
            },
            "tags": {
                "type": "dense_vector",
                "dims": 5 
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
};