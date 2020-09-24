import os
from urllib.parse import urlparse

from pyspark import SparkContext
from pyspark.sql import SQLContext, Row
from pyspark.sql.functions import col, lit, current_timestamp, unix_timestamp, sum as _sum
from sqlalchemy import create_engine


# Spark does not support mysql table updates
def save_videos_table(rdd, engine):
   query = """UPDATE videos SET views = %s WHERE id=%s"""
   for row in rdd:
      engine.execute(query, (row["views"], row["id"]))

def get_engine_uri(type, driver):
   return "{type}+{driver}://{user}:{password}@{host}:{port}/{db}".format(
      type=type,
      driver=driver,
      user=os.getenv("SECRET_DB_USERNAME"),
      password=os.getenv("SECRET_DB_PASSWORD"),
      host=os.getenv("CONFIG_DB_SERVICE"),
      port=os.getenv("CONFIG_DB_PORT"),
      db=os.getenv("CONFIG_DB_NAME")
   )

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

db_url = "jdbc:mysql://{host}:{port}/{db}".format(
   host=os.getenv("CONFIG_DB_SERVICE"),
   port=os.getenv("CONFIG_DB_PORT"),
   db=os.getenv("CONFIG_DB_NAME")
)

sql_config = {
   "url": db_url,
   "driver": "com.mysql.cj.jdbc.Driver",
   "user": os.getenv("SECRET_DB_USERNAME"),
   "password": os.getenv("SECRET_DB_PASSWORD"),
   "fetchSize": "1000"
}

sql_reader = sql_context.read.format("jdbc").options(**sql_config)

## Update view count
videos_df = sql_reader.options(**sql_config).option("dbtable", "videos").load().withColumnRenamed("views", "c_views")
videos_df = df.join(videos_df, col("video_id") == col("id"), "left_outer").drop("video_id")
videos_df = videos_df \
   .withColumn("sum", col("views") + col("c_views")) \
   .drop("views") \
   .drop("c_views") \
   .withColumnRenamed("sum", "views") \
   .select(col("id"), col("views"))

engine = create_engine(get_engine_uri("mysql", "pymysql"), pool_size=50)
save_videos_table(videos_df.rdd.collect(), engine)

# Process trending videos
#TODO: Replace with an env variable
if len(df.take(10)) < 10: # insufficient videos
   print("Too few videos, exiting...")
   exit(0)

trending_df = sql_reader.options(**sql_config).option("dbtable", "trending").load()
trending_df = trending_df \
   .sort("timestamp", ascending=False) \
   .limit(10) \
   .groupBy("video_id") \
   .agg(_sum("views").alias("c_views"))

ts = current_timestamp()
trending_df = df.join(trending_df, on='video_id', how='left_outer').na.fill(0, "c_views")
trending_df = trending_df \
   .withColumn("sum", col("views") + col("c_views")) \
   .drop("views") \
   .drop("c_views") \
   .drop("id") \
   .withColumnRenamed("sum", "views") \
   .withColumn("timestamp", ts) \
   .sort("views", ascending=False) \
   .limit(10)

trending_df.write \
   .mode("append") \
   .format("jdbc") \
   .options(**sql_config) \
   .option("dbtable", "trending") \
   .save()