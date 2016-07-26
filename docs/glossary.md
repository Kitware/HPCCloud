# Terminology

### Jobs 

Jobs, or Primary Jobs, are special types of tasks run in simulations.

### Tasks

Tasks are any thing run within simulations.

### Taskflow

Taskflows are a collection of tasks and jobs which are run for simulations.

### Workflow

Workflows are collections of taskflows which define how you run simulations and jobs.

### Projects

Projects are collections of simulations.

### Simulations

Simulations are collections of workflows.

### Clusters

Clusters are any machine that you can run tasks on.

### Traditional Clusters

Traditional clusters are machines that you have access and permissions for.

### AWS Profile

AWS (Amazon Web Services) profiles consist of a Access key and a Secret key with which a user can provision EC2 instances.

### EC2 Instances

EC2 Instances are clusters, or groups of clusters, running in Amazon's EC2 Cloud.

### ParaViewWeb

ParaViewWeb is a tool in Paraview which allows a user to use ParaView through a web browser.

### Simput

A simulation deck input tool. Consult the Simput GitHub repository for more.

### Simulation step

Steps of taskflows. They can have different states aswell. For example many steps have the substeps "Start" which starts a taskflow and "View" which views logs and statuses for the taskflow.