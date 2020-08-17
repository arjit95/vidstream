import os
from urllib.parse import urlparse

from pyspark import SparkContext
from pyspark.sql import SQLContext, Row
from pyspark.sql.functions import current_timestamp, col
from pyspark.sql.types import StructField, StructType, IntegerType

q = """
   {
      "query": {
         "range": {
            "@timestamp": {
               "gte": "now-{duration}/m",
               "lt": "now/m"
            }
         }
      }
   }
"""

# Should match cron configuration
q = q.format(duration=os.getenv("TRENDS_DURATION", "1h"))
sc = SparkContext(appName="TrendsCalculator")
sql_context = SQLContext(sc)
es_config = { 
   "es.nodes": os.getenv("ELASTICSEARCH_ADDR"),
   "es.nodes.discovery": "false",
   "es.nodes.wan.only": "true",
   "es.write.operation": "update"
}

reader = sql_context.read.format("org.elasticsearch.spark.sql").options(**es_config)
df = reader.load("watch")
df = df.groupBy("video_id") \
  .count() \
  .sort("count", ascending=False) \
  .select(col("count").alias("views"), col("video_id").alias("video")) \

parsed_uri = urlparse(os.getenv("DB_SERVICE_ADDR"))
db_uri = "{protocol}://{username}:{password}@{location}?authSource=admin".format(
   protocol=parsed_uri.scheme,
   username=os.getenv("DB_USERNAME"),
   password=os.getenv("DB_PASSWORD"),
   location=parsed_uri.netloc
)

mongo_config = { 
   "spark.mongodb.output.uri": db_uri,
   "spark.mongodb.output.database": os.getenv("DB_NAME"),
   "spark.mongodb.output.collection": "trending"
}

df.write.format("mongo").mode("append").save()