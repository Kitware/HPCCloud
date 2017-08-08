# Spark-MPI Workflow

This workflow is currently a work in progress. In this folder there are three project files for a demo:

- `pvw-spark.py` - Spark script
- `start.sh` - Start script
- `TiltSeries_NanoParticle_doi.tif` - Input

These files are based off [Kitware/spark-mpi-experimentation/14-spark-pipeline](https://github.com/Kitware/spark-mpi-experimentation/tree/master/experimentations/14-spark-pipeline).

## ToDo

Figure out how to get the Spark script to communicate back to HPCCloud. Primarily, trigger workflow status changes so the client knows when it's possible to connect to the target machine for visualization. 

## Warning

At time of writing the only computer this demo could run on is "Beast" a machine at KSW. To give an idea of a machine this workflow takes, Beast has about 64GB of RAM and starting this workflow with the wrong config can make Beast run out of memory. 