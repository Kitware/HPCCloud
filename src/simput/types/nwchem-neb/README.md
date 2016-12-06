#NWChem

##What is NWChem?
[Sourced from [here](http://www.nwchem-sw.org/index.php/Main_Page)]:

NWChem aims to provide its users with computational chemistry tools that are scalable both in their ability to treat large scientific computational chemistry problems efficiently, and in their use of available parallel computing resources from high-performance parallel supercomputers to conventional workstation clusters.

NWChem software can handle: 

- Biomolecules, nanostructures, and solid-state
- From quantum to classical, and all combinations
- Ground and excited-states
- Gaussian basis functions or plane-waves
- Scaling from one to thousands of processors
- Properties and relativistic effects

NWChem is actively developed by a consortium of developers and maintained by the EMSL located at the Pacific Northwest National Laboratory (PNNL) in Washington State. Researchers interested in contributing to NWChem should review the Developers page. The code is distributed as open-source under the terms of the Educational Community License version 2.0 (ECL 2.0).

The NWChem development strategy is focused on providing new and essential scientific capabilities to its users in the areas of kinetics and dynamics of chemical transformations, chemistry at interfaces and in the condensed phase, and enabling innovative and integrated research at EMSL. At the same time continued development is needed to enable NWChem to effectively utilize architectures of tens of petaflops and beyond.

## Simput Integration
Simput provides a simple way to write simulation input files. This project is meant to manage NWChem simulation code. Simput requires a JSON description of an input deck. To build a Simput package use:

```sh
$ Simput -c src/ -o versions/ -t nwchem
```

Add the compiled package to Simput:

```sh
$ Simput -a versions/nwchem.js
```

## Running Simput

### Running interactively
The following command will start a server which serves Simput's interactive form.

```sh
$ Simput -i samples/empty/nwchem-empty.json -o samples/empty/.
```
