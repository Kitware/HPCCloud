# Terminology

### Jobs 

Jobs, or Primary Jobs, are special types of tasks running on an HPC resource.

### Tasks

Tasks are any thing run within simulations.

### Taskflow

Taskflows are collections of tasks run to orchestrate a given simulation workflow.

### Workflow

Workflows are collections of steps which define some pattern for executing a process.

### Projects

Projects are collections of simulations.

### Simulations

Simulations are collections of taskflows.

### Clusters

Clusters are any machine that you can run jobs on.

### Traditional Clusters

Traditional cluster are dedicated HPC resources, usually based on physical hardware.

### AWS Profile

AWS (Amazon Web Services) profiles consist of a Access key and a Secret key with which a user can provision EC2 instances.

### EC2 Instances

EC2 Instances are virtual machines running on [Amazon's EC2](https://aws.amazon.com/ec2/).

### ParaViewWeb

ParaViewWeb is a tool in Paraview which allows a user to use ParaView through a web browser.

### Simput

A simulation deck input tool. Consult the [Simput GitHub repository](https://github.com/Kitware/simput) for more.

### Simulation step

Simulation steps symbolize different taskflows within a simulation. They can have different states aswell. For example many steps have the substeps "Start" which starts a taskflow and "View" which views logs and statuses for the taskflow.
