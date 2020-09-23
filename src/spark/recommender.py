import os

from pyspark import SparkContext
from pyspark.sql import SQLContext, Row
from pyspark.sql.types import StructField, StructType, StringType, DoubleType
from pyspark.sql.functions import lit, current_timestamp, unix_timestamp, col
from pyspark.ml import Pipeline, PipelineModel
from pyspark.ml.recommendation import ALS
from pyspark.ml.feature import StringIndexer

sc = SparkContext(appName="VideoRecommender")
sql_context = SQLContext(sc)
es_config = { 
   "es.nodes": os.getenv("ELASTICSEARCH_ADDR"),
   "es.nodes.discovery": "false",
   "es.nodes.wan.only": "true",
   "es.write.operation": "update"
}

reader = sql_context.read.format("org.elasticsearch.spark.sql").options(**es_config)
df = reader.load("watch").where(col("username").isNotNull())
df = df \
   .groupBy(['username', 'video_id']) \
   .agg({'duration': 'average'}) \
   .withColumnRenamed("avg(duration)", "rating")

string_indexer = StringIndexer(inputCol="video_id", outputCol="video_idx")
model = string_indexer.fit(df)
df = model.transform(df)
string_indexer = StringIndexer(inputCol="username", outputCol="user_idx")
model = string_indexer.fit(df)
df = model.transform(df)

# train
als = ALS(regParam=0.02, implicitPrefs=True, userCol="user_idx", seed=54,
         itemCol="video_idx", ratingCol="rating", coldStartStrategy="drop", rank=20)
model = als.fit(df)

# # save
ver = model.uid
ts = unix_timestamp(current_timestamp())

video_vectors = model.itemFactors \
   .join(df, model.itemFactors.id == df.video_idx, 'left_outer') \
   .select("video_id", col("features").alias("model_factor")) \
   .distinct() \
   .select("video_id", "model_factor", lit(ver).alias("model_version"), ts.alias("model_timestamp"))

user_vectors = model.userFactors \
   .join(df, df.user_idx == model.userFactors.id) \
   .select("username", col("features").alias("model_factor")) \
   .distinct() \
   .select("username", "model_factor", lit(ver).alias("model_version"), ts.alias("model_timestamp"))

user_config = es_config.copy()
user_config["es.mapping.id"] = "username"
user_vectors.write.format("org.elasticsearch.spark.sql").options(**user_config).save("users", mode="append")

video_config = es_config.copy()
video_config["es.mapping.id"] = "video_id"
video_vectors.write.format("org.elasticsearch.spark.sql").options(**video_config).save("videos", mode="append")
