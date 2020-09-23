import os
from urllib.parse import urlparse

from pyspark import SparkContext
from pyspark.sql import SQLContext, Row
from pyspark.sql.functions import current_timestamp, col, sum, lit
from pyspark.sql.types import StructField, StructType, IntegerType

q = """
   {{
      "query": {{
         "range": {{
            "@timestamp": {{
               "gte": "now-{duration}/m",
               "lt": "now/m"
            }}
         }}
      }}
   }}
"""

# Should match cron configuration
q = q.format(duration=os.getenv("INTERVAL", "24h"))
sc = SparkContext(appName="TrendsCalculator")
sql_context = SQLContext(sc)
es_addr = "{scheme}://{host}:{port}".format(
   scheme=os.getenv("CONFIG_ELASTICSEARCH_SCHEME"),
   host=os.getenv("CONFIG_ELASTICSEARCH_HOST"),
   port=os.getenv("CONFIG_ELASTICSEARCH_PORT")
)

es_config = { 
   "es.nodes": es_addr,
   "es.nodes.discovery": "false",
   "es.nodes.wan.only": "true",
   "es.write.operation": "update",
   "query": q
}

reader = sql_context.read.format("org.elasticsearch.spark.sql").options(**es_config)
df = reader.load("watch")
df = df.groupBy("video_id") \
  .count() \
  .sort("count", ascending=False) \
  .select(col("count").alias("views"), "video_id")

# df.show()

# Get last 10 trending videos
db_url = "jdbc:mysql://{host}:{port}/{db}".format(
   host=os.getenv("CONFIG_DB_SERVICE"),
   port=os.getenv("CONFIG_DB_PORT"),
   db=os.getenv("CONFIG_DB_NAME")
)

sql_config = {
   "url": db_url,
   "driver": "com.mysql.cj.jdbc.Driver",
   "dbtable": "trending",
   "user": os.getenv("SECRET_DB_USERNAME"),
   "password": os.getenv("SECRET_DB_PASSWORD"),
   "fetchSize": "1000"
}

trending_df = sql_context.read.format('jdbc').load(**sql_config)
trending_df = trending_df.sort("timestamp", ascending=False).limit(1).select(col("views").alias("c_views"), col("video_id"))

df = df.join(trending_df, on='video_id', how='left_outer').na.fill(0, "c_views")
df = df \
   .withColumn("sum", col("views") + col("c_views")) \
   .drop("views") \
   .drop("c_views") \
   .select(col("sum").alias("views"), col("video_id"))

df.write \
   .mode("append") \
   .format("jdbc") \
   .options(**sql_config) \
   .save()