FROM gcr.io/spark-operator/spark-py:v2.4.5
RUN pip install numpy sqlalchemy pymysql

COPY . /opt/src
ENTRYPOINT ["/opt/entrypoint.sh"]