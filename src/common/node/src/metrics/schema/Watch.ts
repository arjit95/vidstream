export const WatchSchema = {
    "mappings": {
        "properties": {
            "user_id": {
                "type": "text"
            },
            "video_id": {
                "type": "text"
            },
            "rating": {
                "type": "double",
                "index": false
            }
        }
    }
}