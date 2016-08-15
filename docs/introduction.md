<img src="../style/logo-mono.png" width="250px"> 

HPCCloud is a web-based simulation environment platform that utilizes web technologies to deliver an innovative, interactive SaaS advanced modeling and simulation environment.

It allows simulation workflows to be developed that leverage HPC resources. The workflows are presented through a simple intuitive UI, shielding the user from much of the complexity associated with using a HPC resource.

HPCCloud supports both "traditional" HPC resources (that can be accessed using ssh key-based authentication) as well as the creation of on demand clusters in Amazon's Elastic Compute Cloud (EC2). See the [white paper](http://ieeexplore.ieee.org/xpl/login.jsp?tp=&arnumber=7396134&url=http%3A%2F%2Fieeexplore.ieee.org%2Fxpls%2Fabs_all.jsp%3Farnumber%3D7396134) for more.

We currently have support for a couple of workflows:

- [PyFR](http://www.pyfr.org) is an open-source simulation code for solving advection-diffusion type problems. Our workflow includes input desk generation, executing PyFR and post-processing using [ParaViewWeb](http://www.paraview.org/web/). See [Running simulation workflows](usage/running.md) for same usage using PyFR.
- [ParaViewWeb](http://www.paraview.org/web/) is an open-source visualization application. ParaView can be used to quickly build visualizations using qualitative and quantitative techniques. ParaView can be exposed to the Web using ParaViewWeb. Our worflow allows a data file to be uploaded and then visualized using the full power of ParaView.

[Getting Started](getting-started.md)
