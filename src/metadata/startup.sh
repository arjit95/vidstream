export SECRET_DB_USERNAME=root
export SECRET_DB_PASSWORD=password 
export CONFIG_DB_NAME=vidstream
export CONFIG_HTTP_PORT=8080
export CONFIG_DB_SERVICE=localhost
export CONFIG_DB_PORT=3306
export CONFIG_ENABLE_SHARDING=1

node dist/index.js
