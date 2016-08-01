HPCCloud is a Web-based simulation environment platform that utilizes Web
technologies to deliver an innovative, interactive SaaS advanced modeling and simulation
environment.

It allows simulation workflows to be developed that leverage HPC resources. The
workflows are presented through a simple intuative UI, shielding the user from much
of the complexity associated with using a HPC resource.

HPCCloud support both "traditional" HPC resources ( that can be accessed using ssh
key-based authentication ) as well as the creation of on demand clusters in Amazon's
Elastic Compute Cloud (EC2).

We currently have support for a couple of workflow:

* [PyFR](http://www.pyfr.org) is an open-source simulation code for solving advection-diffusion
type problems. Our workflow includes input desk generation, executing PyFR and post-processing
using [ParaViewWeb](http://www.paraview.org/web/). See
[Running simulation workflows](usage/running.md) for same usage using PyFR.
* [ParaViewWeb](http://www.paraview.org/web/) is an open-source visualization application.
ParaView can be used to quickly build visualizations using qualitative and
quantitiative techniques. ParaView can be exposed to the Web using ParaViewWeb.
Our worflow allows a data file to be uploaded and then visualized using the full
power of ParaView.

[Getting Started](getting-started.md)
