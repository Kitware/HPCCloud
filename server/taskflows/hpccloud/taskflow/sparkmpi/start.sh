#!/usr/bin/env bash
# based on https://github.com/Kitware/spark-mpi-experimentation/blob/master/experimentations/14-spark-pipeline/start.sh

export JAVA_HOME="/usr/lib/jvm/java-8-openjdk-amd64/"
export SPARK_HOME="/data/sebastien/SparkMPI/spark-2.1.1-bin-hadoop2.7"
export MPI_SIZE=$1
export SPARK_SIZE=$2

export HYDRA_PROXY_PORT=55555

/data/sebastien/SparkMPI/spark-mpi/install/bin/pmiserv -n ${MPI_SIZE} hello &

/data/sebastien/SparkMPI/spark-2.1.1-bin-hadoop2.7/bin/spark-submit --master spark://beast:7077 ./pvw-spark.py