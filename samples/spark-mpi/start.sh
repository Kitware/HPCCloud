#!/usr/bin/env bash
# based on https://github.com/Kitware/spark-mpi-experimentation/blob/master/experimentations/14-spark-pipeline/start.sh

export JAVA_HOME="/usr/lib/jvm/java-8-openjdk-amd64/"
export SPARK_HOME="{{ spark_path }}/spark-2.1.1-bin-hadoop2.7"
export SPARK_MPI_PATH="{{ spark_path }}"
export MPI_SIZE={{ mpiSize }}
export SPARK_SIZE={{ sparkSize }}

export HYDRA_PROXY_PORT=55555

${SPARK_MPI_PATH}/spark-mpi/install/bin/pmiserv -n ${MPI_SIZE} hello &

${SPARK_MPI_PATH}/spark-2.1.1-bin-hadoop2.7/bin/spark-submit --master spark://beast:7077 ./pvw-spark.py