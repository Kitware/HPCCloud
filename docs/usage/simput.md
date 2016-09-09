# Simput

Simput is a tool for simplifying the process of writing and editing simulation input files. It can be a standalone tool but for HPCCloud we've integrated it for use with PyFr simulations. 

## Usage with PyFr - euler-vortex-2d

With the steps below you'll recreate [euler-vortex-2d.ini](https://github.com/vincentlab/PyFR/blob/develop/examples/euler_vortex_2d/euler_vortex_2d.ini) in Simput. Unless mentioned below do not change default values. To begin, create a plain PyFr project and a simulation, for the simulation you will need to uplaod a mesh. Inside the simulation, to the input step and enter the values for each attribute:   

### Constants
- Add three custom constants, capitalization matters
    - `S = 13.5`
    - `M = 0.4`
    - `R = 1.5` 

### Solver
- **Settings**
    - order: 3
    - set _Viscosity Correction_ to nothing
    - set _Shock Capturing_ to nothing

- **Time Integrator**
    - initial time = `0.0`
    - final time = `50.0`
    - time step = `0.005`

- skip over **Artificial Viscosity** and **Solver Source Terms**

- **Interfaces**
    - clear _LDG Beta_ and leave it empty. 
    - clear _LDG Tau_ and leave it empty.

### Solver Interfaces

- change _Type_ to `Linear`

### Solver Elements

- Add one, change nothing

###Solution

For each of these sections add an item and change the _Type_ to the section's name.  
Rename the property in the sidebar if desired.

- type: **Plugin NaN check**
    - _nsteps_ = `50`

- type: **Plugin Writer**
    - _disk write time interval_ = `10.0`
    - _basedir_ = `.`
    - _basename_ = `euler_vortex_2d-{t:.1f}`

- type: **ics**
    - _Initial Density_ = `pow(1 - S*S*M*M*(gamma - 1)*exp(2*%(f)s)/(8*pi*pi), 1/(gamma - 1))`
    - _Initial X velocity_ = `S*y*exp(%(f)s)/(2*pi*R)`
    - _Initial Y velocity_ = `1 - S*x*exp(%(f)s)/(2*pi*R)`
    - _Initial static pressure dist_ =  
      `1/(gamma*M*M)*pow(1 - S*S*M*M*(gamma - 1)*exp(2*%(f)s)/(8*pi*pi), gamma/(gamma - 1))`
    - add the helper function: `f` and set it to `((1 - x*x - y*y)/(2*R*R))`

If you've filled in each filed as instructed above go to the simulation step you'll be able to run your simulation with the valid deck file you just created.

## Adding simulation types

For instructions on adding simulation types follow [these instructions on the Simput Github repository](https://github.com/Kitware/simput#creating-a-new-simulation-type). When you have completed the new type add a script command to `package.json` which installs the new type:

```json
scripts: {
"install:mytype": "cp ./node_modules/simput/dist/types/mytype.js ./dist/simput-mytype.js",
}
```

Add a script tag which includes the file in `dist/index.html` or else the HPCCloud will not detect your type.

```html
<script src="simput-mytype.js" type="text/javascript"></script>
```

For the workflow view which contains Simput, adapt the view from `src/workflows/pyfr/pyfr-simput/components/steps/Input/index.js`.

## Repository

Simput is fully open source and available at [github.com/Kitware/simput](https://github.com/Kitware/simput).