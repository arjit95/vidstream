declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      CONFIG_API_SERVICE: string;
      CONFIG_QUEUE_SERVICE: string;
      CONFIG_DB_SERVICE: string;
      CONFIG_ELASTICSEARCH_SCHEME: string;
      CONFIG_ELASTICSEARCH_HOST: string;
      CONFIG_ELASTICSEARCH_PORT: string;
      CONFIG_LOGGER_SERVICE: string;
      CONFIG_ASSETS_SERVICE: string;
      CONFIG_UPLOAD_SERVICE: string;
      CONFIG_AUTH_SERVICE: string;
      CONFIG_METADATA_SERVICE: string;
      CONFIG_RECOMMENDATION_SERVICE: string;
      CONFIG_HLS_BASE_URL: string;

      CONFIG_CORS_ALLOWED_ORIGINS: string;

      CONFIG_UPLOADS_DIRECTORY: string;
      CONFIG_CONVERTED_DIRECTORY: string;
      CONFIG_ASSETS_DIRECTORY: string;

      CONFIG_DB_NAME: string;

      CONFIG_TRANSCODE_QUEUE: string;
      CONFIG_CONVERT_QUEUE: string;
      CONFIG_REDUCE_QUEUE: string;

      CONFIG_HTTP_PORT: string;
      CONFIG_DB_PORT: string;
      CONFIG_ENABLE_SHARDING: string;

      SECRET_QUEUE_USERNAME: string;
      SECRET_QUEUE_PASSWORD: string;
      SECRET_DB_USERNAME: string;
      SECRET_DB_PASSWORD: string;
      SECRET_JWT_TOKEN: string;
      SECRET_ID_GEN_TOKEN: string;
    }
  }
}

export {};
