/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {if(!global["Simput"]) global["Simput"] = {};
	if(!global["Simput"]["types"]) global["Simput"]["types"] = {};
	module.exports = global["Simput"]["types"]["pyfr"] = __webpack_require__(1);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = {
	  type: 'PyFR-1-2-0',
	  model: __webpack_require__(2),
	  lang: __webpack_require__(3),
	  convert: __webpack_require__(203)
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = {
		"order": [
			"backend",
			"constants",
			"solver",
			"solver-interfaces",
			"solver-elements",
			"solution-bcs",
			"solution"
		],
		"views": {
			"backend": {
				"id": "backend",
				"label": "Backend",
				"attributes": [
					"Backend-settings",
					[
						"Open-MP",
						"Open-CL",
						"CUDA"
					]
				],
				"names": [
					"Backend"
				]
			},
			"constants": {
				"id": "constants",
				"label": "Constants",
				"attributes": [
					"Constants"
				]
			},
			"solver": {
				"id": "solver",
				"label": "Solver",
				"attributes": [
					"Solver-settings",
					"Time Integrator",
					"Artificial Viscosity",
					"Solver-source-terms",
					"Interfaces"
				]
			},
			"solver-interfaces": {
				"id": "solver-interfaces",
				"label": "Solver Interfaces",
				"attributes": [
					[
						"Linear-int",
						"Triangular-int",
						"Quadrilateral-int"
					]
				]
			},
			"solver-elements": {
				"id": "solver-elements",
				"label": "Solver Elements",
				"attributes": [
					[
						"Triangular-el",
						"Quadrilateral-el",
						"Hexahedral-el",
						"Tetrahedral-el",
						"Prismatic-el",
						"Pyramidal-el"
					]
				]
			},
			"solution-bcs": {
				"id": "solution-bcs",
				"label": "Boundary Conditions",
				"attributes": [
					[
						"char-riem-inv",
						"no-slp-adia-wall",
						"no-slp-isot-wall",
						"slp-adia-wall",
						"sub-in-frv",
						"sub-in-ftpttang",
						"sub-out-fp",
						"sup-in-fa",
						"sup-out-fn"
					]
				],
				"size": -1
			},
			"solution": {
				"id": "solution",
				"label": "Solution",
				"attributes": [
					[
						"Filter",
						"Plugin Writer",
						"Plugin Fluidforce Name",
						"Plugin NaN check",
						"Plugin residual",
						"Plugin sampler",
						"Plugin Time average",
						"ics"
					]
				],
				"size": -1
			}
		},
		"definitions": {
			"Backend-settings": {
				"label": "Settings",
				"parameters": [
					{
						"id": "backend.precision",
						"label": "Precision",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"single",
								"double"
							],
							"values": [
								"single",
								"double"
							]
						}
					},
					{
						"id": "backend.rank_allocator",
						"label": "Rank Allocator",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"linear"
							],
							"values": [
								"linear"
							]
						}
					}
				]
			},
			"CUDA": {
				"label": "CUDA",
				"parameters": [
					{
						"id": "cuda.device_id",
						"label": "Precision",
						"type": "string",
						"size": 1
					}
				]
			},
			"Open-MP": {
				"label": "Open-MP",
				"parameters": [
					{
						"id": "open-mp.cc",
						"label": "C Compiler",
						"type": "string",
						"size": 1
					},
					{
						"id": "open-mp.cflags",
						"label": "Compiler Flags",
						"type": "string",
						"size": 1
					},
					{
						"id": "open-mp.cblas",
						"label": "Path to shared C BLAS library",
						"type": "string",
						"size": 1
					},
					{
						"id": "open-mp.cblas_type",
						"label": "Type of BLAS library",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"serial",
								"parallel"
							],
							"values": [
								"serial",
								"parallel"
							]
						}
					}
				]
			},
			"Open-CL": {
				"label": "Open-CL",
				"parameters": [
					{
						"id": "open-cl.platform_id",
						"label": "Platform ID",
						"type": "integer",
						"size": 1
					},
					{
						"id": "open-cl.device_type",
						"label": "Device Type",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"all",
								"cpu",
								"gpu",
								"accelerator"
							],
							"values": [
								"all",
								"cpu",
								"gpu",
								"accelerator"
							]
						}
					},
					{
						"id": "open-cl.device_id",
						"label": "Device ID",
						"type": "string",
						"size": 1
					}
				]
			},
			"Constants": {
				"label": "Constants",
				"parameters": [
					{
						"id": "constants.gamma",
						"label": "Gamma",
						"type": "double",
						"size": 1
					},
					{
						"id": "constants.mu",
						"label": "Mu",
						"type": "double",
						"size": 1
					},
					{
						"id": "constants.pr",
						"label": "Pr",
						"type": "double",
						"size": 1
					},
					{
						"id": "constants.cpTref",
						"label": "cpTref",
						"type": "double",
						"size": 1
					},
					{
						"id": "constants.cpTs",
						"label": "cpTS",
						"type": "double",
						"size": 1
					}
				]
			},
			"Solver-settings": {
				"label": "Settings",
				"parameters": [
					{
						"id": "solver.system",
						"label": "System",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"euler",
								"navier-stokes"
							],
							"values": [
								"euler",
								"navier-stokes"
							]
						}
					},
					{
						"id": "solver.order",
						"label": "Order",
						"type": "integer",
						"size": 1
					},
					{
						"id": "solver.anti_alias",
						"label": "Anti-alias",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"flux",
								"surf-flux",
								"div-flux",
								"flux, surf-flux",
								"flix, div-flux",
								"surf-flux, div-flux",
								"flux, surf-flux, div-flux"
							],
							"values": [
								"flux",
								"surf-flux",
								"div-flux",
								"flux, surf-flux",
								"flix, div-flux",
								"surf-flux, div-flux",
								"flux, surf-flux, div-flux"
							]
						}
					},
					{
						"id": "solver.viscosity_correction",
						"label": "Viscosity correction",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"none",
								"sutherland"
							],
							"values": [
								"none",
								"sutherland"
							]
						}
					},
					{
						"id": "solver.shock_capturing",
						"label": "Shock capturing",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"none",
								"aritificial-viscosity"
							],
							"values": [
								"none",
								"aritificial-viscosity"
							]
						}
					}
				]
			},
			"Time Integrator": {
				"label": "Time Integrator",
				"parameters": [
					{
						"id": "solver.scheme",
						"label": "Scheme",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"euler",
								"rk34",
								"rk4",
								"rk45",
								"tvd-rk3"
							],
							"values": [
								"euler",
								"rk34",
								"rk4",
								"rk45",
								"tvd-rk3"
							]
						}
					},
					{
						"id": "solver.tstart",
						"label": "Initial time",
						"type": "double",
						"size": 1
					},
					{
						"id": "solver.tend",
						"label": "Final time",
						"type": "double",
						"size": 1
					},
					{
						"id": "solver.dt",
						"label": "Time step",
						"type": "double",
						"size": 1
					},
					{
						"id": "solver.controller",
						"label": "Time step",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"none",
								"pi"
							],
							"values": [
								"none",
								"pi"
							]
						}
					},
					{
						"id": "solver.atol",
						"label": "atol",
						"type": "double",
						"size": 1
					},
					{
						"id": "solver.rtol",
						"label": "rtol",
						"type": "double",
						"size": 1
					},
					{
						"id": "solver.safety_fact",
						"label": "safety-fact",
						"type": "double",
						"size": 1
					},
					{
						"id": "solver.min_fact",
						"label": "min-fact",
						"type": "double",
						"size": 1
					},
					{
						"id": "solver.max_fact",
						"label": "max-fact",
						"type": "double",
						"size": 1
					}
				]
			},
			"Artificial Viscosity": {
				"label": "Artificial Viscosity",
				"parameters": [
					{
						"id": "solver.max_amu",
						"label": "Maximum artificial viscosity",
						"type": "double",
						"size": 1
					},
					{
						"id": "solver.s0",
						"label": "Sensor cut-off",
						"type": "double",
						"size": 1
					},
					{
						"id": "solver.kappa",
						"label": "Sensor range",
						"type": "double",
						"size": 1
					}
				]
			},
			"Interfaces": {
				"label": "Interfaces",
				"parameters": [
					{
						"id": "solver.riemann",
						"label": "Riemann Solver",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"rusanov",
								"hll",
								"hllc",
								"roe",
								"roem"
							],
							"values": [
								"rusanov",
								"hll",
								"hllc",
								"roe",
								"roem"
							]
						}
					},
					{
						"id": "solver.ldg_beta",
						"label": "LDG Beta",
						"type": "double",
						"size": 1
					},
					{
						"id": "solver.ldg_tau",
						"label": "LDG Tau",
						"type": "double",
						"size": 1
					}
				]
			},
			"Linear-int": {
				"label": "Linear",
				"parameters": [
					{
						"id": "solver.interfaces.flux_pts",
						"label": "Flux points",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"gauss-legendre",
								"gauss-legendre-lobatto"
							],
							"values": [
								"gauss-legendre",
								"gauss-legendre-lobatto"
							]
						}
					},
					{
						"id": "solver.interfaces.quad_deg",
						"label": "Degree of quadratur",
						"type": "integer",
						"size": 1
					},
					{
						"id": "solver.interfaces.quad_pts",
						"label": "Name of quadratur",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"gauss-legendre",
								"gauss-legendre-lobatto"
							],
							"values": [
								"gauss-legendre",
								"gauss-legendre-lobatto"
							]
						}
					}
				]
			},
			"Triangular-int": {
				"label": "Triangular",
				"parameters": [
					{
						"id": "solver.interfaces.flux_pts",
						"label": "Flux points",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"williams-shunn"
							],
							"values": [
								"williams-shunn"
							]
						}
					},
					{
						"id": "solver.interfaces.quad_deg",
						"label": "Degree of quadratur",
						"type": "integer",
						"size": 1
					},
					{
						"id": "solver.interfaces.quad_pts",
						"label": "Name of quadratur",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"williams-shunn",
								"witherden-vincent"
							],
							"values": [
								"williams-shunn",
								"witherden-vincent"
							]
						}
					}
				]
			},
			"Quadrilateral-int": {
				"label": "Quadrilateral",
				"parameters": [
					{
						"id": "solver.interfaces.flux_pts",
						"label": "Flux points",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"gauss-legendre",
								"gauss-legendre-lobatto"
							],
							"values": [
								"gauss-legendre",
								"gauss-legendre-lobatto"
							]
						}
					},
					{
						"id": "solver.interfaces.quad_deg",
						"label": "Degree of quadratur",
						"type": "integer",
						"size": 1
					},
					{
						"id": "solver.interfaces.quad_pts",
						"label": "Name of quadratur",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"gauss-legendre",
								"gauss-legendre-lobatto",
								"witherden-vincent"
							],
							"values": [
								"gauss-legendre",
								"gauss-legendre-lobatto",
								"witherden-vincent"
							]
						}
					}
				]
			},
			"Triangular-el": {
				"label": "Triangular",
				"parameters": [
					{
						"id": "solver.elements.soln_pts",
						"label": "Solution points",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"williams-shunn"
							],
							"values": [
								"williams-shunn"
							]
						}
					},
					{
						"id": "solver.elements.quad_deg",
						"label": "Degree of quadratur",
						"type": "integer",
						"size": 1
					},
					{
						"id": "solver.elements.quad_pts",
						"label": "Name of quadratur",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"williams-shunn",
								"witherden-vincent"
							],
							"values": [
								"williams-shunn",
								"witherden-vincent"
							]
						}
					}
				]
			},
			"Quadrilateral-el": {
				"label": "Quadrilateral",
				"parameters": [
					{
						"id": "solver.elements.soln_pts",
						"label": "Solution points",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"gauss-legendre",
								"gauss-legendre-lobatto"
							],
							"values": [
								"gauss-legendre",
								"gauss-legendre-lobatto"
							]
						}
					},
					{
						"id": "solver.elements.quad_deg",
						"label": "Degree of quadratur",
						"type": "integer",
						"size": 1
					},
					{
						"id": "solver.elements.quad_pts",
						"label": "Name of quadratur",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"gauss-legendre",
								"gauss-legendre-lobatto",
								"witherden-vincent"
							],
							"values": [
								"gauss-legendre",
								"gauss-legendre-lobatto",
								"witherden-vincent"
							]
						}
					}
				]
			},
			"Hexahedral-el": {
				"label": "Hexahedral",
				"parameters": [
					{
						"id": "solver.elements.soln_pts",
						"label": "Solution points",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"gauss-legendre",
								"gauss-legendre-lobatto"
							],
							"values": [
								"gauss-legendre",
								"gauss-legendre-lobatto"
							]
						}
					},
					{
						"id": "solver.elements.quad_deg",
						"label": "Degree of quadratur",
						"type": "integer",
						"size": 1
					},
					{
						"id": "solver.elements.quad_pts",
						"label": "Name of quadratur",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"gauss-legendre",
								"gauss-legendre-lobatto",
								"witherden-vincent"
							],
							"values": [
								"gauss-legendre",
								"gauss-legendre-lobatto",
								"witherden-vincent"
							]
						}
					}
				]
			},
			"Tetrahedral-el": {
				"label": "Tetrahedral",
				"parameters": [
					{
						"id": "solver.elements.soln_pts",
						"label": "Solution points",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"shunn-ham"
							],
							"values": [
								"shunn-ham"
							]
						}
					},
					{
						"id": "solver.elements.quad_deg",
						"label": "Degree of quadratur",
						"type": "integer",
						"size": 1
					},
					{
						"id": "solver.elements.quad_pts",
						"label": "Name of quadratur",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"shunn-ham",
								"witherden-vincent"
							],
							"values": [
								"shunn-ham",
								"witherden-vincent"
							]
						}
					}
				]
			},
			"Prismatic-el": {
				"label": "Prismatic",
				"parameters": [
					{
						"id": "solver.elements.soln_pts",
						"label": "Solution points",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"williams-shunn~gauss-legendre",
								"williams-shunn~gauss-legendre-lobatto"
							],
							"values": [
								"williams-shunn~gauss-legendre",
								"williams-shunn~gauss-legendre-lobatto"
							]
						}
					},
					{
						"id": "solver.elements.quad_deg",
						"label": "Degree of quadratur",
						"type": "integer",
						"size": 1
					},
					{
						"id": "solver.elements.quad_pts",
						"label": "Name of quadratur",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"williams-shunn~gauss-legendre",
								"williams-shunn~gauss-legendre-lobatto",
								"witherden-vincent"
							],
							"values": [
								"williams-shunn~gauss-legendre",
								"williams-shunn~gauss-legendre-lobatto",
								"witherden-vincent"
							]
						}
					}
				]
			},
			"Pyramidal-el": {
				"label": "Pyramidal",
				"parameters": [
					{
						"id": "solver.elements.soln_pts",
						"label": "Solution points",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"gauss-legendre",
								"gauss-legendre-lobatto"
							],
							"values": [
								"gauss-legendre",
								"gauss-legendre-lobatto"
							]
						}
					},
					{
						"id": "solver.elements.quad_deg",
						"label": "Degree of quadratur",
						"type": "integer",
						"size": 1
					},
					{
						"id": "solver.elements.quad_pts",
						"label": "Name of quadratur",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"witherden-vincent"
							],
							"values": [
								"witherden-vincent"
							]
						}
					}
				]
			},
			"Solver-source-terms": {
				"label": "Solver Source Terms",
				"parameters": [
					{
						"id": "solver.source-terms.rho",
						"label": "Density source term",
						"type": "string",
						"size": 1
					},
					{
						"id": "solver.source-terms.rhou",
						"label": "X-momentum source term",
						"type": "string",
						"size": 1
					},
					{
						"id": "solver.source-terms.rhov",
						"label": "Y-momentum source term",
						"type": "string",
						"size": 1
					},
					{
						"id": "solver.source-terms.rhow",
						"label": "Z-momentum source term",
						"type": "string",
						"size": 1
					},
					{
						"id": "solver.source-terms.E",
						"label": "Energy source term",
						"type": "string",
						"size": 1
					}
				]
			},
			"Filter": {
				"label": "Filter",
				"parameters": [
					{
						"id": "solution.filter.nsteps",
						"label": "Filter apply interval (in steps)",
						"type": "integer",
						"size": 1
					},
					{
						"id": "solution.filter.alpha",
						"label": "Strength of filter",
						"type": "double",
						"size": 1
					},
					{
						"id": "solution.filter.order",
						"label": "Order of filter",
						"type": "integer",
						"size": 1
					},
					{
						"id": "solution.filter.cutoff",
						"label": "Cutoff frequency",
						"type": "integer",
						"size": 1
					}
				]
			},
			"Plugin Writer": {
				"label": "Plugin Writer",
				"parameters": [
					{
						"id": "solution.plugin_writer.dt_out",
						"label": "Disk write time interval",
						"type": "double",
						"size": 1
					},
					{
						"id": "solution.plugin_writer.basedir",
						"label": "Disk write time interval",
						"type": "double",
						"size": 1
					},
					{
						"id": "solution.plugin_writer.basename",
						"label": "Output name pattern",
						"type": "string",
						"size": 1
					}
				]
			},
			"Plugin Fluidforce Name": {
				"label": "Plugin Fluidforce Name",
				"parameters": [
					{
						"id": "solution.plugin_fluidforce.nsteps",
						"label": "Integration interval",
						"type": "integer",
						"size": 1
					},
					{
						"id": "solution.plugin_fluidforce.file",
						"label": "Output file path",
						"type": "string",
						"size": 1
					},
					{
						"id": "solution.plugin_fluidforce.header",
						"label": "Output header row",
						"type": "bool"
					}
				]
			},
			"Plugin NaN check": {
				"label": "Plugin NaN check",
				"parameters": [
					{
						"id": "solution.plugin_nancheck.nsteps",
						"label": "nsteps",
						"type": "integer",
						"size": 1
					}
				]
			},
			"Plugin residual": {
				"label": "Plugin residual",
				"parameters": [
					{
						"id": "solution.plugin_residual.nsteps",
						"label": "Calculation interval",
						"type": "integer",
						"size": 1
					},
					{
						"id": "solution.plugin_residual.file",
						"label": "Output file path",
						"type": "string",
						"size": 1
					},
					{
						"id": "solution.plugin_residual.header",
						"label": "Output header row",
						"type": "integer",
						"size": 1
					}
				]
			},
			"Plugin sampler": {
				"label": "Plugin sampler",
				"parameters": [
					{
						"id": "solution.plugin_sampler.nsteps",
						"label": "nSteps",
						"type": "integer",
						"size": 1
					},
					{
						"id": "solution.plugin_sampler.samp_pts",
						"label": "Sample points",
						"type": "string",
						"size": 1
					},
					{
						"id": "solution.plugin_sampler.format",
						"label": "Format",
						"type": "enum",
						"size": 1,
						"enum": {
							"labels": [
								"primitive",
								"conservative"
							],
							"values": [
								"primitive",
								"conservative"
							]
						}
					},
					{
						"id": "solution.plugin_sampler.file",
						"label": "File",
						"type": "string",
						"size": 1
					},
					{
						"id": "solution.plugin_sampler.header",
						"label": "Header",
						"type": "integer",
						"size": 1
					}
				]
			},
			"Plugin Time average": {
				"label": "Plugin Time average",
				"parameters": [
					{
						"id": "solution.plugin_tavg.nsteps",
						"label": "nSteps average",
						"type": "integer",
						"size": 1
					},
					{
						"id": "solution.plugin_tavg.dt_out",
						"label": "DT Out",
						"type": "double",
						"size": 1
					},
					{
						"id": "solution.plugin_tavg.basedir",
						"label": "Basedir",
						"type": "string",
						"size": 1
					},
					{
						"id": "solution.plugin_tavg.basename",
						"label": "Basename",
						"type": "string",
						"size": 1
					},
					{
						"id": "solution.plugin_tavg.avg_name",
						"label": "Average Name",
						"type": "string",
						"size": 1
					}
				]
			},
			"char-riem-inv": {
				"label": "char-riem-inv",
				"parameters": [
					{
						"id": "name",
						"label": "Name",
						"type": "enum",
						"size": 1,
						"enum": {
							"external": "boundary-names"
						}
					},
					{
						"id": "rho",
						"label": "density",
						"type": "string",
						"size": 1
					},
					{
						"id": "u",
						"label": "x-velocity",
						"type": "string",
						"size": 1
					},
					{
						"id": "v",
						"label": "y-velocity",
						"type": "string",
						"size": 1
					},
					{
						"id": "w",
						"label": "z-velocity",
						"type": "string",
						"size": 1
					},
					{
						"id": "p",
						"label": "static pressure",
						"type": "string",
						"size": 1
					}
				]
			},
			"no-slp-adia-wall": {
				"label": "no-slp-adia-wall",
				"parameters": [
					"no documentation"
				]
			},
			"no-slp-isot-wall": {
				"label": "no-slp-isot-wall",
				"parameters": [
					{
						"id": "name",
						"label": "Name",
						"type": "enum",
						"size": 1,
						"enum": {
							"external": "boundary-names"
						}
					},
					{
						"id": "u",
						"label": "x-velocity of wall",
						"type": "double",
						"size": 1
					},
					{
						"id": "v",
						"label": "y-velocity of wall",
						"type": "double",
						"size": 1
					},
					{
						"id": "w",
						"label": "z-velocity of wall",
						"type": "double",
						"size": 1
					},
					{
						"id": "cpTw",
						"label": "Product of specific heat capacity",
						"type": "double",
						"size": 1
					}
				]
			},
			"slp-adia-wall": {
				"label": "slp-adia-wall",
				"parameters": [
					"no documentation"
				]
			},
			"sub-in-frv": {
				"label": "sub-in-frv",
				"parameters": [
					{
						"id": "name",
						"label": "Name",
						"type": "enum",
						"size": 1,
						"enum": {
							"external": "boundary-names"
						}
					},
					{
						"id": "rho",
						"label": "density",
						"type": "double",
						"size": 1
					},
					{
						"id": "u",
						"label": "x-velocity",
						"type": "double",
						"size": 1
					},
					{
						"id": "v",
						"label": "y-velocity",
						"type": "double",
						"size": 1
					},
					{
						"id": "w",
						"label": "z-velocit",
						"type": "double",
						"size": 1
					}
				]
			},
			"sub-in-ftpttang": {
				"label": "sub-in-ftpttang",
				"parameters": [
					{
						"id": "name",
						"label": "Name",
						"type": "enum",
						"size": 1,
						"enum": {
							"external": "boundary-names"
						}
					},
					{
						"id": "pt",
						"label": "Total pressire",
						"type": "double",
						"size": 1
					},
					{
						"id": "cpTt",
						"label": "Product of specific heat capcacity",
						"type": "double",
						"size": 1
					},
					{
						"id": "theta",
						"label": "Azimuth angle of inflow",
						"type": "double",
						"size": 1
					},
					{
						"id": "phi",
						"label": "Inclination of angle of inflow",
						"type": "double",
						"size": 1
					}
				]
			},
			"sub-out-fp": {
				"label": "sub-out-fp",
				"parameters": [
					{
						"id": "name",
						"label": "Name",
						"type": "enum",
						"size": 1,
						"enum": {
							"external": "boundary-names"
						}
					},
					{
						"id": "p",
						"label": "Static pressure",
						"type": "double",
						"size": 1
					}
				]
			},
			"sup-in-fa": {
				"label": "sup-in-fa",
				"parameters": [
					{
						"id": "name",
						"label": "Name",
						"type": "enum",
						"size": 1,
						"enum": {
							"external": "boundary-names"
						}
					},
					{
						"id": "rho",
						"label": "density",
						"type": "double",
						"size": 1
					},
					{
						"id": "u",
						"label": "x-velocity",
						"type": "double",
						"size": 1
					},
					{
						"id": "v",
						"label": "y-velocity",
						"type": "double",
						"size": 1
					},
					{
						"id": "w",
						"label": "z-velocity",
						"type": "double",
						"size": 1
					},
					{
						"id": "p",
						"label": "static pressure",
						"type": "double",
						"size": 1
					}
				]
			},
			"sup-out-fn": {
				"label": "sup-out-fn",
				"parameters": [
					"no documentation"
				]
			},
			"ics": {
				"label": "ics",
				"parameters": [
					{
						"id": "ics.rho",
						"label": "Initial Density",
						"type": "string",
						"size": 1
					},
					{
						"id": "ics.u",
						"label": "Initial X velocity",
						"type": "string",
						"size": 1
					},
					{
						"id": "ics.v",
						"label": "Initial Y velocity",
						"type": "string",
						"size": 1
					},
					{
						"id": "ics.w",
						"label": "Initial Z velocity",
						"type": "string",
						"size": 1
					},
					{
						"id": "ics.p",
						"label": "Initial static pressure distribution",
						"type": "string",
						"size": 1
					}
				]
			}
		}
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "en": __webpack_require__(4)
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "help": __webpack_require__(5),
	  "label.json": __webpack_require__(202)
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "Artificial Viscosity": __webpack_require__(6),
	  "Backend-settings": __webpack_require__(10),
	  "CUDA": __webpack_require__(13),
	  "Constants": __webpack_require__(15),
	  "Filter": __webpack_require__(21),
	  "Hexahedral-el": __webpack_require__(26),
	  "Interfaces": __webpack_require__(30),
	  "Linear-int": __webpack_require__(34),
	  "Open-CL": __webpack_require__(38),
	  "Open-MP": __webpack_require__(42),
	  "Plugin Fluidforce Name": __webpack_require__(47),
	  "Plugin NaN check": __webpack_require__(51),
	  "Plugin Time average": __webpack_require__(53),
	  "Plugin Writer": __webpack_require__(59),
	  "Plugin residual": __webpack_require__(63),
	  "Plugin sampler": __webpack_require__(67),
	  "Prismatic-el": __webpack_require__(73),
	  "Pyramidal-el": __webpack_require__(77),
	  "Quadrilateral-el": __webpack_require__(81),
	  "Quadrilateral-int": __webpack_require__(85),
	  "Solver-settings": __webpack_require__(89),
	  "Solver-source-terms": __webpack_require__(95),
	  "Tetrahedral-el": __webpack_require__(101),
	  "Time Integrator": __webpack_require__(105),
	  "Triangular-el": __webpack_require__(116),
	  "Triangular-int": __webpack_require__(120),
	  "char-riem-inv": __webpack_require__(124),
	  "ics": __webpack_require__(136),
	  "no-slp-isot-wall": __webpack_require__(142),
	  "sub-in-frv": __webpack_require__(154),
	  "sub-in-ftpttang": __webpack_require__(166),
	  "sub-out-fp": __webpack_require__(178),
	  "sup-in-fa": __webpack_require__(190)
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "solver.kappa": __webpack_require__(7),
	  "solver.max_amu": __webpack_require__(8),
	  "solver.s0": __webpack_require__(9)
	};

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = "<p>sensor range - <em>float</em></p>";

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = "<p>maximum artificial viscosity - <em>float</em></p>";

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = "<p>sensor cut-off - <em>float</em></p>";

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "backend.precision": __webpack_require__(11),
	  "backend.rank_allocator": __webpack_require__(12)
	};

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = "<p>number precision - <em>single | double</em></p>";

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = "<p>MPI rank allocator - <em>linear</em></p>";

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "cuda.device_id": __webpack_require__(14)
	};

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = "<p>method for selecting which device(s) to run on - <em>int | round-robin | local-rank</em></p>";

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "constants.cpTref": __webpack_require__(16),
	  "constants.cpTs": __webpack_require__(17),
	  "constants.gamma": __webpack_require__(18),
	  "constants.mu": __webpack_require__(19),
	  "constants.pr": __webpack_require__(20)
	};

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = "<p>Product of specific heat at constant pressure and reference temperature for Sutherland’s Law - <em>float</em><p>";

/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports = "<p>Product of specific heat at constant pressure and Sutherland temperature for Sutherland’s Law - <em>float</em></p>";

/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = "<p>Ratio of specific heats  - <em>float</em></p>";

/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = "<p>Dynamic viscosity  - <em>float</em></p>";

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = "<p>Prandtl number  - <em>float</em></p>";

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "solution.filter.alpha": __webpack_require__(22),
	  "solution.filter.cutoff": __webpack_require__(23),
	  "solution.filter.nsteps": __webpack_require__(24),
	  "solution.filter.order": __webpack_require__(25)
	};

/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = "<p>strength of filter - <em>float</em></p>";

/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = "<p>cutoff frequency below which no filtering is applied - <em>int</em></p>";

/***/ },
/* 24 */
/***/ function(module, exports) {

	module.exports = "<p>apply filter every nsteps - <em>int</em></p>";

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = "<p>order of filter - <em>int</em></p>";

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "solver.elements.quad_deg": __webpack_require__(27),
	  "solver.elements.quad_pts": __webpack_require__(28),
	  "solver.elements.soln_pts": __webpack_require__(29)
	};

/***/ },
/* 27 */
/***/ function(module, exports) {

	module.exports = "<p>degree of quadrature rule for anti-aliasing in a triangular element - <em>int</em></p>";

/***/ },
/* 28 */
/***/ function(module, exports) {

	module.exports = "<p>name of quadrature rule for anti-aliasing in a triangular element - <em>enum varies depending on option</em></p>";

/***/ },
/* 29 */
/***/ function(module, exports) {

	module.exports = "<p>location of the solution points in a triangular element - <em>enum dependant on type</em></p>";

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "solver.ldg_beta": __webpack_require__(31),
	  "solver.ldg_tau": __webpack_require__(32),
	  "solver.riemann": __webpack_require__(33)
	};

/***/ },
/* 31 */
/***/ function(module, exports) {

	module.exports = "<p>tau parameter used for LDG - <em>float</em></p>";

/***/ },
/* 32 */
/***/ function(module, exports) {

	module.exports = "<p>beta parameter used for LDG - <em>float</em></p>";

/***/ },
/* 33 */
/***/ function(module, exports) {

	module.exports = "<p>type of Riemann solver - <em>rusanov | hll | hllc | roe | roem</em></p>";

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "solver.interfaces.flux_pts": __webpack_require__(35),
	  "solver.interfaces.quad_deg": __webpack_require__(36),
	  "solver.interfaces.quad_pts": __webpack_require__(37)
	};

/***/ },
/* 35 */
/***/ function(module, exports) {

	module.exports = "<p>location of the flux points on a line interface - <em>gauss-legendre | gauss-legendre-lobatto</em></p>";

/***/ },
/* 36 */
/***/ function(module, exports) {

	module.exports = "<p>degree of quadrature rule for anti-aliasing on a line interface - <em>int</em></p>";

/***/ },
/* 37 */
/***/ function(module, exports) {

	module.exports = "<p>name of quadrature rule for anti-aliasing on a line interface - <em>gauss-legendre | gauss-legendre-lobatto</em></p>";

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "open-cl.device_id": __webpack_require__(39),
	  "open-cl.device_type": __webpack_require__(40),
	  "open-cl.platform_id": __webpack_require__(41)
	};

/***/ },
/* 39 */
/***/ function(module, exports) {

	module.exports = "<p>For selecting which device(s) to run on - <em>int | string | local-rank</em></p>";

/***/ },
/* 40 */
/***/ function(module, exports) {

	module.exports = "<p>For selecting what type of device(s) to run on - <em>all | cpu | gpu | accelerator</em></p>";

/***/ },
/* 41 */
/***/ function(module, exports) {

	module.exports = "<p>for selecting platform id - <em>int | string</em></p>";

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "open-mp.cblas": __webpack_require__(43),
	  "open-mp.cblas_type": __webpack_require__(44),
	  "open-mp.cc": __webpack_require__(45),
	  "open-mp.cflags": __webpack_require__(46)
	};

/***/ },
/* 43 */
/***/ function(module, exports) {

	module.exports = "<p>path to shared C BLAS library - <em>string</em></p>";

/***/ },
/* 44 */
/***/ function(module, exports) {

	module.exports = "<p>Type of BLAS library - <em>serial | parallel</em></p>";

/***/ },
/* 45 */
/***/ function(module, exports) {

	module.exports = "<p>C compiler - <em>string</em></p>";

/***/ },
/* 46 */
/***/ function(module, exports) {

	module.exports = "<p>Additional C compiler flags - <em>string</em></p>";

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "solution.plugin_fluidforce.file": __webpack_require__(48),
	  "solution.plugin_fluidforce.header": __webpack_require__(49),
	  "solution.plugin_fluidforce.nsteps": __webpack_require__(50)
	};

/***/ },
/* 48 */
/***/ function(module, exports) {

	module.exports = "<p>output file path; should the file already exist it will be appended to - <em>string</em></p>";

/***/ },
/* 49 */
/***/ function(module, exports) {

	module.exports = "<p>if to output a header row or not - <em>boolean, 0 or 1</em></p>";

/***/ },
/* 50 */
/***/ function(module, exports) {

	module.exports = "<p>integrate every nsteps - <em>int</em></p>";

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "solution.plugin_nancheck.nsteps": __webpack_require__(52)
	};

/***/ },
/* 52 */
/***/ function(module, exports) {

	module.exports = "<p>check every nsteps - <em>int</em></p>";

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "solution.plugin_tavg.avg_name": __webpack_require__(54),
	  "solution.plugin_tavg.basedir": __webpack_require__(55),
	  "solution.plugin_tavg.basename": __webpack_require__(56),
	  "solution.plugin_tavg.dt_out": __webpack_require__(57),
	  "solution.plugin_tavg.nsteps": __webpack_require__(58)
	};

/***/ },
/* 54 */
/***/ function(module, exports) {

	module.exports = "<p>expression as a function of the primitive variables, time (t), and space (x, y, [z]) to time average; multiple expressions, each with their own name, may be specified - <em>string</em></p>";

/***/ },
/* 55 */
/***/ function(module, exports) {

	module.exports = "<p>relative path to directory where outputs will be written - <em>string</em></p>";

/***/ },
/* 56 */
/***/ function(module, exports) {

	module.exports = "<p>pattern of output names - <em>string</em></p>";

/***/ },
/* 57 */
/***/ function(module, exports) {

	module.exports = "<p>write to disk every dt-out time units - <em>float</em></p>";

/***/ },
/* 58 */
/***/ function(module, exports) {

	module.exports = "<p>accumulate the average every nsteps time steps - <em>int</em></p>";

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "solution.plugin_writer.basedir": __webpack_require__(60),
	  "solution.plugin_writer.basename": __webpack_require__(61),
	  "solution.plugin_writer.dt_out": __webpack_require__(62)
	};

/***/ },
/* 60 */
/***/ function(module, exports) {

	module.exports = "<p>relative path to directory where outputs will be written - <em>string</em></p>";

/***/ },
/* 61 */
/***/ function(module, exports) {

	module.exports = "<p>write to disk every dt-out time units - <em>string</em></p>";

/***/ },
/* 62 */
/***/ function(module, exports) {

	module.exports = "<p>write to disk every dt-out time units - <em>float</em></p>";

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "solution.plugin_residual.file": __webpack_require__(64),
	  "solution.plugin_residual.header": __webpack_require__(65),
	  "solution.plugin_residual.nsteps": __webpack_require__(66)
	};

/***/ },
/* 64 */
/***/ function(module, exports) {

	module.exports = "<p>output file path; should the file already exist it will be appended to - <em>string</em></p>";

/***/ },
/* 65 */
/***/ function(module, exports) {

	module.exports = "<p>if to output a header row or not - <em>boolean, 0 or 1</em></p>";

/***/ },
/* 66 */
/***/ function(module, exports) {

	module.exports = "<p>calculate every nsteps - <em>int</em></p>";

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "solution.plugin_sampler.file": __webpack_require__(68),
	  "solution.plugin_sampler.format": __webpack_require__(69),
	  "solution.plugin_sampler.header": __webpack_require__(70),
	  "solution.plugin_sampler.nsteps": __webpack_require__(71),
	  "solution.plugin_sampler.samp_pts": __webpack_require__(72)
	};

/***/ },
/* 68 */
/***/ function(module, exports) {

	module.exports = "<p>output file path; should the file already exist it will be appended to - <em>string</em></p>";

/***/ },
/* 69 */
/***/ function(module, exports) {

	module.exports = "<p>output variable format - <em>primitive | conservative</em></p>";

/***/ },
/* 70 */
/***/ function(module, exports) {

	module.exports = "<p>if to output a header row or not - <em>boolean, 0 or 1</em></p>";

/***/ },
/* 71 */
/***/ function(module, exports) {

	module.exports = "<p>sample every nsteps - <em>int</em></p>";

/***/ },
/* 72 */
/***/ function(module, exports) {

	module.exports = "<p>list of points to sample - <em>[(x, y), (x, y), ...] | [(x, y, z), (x, y, z), ...]</em></p>";

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "solver.elements.quad_deg": __webpack_require__(74),
	  "solver.elements.quad_pts": __webpack_require__(75),
	  "solver.elements.soln_pts": __webpack_require__(76)
	};

/***/ },
/* 74 */
/***/ function(module, exports) {

	module.exports = "<p>degree of quadrature rule for anti-aliasing in a triangular element - <em>int</em></p>";

/***/ },
/* 75 */
/***/ function(module, exports) {

	module.exports = "<p>name of quadrature rule for anti-aliasing in a triangular element - <em>enum varies depending on option</em></p>";

/***/ },
/* 76 */
/***/ function(module, exports) {

	module.exports = "<p>location of the solution points in a triangular element - <em>enum dependant on type</em></p>";

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "solver.elements.quad_deg": __webpack_require__(78),
	  "solver.elements.quad_pts": __webpack_require__(79),
	  "solver.elements.soln_pts": __webpack_require__(80)
	};

/***/ },
/* 78 */
/***/ function(module, exports) {

	module.exports = "<p>degree of quadrature rule for anti-aliasing in a triangular element - <em>int</em></p>";

/***/ },
/* 79 */
/***/ function(module, exports) {

	module.exports = "<p>name of quadrature rule for anti-aliasing in a triangular element - <em>enum varies depending on option</em></p>";

/***/ },
/* 80 */
/***/ function(module, exports) {

	module.exports = "<p>location of the solution points in a triangular element - <em>enum dependant on type</em></p>";

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "solver.elements.quad_deg": __webpack_require__(82),
	  "solver.elements.quad_pts": __webpack_require__(83),
	  "solver.elements.soln_pts": __webpack_require__(84)
	};

/***/ },
/* 82 */
/***/ function(module, exports) {

	module.exports = "<p>degree of quadrature rule for anti-aliasing in a triangular element - <em>int</em></p>";

/***/ },
/* 83 */
/***/ function(module, exports) {

	module.exports = "<p>name of quadrature rule for anti-aliasing in a triangular element - <em>enum varies depending on option</em></p>";

/***/ },
/* 84 */
/***/ function(module, exports) {

	module.exports = "<p>location of the solution points in a triangular element - <em>enum dependant on type</em></p>";

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "solver.interfaces.flux_pts": __webpack_require__(86),
	  "solver.interfaces.quad_deg": __webpack_require__(87),
	  "solver.interfaces.quad_pts": __webpack_require__(88)
	};

/***/ },
/* 86 */
/***/ function(module, exports) {

	module.exports = "<p>location of the flux points on a line interface - <em>gauss-legendre | gauss-legendre-lobatto</em></p>";

/***/ },
/* 87 */
/***/ function(module, exports) {

	module.exports = "<p>degree of quadrature rule for anti-aliasing on a line interface - <em>int</em></p>";

/***/ },
/* 88 */
/***/ function(module, exports) {

	module.exports = "<p>name of quadrature rule for anti-aliasing on a line interface - <em>gauss-legendre | gauss-legendre-lobatto</em></p>";

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "solver.anti_alias": __webpack_require__(90),
	  "solver.order": __webpack_require__(91),
	  "solver.shock_capturing": __webpack_require__(92),
	  "solver.system": __webpack_require__(93),
	  "solver.viscosity_correction": __webpack_require__(94)
	};

/***/ },
/* 90 */
/***/ function(module, exports) {

	module.exports = "<p>type of anti-aliasing - <em>flux | surf-flux | div-flux | flux, surf-flux | flux, div-flux | surf-flux, div-flux | flux, surf-flux, div-flux</em></p>";

/***/ },
/* 91 */
/***/ function(module, exports) {

	module.exports = "<p>order of polynomial solution basis - <em>int</em></p>";

/***/ },
/* 92 */
/***/ function(module, exports) {

	module.exports = "<p>shock capturing scheme - <em>none | artificial-viscosity</em></p>";

/***/ },
/* 93 */
/***/ function(module, exports) {

	module.exports = "<p>governing system - <em>euler | navier-stokes</em></p>";

/***/ },
/* 94 */
/***/ function(module, exports) {

	module.exports = "<p>viscosity correction - <em>none | sutherland</em></p>";

/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "solver.source-terms.E": __webpack_require__(96),
	  "solver.source-terms.rho": __webpack_require__(97),
	  "solver.source-terms.rhou": __webpack_require__(98),
	  "solver.source-terms.rhov": __webpack_require__(99),
	  "solver.source-terms.rhow": __webpack_require__(100)
	};

/***/ },
/* 96 */
/***/ function(module, exports) {

	module.exports = "<p>energy source term - <em>string</em></p>";

/***/ },
/* 97 */
/***/ function(module, exports) {

	module.exports = "<p>density source term - <em>string</em></p>";

/***/ },
/* 98 */
/***/ function(module, exports) {

	module.exports = "<p>x-momentum source term - <em>string</em></p>";

/***/ },
/* 99 */
/***/ function(module, exports) {

	module.exports = "<p>y-momentum source term - <em>string</em></p>";

/***/ },
/* 100 */
/***/ function(module, exports) {

	module.exports = "<p>z-momentum source term - <em>string</em></p>";

/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "solver.elements.quad_deg": __webpack_require__(102),
	  "solver.elements.quad_pts": __webpack_require__(103),
	  "solver.elements.soln_pts": __webpack_require__(104)
	};

/***/ },
/* 102 */
/***/ function(module, exports) {

	module.exports = "<p>degree of quadrature rule for anti-aliasing in a triangular element - <em>int</em></p>";

/***/ },
/* 103 */
/***/ function(module, exports) {

	module.exports = "<p>name of quadrature rule for anti-aliasing in a triangular element - <em>enum varies depending on option</em></p>";

/***/ },
/* 104 */
/***/ function(module, exports) {

	module.exports = "<p>location of the solution points in a triangular element - <em>enum dependant on type</em></p>";

/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "solver.atol": __webpack_require__(106),
	  "solver.controller": __webpack_require__(107),
	  "solver.dt": __webpack_require__(108),
	  "solver.max_fact": __webpack_require__(109),
	  "solver.min_fact": __webpack_require__(110),
	  "solver.rtol": __webpack_require__(111),
	  "solver.safety_fact": __webpack_require__(112),
	  "solver.scheme": __webpack_require__(113),
	  "solver.tend": __webpack_require__(114),
	  "solver.tstart": __webpack_require__(115)
	};

/***/ },
/* 106 */
/***/ function(module, exports) {

	module.exports = "<p>absolute error tolerance - <em>float</em></p>";

/***/ },
/* 107 */
/***/ function(module, exports) {

	module.exports = "<p>time-step size controller. <em>pi</em> only works with <em>rk34</em> and <em>rk35</em> and requires - <em>none | pi</em></p>";

/***/ },
/* 108 */
/***/ function(module, exports) {

	module.exports = "<p>time-step - <em>float</em></p>";

/***/ },
/* 109 */
/***/ function(module, exports) {

	module.exports = "<p>maximum factor that the time-step can change between iterations (suitable range 2.0-6.0) - <em>float</em></p>";

/***/ },
/* 110 */
/***/ function(module, exports) {

	module.exports = "<p>safety factor for step size adjustment (suitable range 0.80-0.95) - <em>float</em></p>";

/***/ },
/* 111 */
/***/ function(module, exports) {

	module.exports = "<p>relative error tolerance - <em>float</em></p>";

/***/ },
/* 112 */
/***/ function(module, exports) {

	module.exports = "<p>safety factor for step size adjustment (suitable range 0.80-0.95) - <em>float</em></p>";

/***/ },
/* 113 */
/***/ function(module, exports) {

	module.exports = "<p>time-integration scheme - <em>euler | rk34 | rk4 | rk45 | tvd-rk3</em></p>";

/***/ },
/* 114 */
/***/ function(module, exports) {

	module.exports = "<p>final time - <em>float</em></p>";

/***/ },
/* 115 */
/***/ function(module, exports) {

	module.exports = "<p>initial time - <em>float</em></p>";

/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "solver.elements.quad_deg": __webpack_require__(117),
	  "solver.elements.quad_pts": __webpack_require__(118),
	  "solver.elements.soln_pts": __webpack_require__(119)
	};

/***/ },
/* 117 */
/***/ function(module, exports) {

	module.exports = "<p>degree of quadrature rule for anti-aliasing in a triangular element - <em>int</em></p>";

/***/ },
/* 118 */
/***/ function(module, exports) {

	module.exports = "<p>name of quadrature rule for anti-aliasing in a triangular element - <em>enum varies depending on option</em></p>";

/***/ },
/* 119 */
/***/ function(module, exports) {

	module.exports = "<p>location of the solution points in a triangular element - <em>enum dependant on type</em></p>";

/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "solver.interfaces.flux_pts": __webpack_require__(121),
	  "solver.interfaces.quad_deg": __webpack_require__(122),
	  "solver.interfaces.quad_pts": __webpack_require__(123)
	};

/***/ },
/* 121 */
/***/ function(module, exports) {

	module.exports = "<p>location of the flux points on a line interface - <em>gauss-legendre | gauss-legendre-lobatto</em></p>";

/***/ },
/* 122 */
/***/ function(module, exports) {

	module.exports = "<p>degree of quadrature rule for anti-aliasing on a line interface - <em>int</em></p>";

/***/ },
/* 123 */
/***/ function(module, exports) {

	module.exports = "<p>name of quadrature rule for anti-aliasing on a line interface - <em>gauss-legendre | gauss-legendre-lobatto</em></p>";

/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "cpTt": __webpack_require__(125),
	  "cpTw": __webpack_require__(126),
	  "name": __webpack_require__(127),
	  "p": __webpack_require__(128),
	  "phi": __webpack_require__(129),
	  "pt": __webpack_require__(130),
	  "rho": __webpack_require__(131),
	  "theta": __webpack_require__(132),
	  "u": __webpack_require__(133),
	  "v": __webpack_require__(134),
	  "w": __webpack_require__(135)
	};

/***/ },
/* 125 */
/***/ function(module, exports) {

	module.exports = "<p>product of specific heat capacity at constant pressure and total temperature - <em>float</em></p>";

/***/ },
/* 126 */
/***/ function(module, exports) {

	module.exports = "<p>product of specific heat capacity at constant pressure and temperature of wall - <em>float</em></p>";

/***/ },
/* 127 */
/***/ function(module, exports) {

	module.exports = "<p>Name of boundary - <em>string</em></p>";

/***/ },
/* 128 */
/***/ function(module, exports) {

	module.exports = "<p>static pressure - <em>float | string</em></p>";

/***/ },
/* 129 */
/***/ function(module, exports) {

	module.exports = "<p>inclination angle of inflow measured relative to the global positive z-axis - <em>float</em></p>";

/***/ },
/* 130 */
/***/ function(module, exports) {

	module.exports = "<p>total pressure - <em>float</em></p>";

/***/ },
/* 131 */
/***/ function(module, exports) {

	module.exports = "<p>density - <em>float | string</em></p>";

/***/ },
/* 132 */
/***/ function(module, exports) {

	module.exports = "<p>azimuth angle of inflow measured in the x-y plane relative to the global positive x-axis - <em>float</em></p>";

/***/ },
/* 133 */
/***/ function(module, exports) {

	module.exports = "<p>x-velocity - <em>float | string</em></p>";

/***/ },
/* 134 */
/***/ function(module, exports) {

	module.exports = "<p>y-velocity - <em>float | string</em></p>";

/***/ },
/* 135 */
/***/ function(module, exports) {

	module.exports = "<p>z-velocity - <em>float | string</em></p>";

/***/ },
/* 136 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "ics.p": __webpack_require__(137),
	  "ics.rho": __webpack_require__(138),
	  "ics.u": __webpack_require__(139),
	  "ics.v": __webpack_require__(140),
	  "ics.w": __webpack_require__(141)
	};

/***/ },
/* 137 */
/***/ function(module, exports) {

	module.exports = "<p>initial static pressure distribution - <em>srting</em></p>";

/***/ },
/* 138 */
/***/ function(module, exports) {

	module.exports = "<p>initial density distribution - <em>string</em></p>";

/***/ },
/* 139 */
/***/ function(module, exports) {

	module.exports = "<p>initial x-velocity distribution - <em>string</em></p>";

/***/ },
/* 140 */
/***/ function(module, exports) {

	module.exports = "<p>initial y-velocity distribution - <em>string</em></p>";

/***/ },
/* 141 */
/***/ function(module, exports) {

	module.exports = "<p>initial z-velocity distribution - <em>string</em></p>";

/***/ },
/* 142 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "cpTt": __webpack_require__(143),
	  "cpTw": __webpack_require__(144),
	  "name": __webpack_require__(145),
	  "p": __webpack_require__(146),
	  "phi": __webpack_require__(147),
	  "pt": __webpack_require__(148),
	  "rho": __webpack_require__(149),
	  "theta": __webpack_require__(150),
	  "u": __webpack_require__(151),
	  "v": __webpack_require__(152),
	  "w": __webpack_require__(153)
	};

/***/ },
/* 143 */
/***/ function(module, exports) {

	module.exports = "<p>product of specific heat capacity at constant pressure and total temperature - <em>float</em></p>";

/***/ },
/* 144 */
/***/ function(module, exports) {

	module.exports = "<p>product of specific heat capacity at constant pressure and temperature of wall - <em>float</em></p>";

/***/ },
/* 145 */
/***/ function(module, exports) {

	module.exports = "<p>Name of boundary - <em>string</em></p>";

/***/ },
/* 146 */
/***/ function(module, exports) {

	module.exports = "<p>static pressure - <em>float | string</em></p>";

/***/ },
/* 147 */
/***/ function(module, exports) {

	module.exports = "<p>inclination angle of inflow measured relative to the global positive z-axis - <em>float</em></p>";

/***/ },
/* 148 */
/***/ function(module, exports) {

	module.exports = "<p>total pressure - <em>float</em></p>";

/***/ },
/* 149 */
/***/ function(module, exports) {

	module.exports = "<p>density - <em>float | string</em></p>";

/***/ },
/* 150 */
/***/ function(module, exports) {

	module.exports = "<p>azimuth angle of inflow measured in the x-y plane relative to the global positive x-axis - <em>float</em></p>";

/***/ },
/* 151 */
/***/ function(module, exports) {

	module.exports = "<p>x-velocity - <em>float | string</em></p>";

/***/ },
/* 152 */
/***/ function(module, exports) {

	module.exports = "<p>y-velocity - <em>float | string</em></p>";

/***/ },
/* 153 */
/***/ function(module, exports) {

	module.exports = "<p>z-velocity - <em>float | string</em></p>";

/***/ },
/* 154 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "cpTt": __webpack_require__(155),
	  "cpTw": __webpack_require__(156),
	  "name": __webpack_require__(157),
	  "p": __webpack_require__(158),
	  "phi": __webpack_require__(159),
	  "pt": __webpack_require__(160),
	  "rho": __webpack_require__(161),
	  "theta": __webpack_require__(162),
	  "u": __webpack_require__(163),
	  "v": __webpack_require__(164),
	  "w": __webpack_require__(165)
	};

/***/ },
/* 155 */
/***/ function(module, exports) {

	module.exports = "<p>product of specific heat capacity at constant pressure and total temperature - <em>float</em></p>";

/***/ },
/* 156 */
/***/ function(module, exports) {

	module.exports = "<p>product of specific heat capacity at constant pressure and temperature of wall - <em>float</em></p>";

/***/ },
/* 157 */
/***/ function(module, exports) {

	module.exports = "<p>Name of boundary - <em>string</em></p>";

/***/ },
/* 158 */
/***/ function(module, exports) {

	module.exports = "<p>static pressure - <em>float | string</em></p>";

/***/ },
/* 159 */
/***/ function(module, exports) {

	module.exports = "<p>inclination angle of inflow measured relative to the global positive z-axis - <em>float</em></p>";

/***/ },
/* 160 */
/***/ function(module, exports) {

	module.exports = "<p>total pressure - <em>float</em></p>";

/***/ },
/* 161 */
/***/ function(module, exports) {

	module.exports = "<p>density - <em>float | string</em></p>";

/***/ },
/* 162 */
/***/ function(module, exports) {

	module.exports = "<p>azimuth angle of inflow measured in the x-y plane relative to the global positive x-axis - <em>float</em></p>";

/***/ },
/* 163 */
/***/ function(module, exports) {

	module.exports = "<p>x-velocity - <em>float | string</em></p>";

/***/ },
/* 164 */
/***/ function(module, exports) {

	module.exports = "<p>y-velocity - <em>float | string</em></p>";

/***/ },
/* 165 */
/***/ function(module, exports) {

	module.exports = "<p>z-velocity - <em>float | string</em></p>";

/***/ },
/* 166 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "cpTt": __webpack_require__(167),
	  "cpTw": __webpack_require__(168),
	  "name": __webpack_require__(169),
	  "p": __webpack_require__(170),
	  "phi": __webpack_require__(171),
	  "pt": __webpack_require__(172),
	  "rho": __webpack_require__(173),
	  "theta": __webpack_require__(174),
	  "u": __webpack_require__(175),
	  "v": __webpack_require__(176),
	  "w": __webpack_require__(177)
	};

/***/ },
/* 167 */
/***/ function(module, exports) {

	module.exports = "<p>product of specific heat capacity at constant pressure and total temperature - <em>float</em></p>";

/***/ },
/* 168 */
/***/ function(module, exports) {

	module.exports = "<p>product of specific heat capacity at constant pressure and temperature of wall - <em>float</em></p>";

/***/ },
/* 169 */
/***/ function(module, exports) {

	module.exports = "<p>Name of boundary - <em>string</em></p>";

/***/ },
/* 170 */
/***/ function(module, exports) {

	module.exports = "<p>static pressure - <em>float | string</em></p>";

/***/ },
/* 171 */
/***/ function(module, exports) {

	module.exports = "<p>inclination angle of inflow measured relative to the global positive z-axis - <em>float</em></p>";

/***/ },
/* 172 */
/***/ function(module, exports) {

	module.exports = "<p>total pressure - <em>float</em></p>";

/***/ },
/* 173 */
/***/ function(module, exports) {

	module.exports = "<p>density - <em>float | string</em></p>";

/***/ },
/* 174 */
/***/ function(module, exports) {

	module.exports = "<p>azimuth angle of inflow measured in the x-y plane relative to the global positive x-axis - <em>float</em></p>";

/***/ },
/* 175 */
/***/ function(module, exports) {

	module.exports = "<p>x-velocity - <em>float | string</em></p>";

/***/ },
/* 176 */
/***/ function(module, exports) {

	module.exports = "<p>y-velocity - <em>float | string</em></p>";

/***/ },
/* 177 */
/***/ function(module, exports) {

	module.exports = "<p>z-velocity - <em>float | string</em></p>";

/***/ },
/* 178 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "cpTt": __webpack_require__(179),
	  "cpTw": __webpack_require__(180),
	  "name": __webpack_require__(181),
	  "p": __webpack_require__(182),
	  "phi": __webpack_require__(183),
	  "pt": __webpack_require__(184),
	  "rho": __webpack_require__(185),
	  "theta": __webpack_require__(186),
	  "u": __webpack_require__(187),
	  "v": __webpack_require__(188),
	  "w": __webpack_require__(189)
	};

/***/ },
/* 179 */
/***/ function(module, exports) {

	module.exports = "<p>product of specific heat capacity at constant pressure and total temperature - <em>float</em></p>";

/***/ },
/* 180 */
/***/ function(module, exports) {

	module.exports = "<p>product of specific heat capacity at constant pressure and temperature of wall - <em>float</em></p>";

/***/ },
/* 181 */
/***/ function(module, exports) {

	module.exports = "<p>Name of boundary - <em>string</em></p>";

/***/ },
/* 182 */
/***/ function(module, exports) {

	module.exports = "<p>static pressure - <em>float | string</em></p>";

/***/ },
/* 183 */
/***/ function(module, exports) {

	module.exports = "<p>inclination angle of inflow measured relative to the global positive z-axis - <em>float</em></p>";

/***/ },
/* 184 */
/***/ function(module, exports) {

	module.exports = "<p>total pressure - <em>float</em></p>";

/***/ },
/* 185 */
/***/ function(module, exports) {

	module.exports = "<p>density - <em>float | string</em></p>";

/***/ },
/* 186 */
/***/ function(module, exports) {

	module.exports = "<p>azimuth angle of inflow measured in the x-y plane relative to the global positive x-axis - <em>float</em></p>";

/***/ },
/* 187 */
/***/ function(module, exports) {

	module.exports = "<p>x-velocity - <em>float | string</em></p>";

/***/ },
/* 188 */
/***/ function(module, exports) {

	module.exports = "<p>y-velocity - <em>float | string</em></p>";

/***/ },
/* 189 */
/***/ function(module, exports) {

	module.exports = "<p>z-velocity - <em>float | string</em></p>";

/***/ },
/* 190 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = {
	  "cpTt": __webpack_require__(191),
	  "cpTw": __webpack_require__(192),
	  "name": __webpack_require__(193),
	  "p": __webpack_require__(194),
	  "phi": __webpack_require__(195),
	  "pt": __webpack_require__(196),
	  "rho": __webpack_require__(197),
	  "theta": __webpack_require__(198),
	  "u": __webpack_require__(199),
	  "v": __webpack_require__(200),
	  "w": __webpack_require__(201)
	};

/***/ },
/* 191 */
/***/ function(module, exports) {

	module.exports = "<p>product of specific heat capacity at constant pressure and total temperature - <em>float</em></p>";

/***/ },
/* 192 */
/***/ function(module, exports) {

	module.exports = "<p>product of specific heat capacity at constant pressure and temperature of wall - <em>float</em></p>";

/***/ },
/* 193 */
/***/ function(module, exports) {

	module.exports = "<p>Name of boundary - <em>string</em></p>";

/***/ },
/* 194 */
/***/ function(module, exports) {

	module.exports = "<p>static pressure - <em>float | string</em></p>";

/***/ },
/* 195 */
/***/ function(module, exports) {

	module.exports = "<p>inclination angle of inflow measured relative to the global positive z-axis - <em>float</em></p>";

/***/ },
/* 196 */
/***/ function(module, exports) {

	module.exports = "<p>total pressure - <em>float</em></p>";

/***/ },
/* 197 */
/***/ function(module, exports) {

	module.exports = "<p>density - <em>float | string</em></p>";

/***/ },
/* 198 */
/***/ function(module, exports) {

	module.exports = "<p>azimuth angle of inflow measured in the x-y plane relative to the global positive x-axis - <em>float</em></p>";

/***/ },
/* 199 */
/***/ function(module, exports) {

	module.exports = "<p>x-velocity - <em>float | string</em></p>";

/***/ },
/* 200 */
/***/ function(module, exports) {

	module.exports = "<p>y-velocity - <em>float | string</em></p>";

/***/ },
/* 201 */
/***/ function(module, exports) {

	module.exports = "<p>z-velocity - <em>float | string</em></p>";

/***/ },
/* 202 */
/***/ function(module, exports) {

	module.exports = {
		"views": {
			"backend": "Backend",
			"contstants": "Contstants",
			"solver": "Solver",
			"solver-interfaces": "Solver Interfaces",
			"solver-elements": "Solver Elements",
			"solution-bcs": "Boundary Conditions",
			"solution": "Solution"
		},
		"attributes": {
			"Backend-settings": {
				"title": "Settings",
				"parameters": {
					"backend.precision": "Precision",
					"backend.rank_allocator": "Rank Allocator"
				}
			},
			"CUDA": {
				"title": "CUDA",
				"parameters": {
					"cuda.device_id": "Precision"
				}
			},
			"Open-MP": {
				"title": "Open-MP",
				"parameters": {
					"open-mp.cc": "C Compiler",
					"open-mp.cflags": "Compiler Flags",
					"open-mp.cblas": "Path to shared C BLAS library",
					"open-mp.cblas_type": "Type of BLAS library"
				}
			},
			"Open-CL": {
				"title": "Open-CL",
				"parameters": {
					"open-cl.platform_id": "Platform ID",
					"open-cl.device_type": "Device Type",
					"open-cl.device_id": "Device ID"
				}
			},
			"Constants": {
				"title": "Constants",
				"parameters": {
					"constants.gamma": "Gamma",
					"constants.mu": "Mu",
					"constants.pr": "Pr",
					"constants.cpTref": "cpTref",
					"constants.cpTs": "cpTS"
				}
			},
			"Solver-settings": {
				"title": "Settings",
				"parameters": {
					"solver.system": "System",
					"solver.order": "Order",
					"solver.anti_alias": "Anti-alias",
					"solver.viscosity_correction": "Viscosity correction",
					"solver.shock_capturing": "Shock capturing"
				}
			},
			"Time Integrator": {
				"title": "Time Integrator",
				"parameters": {
					"solver.scheme": "Scheme",
					"solver.tstart": "Initial time",
					"solver.tend": "Final time",
					"solver.dt": "Time step",
					"solver.controller": "Time step",
					"solver.atol": "atol",
					"solver.rtol": "rtol",
					"solver.safety_fact": "safety-fact",
					"solver.min_fact": "min-fact",
					"solver.max_fact": "max-fact"
				}
			},
			"Artificial Viscosity": {
				"title": "Artificial Viscosity",
				"parameters": {
					"solver.max_amu": "Maximum artificial viscosity",
					"solver.s0": "Sensor cut-off",
					"solver.kappa": "Sensor range"
				}
			},
			"Interfaces": {
				"title": "Interfaces",
				"parameters": {
					"solver.riemann": "Riemann Solver",
					"solver.ldg_beta": "LDG Beta",
					"solver.ldg_tau": "LDG Tau"
				}
			},
			"Linear-int": {
				"title": "Linear",
				"parameters": {
					"solver.interfaces.flux_pts": "Flux points",
					"solver.interfaces.quad_deg": "Degree of quadratur",
					"solver.interfaces.quad_pts": "Name of quadratur"
				}
			},
			"Triangular-int": {
				"title": "Triangular",
				"parameters": {
					"solver.interfaces.flux_pts": "Flux points",
					"solver.interfaces.quad_deg": "Degree of quadratur",
					"solver.interfaces.quad_pts": "Name of quadratur"
				}
			},
			"Quadrilateral-int": {
				"title": "Quadrilateral",
				"parameters": {
					"solver.interfaces.flux_pts": "Flux points",
					"solver.interfaces.quad_deg": "Degree of quadratur",
					"solver.interfaces.quad_pts": "Name of quadratur"
				}
			},
			"Triangular-el": {
				"title": "Triangular",
				"parameters": {
					"solver.elements.soln_pts": "Solution points",
					"solver.elements.quad_deg": "Degree of quadratur",
					"solver.elements.quad_pts": "Name of quadratur"
				}
			},
			"Quadrilateral-el": {
				"title": "Quadrilateral",
				"parameters": {
					"solver.elements.soln_pts": "Solution points",
					"solver.elements.quad_deg": "Degree of quadratur",
					"solver.elements.quad_pts": "Name of quadratur"
				}
			},
			"Hexahedral-el": {
				"title": "Hexahedral",
				"parameters": {
					"solver.elements.soln_pts": "Solution points",
					"solver.elements.quad_deg": "Degree of quadratur",
					"solver.elements.quad_pts": "Name of quadratur"
				}
			},
			"Tetrahedral-el": {
				"title": "Tetrahedral",
				"parameters": {
					"solver.elements.soln_pts": "Solution points",
					"solver.elements.quad_deg": "Degree of quadratur",
					"solver.elements.quad_pts": "Name of quadratur"
				}
			},
			"Prismatic-el": {
				"title": "Prismatic",
				"parameters": {
					"solver.elements.soln_pts": "Solution points",
					"solver.elements.quad_deg": "Degree of quadratur",
					"solver.elements.quad_pts": "Name of quadratur"
				}
			},
			"Pyramidal-el": {
				"title": "Pyramidal",
				"parameters": {
					"solver.elements.soln_pts": "Solution points",
					"solver.elements.quad_deg": "Degree of quadratur",
					"solver.elements.quad_pts": "Name of quadratur"
				}
			},
			"Solver-source-terms": {
				"title": "Solver Source Terms",
				"parameters": {
					"solver.source-terms.rho": "Density source term",
					"solver.source-terms.rhou": "X-momentum source term",
					"solver.source-terms.rhov": "Y-momentum source term",
					"solver.source-terms.rhow": "Z-momentum source term",
					"solver.source-terms.E": "Energy source term"
				}
			},
			"Filter": {
				"title": "Filter",
				"parameters": {
					"solution.filter.nsteps": "Filter apply interval (in steps)",
					"solution.filter.alpha": "Strength of filter",
					"solution.filter.order": "Order of filter",
					"solution.filter.cutoff": "Cutoff frequency"
				}
			},
			"Plugin Writer": {
				"title": "Plugin Writer",
				"parameters": {
					"solution.plugin_writer.dt_out": "Disk write time interval",
					"solution.plugin_writer.basedir": "Disk write time interval",
					"solution.plugin_writer.basename": "Output name pattern"
				}
			},
			"Plugin Fluidforce Name": {
				"title": "Plugin Fluidforce Name",
				"parameters": {
					"solution.plugin_fluidforce.nsteps": "Integration interval",
					"solution.plugin_fluidforce.file": "Output file path",
					"solution.plugin_fluidforce.header": "Output header row"
				}
			},
			"Plugin NaN check": {
				"title": "Plugin NaN check",
				"parameters": {
					"solution.plugin_nancheck.nsteps": "nsteps"
				}
			},
			"Plugin residual": {
				"title": "Plugin residual",
				"parameters": {
					"solution.plugin_residual.nsteps": "Calculation interval",
					"solution.plugin_residual.file": "Output file path",
					"solution.plugin_residual.header": "Output header row"
				}
			},
			"Plugin sampler": {
				"title": "Plugin sampler",
				"parameters": {
					"solution.plugin_sampler.nsteps": "nSteps",
					"solution.plugin_sampler.samp_pts": "Sample points",
					"solution.plugin_sampler.format": "Format",
					"solution.plugin_sampler.file": "File",
					"solution.plugin_sampler.header": "Header"
				}
			},
			"Plugin Time average": {
				"title": "Plugin Time average",
				"parameters": {
					"solution.plugin_tavg.nsteps": "nSteps average",
					"solution.plugin_tavg.dt_out": "DT Out",
					"solution.plugin_tavg.basedir": "Basedir",
					"solution.plugin_tavg.basename": "Basename",
					"solution.plugin_tavg.avg_name": "Average Name"
				}
			},
			"char-riem-inv": {
				"title": "char-riem-inv",
				"parameters": {
					"name": "Name",
					"rho": "density",
					"u": "x-velocity",
					"v": "y-velocity",
					"w": "z-velocity",
					"p": "static pressure"
				}
			},
			"no-slp-isot-wall": {
				"title": "no-slp-isot-wall",
				"parameters": {
					"name": "Name",
					"u": "x-velocity of wall",
					"v": "y-velocity of wall",
					"w": "z-velocity of wall",
					"cpTw": "Product of specific heat capacity"
				}
			},
			"no-slp-adia-wall": {
				"title": "no-slp-adia-wall",
				"parameters": {}
			},
			"slp-adia-wall": {
				"title": "slp-adia-wall",
				"parameters": {}
			},
			"sup-out-fn": {
				"title": "sup-out-fn",
				"parameters": {}
			},
			"sub-in-frv": {
				"title": "sub-in-frv",
				"parameters": {
					"name": "Name",
					"rho": "density",
					"u": "x-velocity",
					"v": "y-velocity",
					"w": "z-velocit"
				}
			},
			"sub-in-ftpttang": {
				"title": "sub-in-ftpttang",
				"parameters": {
					"name": "Name",
					"pt": "Total pressire",
					"cpTt": "Product of specific heat capcacity",
					"theta": "Azimuth angle of inflow",
					"phi": "Inclination of angle of inflow"
				}
			},
			"sub-out-fp": {
				"title": "sub-out-fp",
				"parameters": {
					"name": "Name",
					"p": "Static pressure"
				}
			},
			"sup-in-fa": {
				"title": "sup-in-fa",
				"parameters": {
					"name": "Name",
					"rho": "density",
					"u": "x-velocity",
					"v": "y-velocity",
					"w": "z-velocity",
					"p": "static pressure"
				}
			},
			"ics": {
				"title": "ics",
				"parameters": {
					"ics.rho": "Initial Density",
					"ics.u": "Initial X velocity",
					"ics.v": "Initial Y velocity",
					"ics.w": "Initial Z velocity",
					"ics.p": "Initial static pressure distribution"
				}
			}
		}
	};

/***/ },
/* 203 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var template = __webpack_require__(204);

	module.exports = function (model) {
	    var templateDataModel = { data: {}, valid: true, errors: [] },
	        viewInstance = null,
	        count = 0,
	        list = null;

	    //BACKEND
	    templateDataModel.data.backend = {};
	    try {
	        var backend = model.data.backend[0]['Backend-settings'];
	        templateDataModel.data.backend.precision = backend['backend.precision'];
	        templateDataModel.data.backend.rank_allocator = backend['backend.rank_allocator'];
	    } catch (error) {
	        templateDataModel.errors.push("Backend Settings not valid");
	        templateDataModel.errors.push("=> " + error.message);
	        templateDataModel.valid = false;
	    }

	    try {
	        var backend = model.data.backend[0],
	            active = backend.or[1].active,
	            prefixToDrop = active.toLowerCase() + '.';
	        templateDataModel.data.backend[active] = {};

	        for (var key in backend[active]) {
	            var newKey = key.replace(prefixToDrop, '');
	            templateDataModel.data.backend[active][newKey] = backend[active][key];
	        }
	    } catch (error) {
	        templateDataModel.errors.push("Backend multiprocessing method not valid");
	        templateDataModel.errors.push("=> " + error.message);
	        templateDataModel.valid = false;
	    }

	    // CONSTANTS
	    var constants = model.data.constants[0];
	    templateDataModel.data.constants = {};
	    ['gamma', 'mu', 'pr', 'cpTref', 'cpTs'].forEach(function (el) {
	        if (constants.Constants['constants.' + el]) {
	            templateDataModel.data.constants[el] = constants.Constants['constants.' + el];
	        }
	    });

	    //SOLVER
	    templateDataModel.data.solver = {};
	    try {
	        var solver = model.data.solver[0]['Solver-settings'];
	        templateDataModel.data.solver.system = solver['solver.system'];
	        templateDataModel.data.solver.order = solver['solver.order'];
	        templateDataModel.data.solver.anti_alias = solver['solver.anti_alias'];
	        templateDataModel.data.solver.viscosity_correction = solver['solver.viscosity_correction'];
	        templateDataModel.data.solver.shock_capturing = solver['solver.shock_capturing'];
	    } catch (error) {
	        templateDataModel.errors.push('Solver settings not valid');
	        templateDataModel.errors.push('=> ' + error.message);
	        templateDataModel.valid = false;
	    }

	    // SOLVER TIME-INTEGRATOR
	    templateDataModel.data.solver.ti = {};
	    try {
	        var solver = model.data.solver[0]['Time Integrator'];
	        templateDataModel.data.solver.ti.scheme = solver['solver.scheme'];
	        templateDataModel.data.solver.ti.tstart = solver['solver.tstart'];
	        templateDataModel.data.solver.ti.tend = solver['solver.tend'];
	        templateDataModel.data.solver.ti.dt = solver['solver.dt'];
	        templateDataModel.data.solver.ti.controller = solver['solver.controller'];
	        if (solver['solver.controller'] === 'pi' && (solver['solver.scheme'] === 'rk34' || solver['solver.scheme'] === 'rk35')) {
	            templateDataModel.data.solver.ti.atol = solver['solver.atol'];
	            templateDataModel.data.solver.ti.rtol = solver['solver.rtol'];
	            templateDataModel.data.solver.ti.safety_fact = solver['solver.safety_fact'];
	            templateDataModel.data.solver.ti.min_fact = solver['solver.min_fact'];
	            templateDataModel.data.solver.ti.max_fact = solver['solver.max_fact'];
	        } else if (solver['solver.controller'] === 'pi' && (solver['solver.scheme'] !== 'rk34' && solver['solver.scheme'] !== 'rk35')) {
	            throw Error('pi only works with rk34 and rk35');
	        }
	    } catch (error) {
	        templateDataModel.errors.push('Solver Time-integrator not valid');
	        templateDataModel.errors.push('=> ' + error.message);
	        templateDataModel.valid = false;
	    }

	    // SOLVER ARTIFICIAL VISCOSITY
	    templateDataModel.data.solver.av = {};
	    try {
	        var solver = model.data.solver[0]['Artificial Viscosity'];
	        templateDataModel.data.solver.av.max_amu = solver['solver.max_amu'];
	        templateDataModel.data.solver.av.s0 = solver['solver.s0'];
	        templateDataModel.data.solver.av.kappa = solver['solver.kappa'];
	    } catch (error) {
	        templateDataModel.errors.push('Solver Artificial Viscosity not valid');
	        templateDataModel.errors.push('=> ' + error.message);
	        templateDataModel.valid = false;
	    }

	    // SOLVER SOURCE
	    templateDataModel.data.solver.source = {};
	    try {
	        var solver = model.data.solver[0]['Source'];
	        templateDataModel.data.solver.source.rho = solver['solver.source.rho'];
	        templateDataModel.data.solver.source.rhou = solver['solver.source.rhou'];
	        templateDataModel.data.solver.source.rhov = solver['solver.source.rhov'];
	        templateDataModel.data.solver.source.rhow = solver['solver.source.rhow'];
	        templateDataModel.data.solver.source.E = solver['solver.source.E'];
	    } catch (error) {
	        templateDataModel.errors.push('Solver source not valid');
	        templateDataModel.errors.push('=> ' + error.message);
	        templateDataModel.valid = false;
	    }

	    // SOLVER INTERFACE
	    templateDataModel.data.solver.interfaces = {};
	    try {
	        var interfaces = model.data.solver[0]['Interfaces'];
	        templateDataModel.data.solver.interfaces.riemann = interfaces['solver.riemann'];
	        templateDataModel.data.solver.interfaces.ldg_beta = interfaces['solver.ldg_beta'];
	        templateDataModel.data.solver.interfaces.ldg_tau = interfaces['solver.ldg_tau'];
	    } catch (error) {
	        templateDataModel.errors.push('Solver interfaces not valid');
	        templateDataModel.errors.push('=> ' + error.message);
	        templateDataModel.valid = false;
	    }

	    //SOLVER INTERFACE TYPE
	    templateDataModel.data.solver_interfaces = {};
	    try {
	        var interfaces = model.data['solver-interfaces'][0],
	            active = interfaces.or[0].active,
	            types = { 'linear': 'line', 'triangular': 'tri', 'quadrilateral': 'quad' },
	            valuesKey = active + '-int';

	        templateDataModel.data.solver_interfaces.type = 'solver-interfaces-' + types[active.toLowerCase()];
	        templateDataModel.data.solver_interfaces.flux_pts = interfaces[valuesKey]['solver.interfaces.flux_pts'];
	        templateDataModel.data.solver_interfaces.quad_deg = interfaces[valuesKey]['solver.interfaces.quad_deg'];
	        templateDataModel.data.solver_interfaces.quad_pts = interfaces[valuesKey]['solver.interfaces.quad_pts'];
	    } catch (error) {
	        templateDataModel.errors.push('Solver interface type not valid');
	        templateDataModel.errors.push('=> ' + error.message);
	        templateDataModel.valid = false;
	    }

	    // SOLVER ELEMENTS
	    templateDataModel.data.solver_elements = {};
	    try {
	        var elements = model.data['solver-elements'][0],
	            active = elements.or[0].active,
	            types = { 'triangular': 'tri', 'quadrilateral': 'quad',
	            'hexahedral': 'hex', 'tetrihedral': 'tet',
	            'prismatic': 'pri', 'pyramidal': 'pyr' },
	            valuesKey = active + '-el';

	        templateDataModel.data.solver_elements.type = 'solver-elements-' + types[active.toLowerCase()];
	        templateDataModel.data.solver_elements.soln_pts = elements[valuesKey]['solver.elements.soln_pts'];
	        templateDataModel.data.solver_elements.quad_deg = elements[valuesKey]['solver.elements.quad_deg'];
	        templateDataModel.data.solver_elements.quad_pts = elements[valuesKey]['solver.elements.quad_pts'];
	    } catch (error) {
	        templateDataModel.errors.push('Solver interface type not valid');
	        templateDataModel.errors.push('=> ' + error.message);
	        templateDataModel.valid = false;
	    }

	    // SOLVER SOURCE TERMS
	    templateDataModel.data.solver.source_terms = {};
	    try {
	        var solver = model.data.solver[0]['Solver-source-terms'];
	        templateDataModel.data.solver.source_terms.rho = solver['solver.source-terms.rho'];
	        templateDataModel.data.solver.source_terms.rhou = solver['solver.source-terms.rhou'];
	        templateDataModel.data.solver.source_terms.rhov = solver['solver.source-terms.rhov'];
	        templateDataModel.data.solver.source_terms.rhw = solver['solver.source-terms.rhw'];
	        templateDataModel.data.solver.source_terms.E = solver['solver.source-terms.E'];
	    } catch (error) {
	        templateDataModel.errors.push('Solver source terms not valid');
	        templateDataModel.errors.push('=> ' + error.message);
	        templateDataModel.valid = false;
	    }

	    templateDataModel.data.solution = {};

	    //SOLUTIONS
	    model.data.solution.forEach(function (el) {
	        var active = el.or[0].active,
	            lowerActive = active.toLowerCase().replace(/ /g, '_'),
	            current = el[active];

	        try {
	            templateDataModel.data.solution[lowerActive] = {};
	            for (var item in current) {
	                var shortItem = item.substr(item.lastIndexOf('.') + 1);
	                templateDataModel.data.solution[lowerActive][shortItem] = el[active][item];
	            }
	        } catch (error) {
	            templateDataModel.errors.push('Solution ' + active + ' not valid');
	            templateDataModel.errors.push('=> ' + error.message);
	            templateDataModel.valid = false;
	        }
	    });

	    templateDataModel.data.bcs = [];
	    model.data['solution-bcs'].forEach(function (el) {
	        var active = el.or[0].active,
	            current = el[active],
	            output = { name: current['name'], items: [] };

	        delete current['name'];
	        try {
	            var items = [];
	            for (var item in current) {
	                items.push({ name: item, value: current[item] });
	            }
	            output.items = items;
	        } catch (error) {
	            templateDataModel.errors.push('BCS ' + active + ' not valid');
	            templateDataModel.errors.push('=> ' + error.message);
	            templateDataModel.valid = false;
	        }

	        templateDataModel.data.bcs.push(output);
	    });

	    console.log(templateDataModel);
	    return {
	        errors: templateDataModel.errors,
	        results: {
	            'pyfr.ini': template(templateDataModel)
	        }
	    };
	};

/***/ },
/* 204 */
/***/ function(module, exports, __webpack_require__) {

	var jade = __webpack_require__(205);

	module.exports = function template(locals) {
	var buf = [];
	var jade_mixins = {};
	var jade_interp;
	;var locals_for_with = (locals || {});(function (Object, backend, bcs, constants, solution, solver, solver_elements, solver_interfaces, undefined) {
	buf.push(" \n[backend]\nprecision = " + (jade.escape((jade_interp = backend.precision) == null ? '' : jade_interp)) + "\nrank-allocator = " + (jade.escape((jade_interp = backend.rank_allocator) == null ? '' : jade_interp)) + "\n ");
	if ( backend['CUDA'])
	{
	buf.push(" \n[backend-cuda]\ndevice-id = " + (jade.escape((jade_interp = backend['CUDA'].device_id) == null ? '' : jade_interp)) + "\n ");
	}
	if ( backend['Open-CL'])
	{
	buf.push(" \n[backend-opencl]\nplatform-id = " + (jade.escape((jade_interp = backend['Open-CL'].platform_id) == null ? '' : jade_interp)) + "\ndevice-type = " + (jade.escape((jade_interp = backend['Open-CL'].device) == null ? '' : jade_interp)) + "\ndevice-id = " + (jade.escape((jade_interp = backend['Open-CL'].device_id) == null ? '' : jade_interp)) + "\n ");
	}
	if ( backend['Open-MP'])
	{
	buf.push(" \n[backend-openmp]\ncc = " + (jade.escape((jade_interp = backend['Open-MP'].cc) == null ? '' : jade_interp)) + "\ncflags = " + (jade.escape((jade_interp = backend['Open-MP'].cflags) == null ? '' : jade_interp)) + "\ncblas = " + (jade.escape((jade_interp = backend['Open-MP'].cblas) == null ? '' : jade_interp)) + "\ncblas-type = " + (jade.escape((jade_interp = backend['Open-MP'].cblas_type) == null ? '' : jade_interp)) + "\n ");
	}
	buf.push(" \n[constants]\n ");
	if ( constants.gamma)
	{
	buf.push("gamma = " + (jade.escape((jade_interp = constants.gamma) == null ? '' : jade_interp)) + "\n ");
	}
	if ( constants.mu)
	{
	buf.push("mu = " + (jade.escape((jade_interp = constants.mu) == null ? '' : jade_interp)) + "\n ");
	}
	if ( constants.pr)
	{
	buf.push("pr = " + (jade.escape((jade_interp = constants.pr) == null ? '' : jade_interp)) + "\n ");
	}
	if ( constants.cpTref)
	{
	buf.push("cpTref = " + (jade.escape((jade_interp = constants.cpTref) == null ? '' : jade_interp)) + "\n ");
	}
	if ( constants.cpTs )
	{
	buf.push("cpTs = " + (jade.escape((jade_interp = constants.cpTs) == null ? '' : jade_interp)) + "\n ");
	}
	buf.push(" \n[solver]\nsystem = " + (jade.escape((jade_interp = solver.system) == null ? '' : jade_interp)) + "\norder = " + (jade.escape((jade_interp = solver.order) == null ? '' : jade_interp)) + "\nanti-alias = " + (jade.escape((jade_interp = solver.anti_alias) == null ? '' : jade_interp)) + "\nviscosity-correction = " + (jade.escape((jade_interp = solver.viscosity_correction) == null ? '' : jade_interp)) + "\nshock-capturing = " + (jade.escape((jade_interp = solver.shock_capturing) == null ? '' : jade_interp)) + "\n ");
	if ( Object.keys(solver.ti).length > 0)
	{
	buf.push(" \n[solver-time-integrator]\nscheme = " + (jade.escape((jade_interp = solver.ti.scheme) == null ? '' : jade_interp)) + "\ntstart = " + (jade.escape((jade_interp = solver.ti.tstart) == null ? '' : jade_interp)) + "\ntend = " + (jade.escape((jade_interp = solver.ti.tend) == null ? '' : jade_interp)) + "\ndt = " + (jade.escape((jade_interp = solver.ti.dt) == null ? '' : jade_interp)) + "\ncontroller = " + (jade.escape((jade_interp = solver.ti.controller) == null ? '' : jade_interp)) + "\n ");
	if ( solver.ti.controller === 'pi')
	{
	buf.push("atol = " + (jade.escape((jade_interp = solver.ti.atol) == null ? '' : jade_interp)) + "\nrtol = " + (jade.escape((jade_interp = solver.ti.rtol) == null ? '' : jade_interp)) + "\nsafety-fact = " + (jade.escape((jade_interp = solver.ti.safety_fact) == null ? '' : jade_interp)) + "\nmin_fact= " + (jade.escape((jade_interp = solver.ti.min_fact) == null ? '' : jade_interp)) + "\nmax-fact = " + (jade.escape((jade_interp = solver.ti.max_fact) == null ? '' : jade_interp)) + "\n ");
	}
	}
	if ( Object.keys(solver.av).length > 0 )
	{
	buf.push(" \n[solver-artificial-viscosity]\nmax_amu = " + (jade.escape((jade_interp = solver.av.max_amu) == null ? '' : jade_interp)) + "\ns0 = " + (jade.escape((jade_interp = solver.av.s0) == null ? '' : jade_interp)) + "\nkappa = " + (jade.escape((jade_interp = solver.av.kappa) == null ? '' : jade_interp)) + "\n ");
	}
	if ( Object.keys(solver.source).length > 0)
	{
	buf.push(" \n[solver-source]\nrho = " + (jade.escape((jade_interp = solver.source.rho) == null ? '' : jade_interp)) + "\nrhou = " + (jade.escape((jade_interp = solver.source.rhou) == null ? '' : jade_interp)) + "\nrhov = " + (jade.escape((jade_interp = solver.source.rhov) == null ? '' : jade_interp)) + "\nrhow = " + (jade.escape((jade_interp = solver.source.rhow) == null ? '' : jade_interp)) + "\nE = " + (jade.escape((jade_interp = solver.source.E) == null ? '' : jade_interp)) + "\n ");
	}
	if ( Object.keys(solver.source_terms).length > 0 )
	{
	buf.push(" \n[solver-source-terms]\nrho = " + (jade.escape((jade_interp = solver.source_terms.rho) == null ? '' : jade_interp)) + "\nrhou = " + (jade.escape((jade_interp = solver.source_terms.rhou) == null ? '' : jade_interp)) + "\nrhov = " + (jade.escape((jade_interp = solver.source_terms.rhov) == null ? '' : jade_interp)) + "\nrhw = " + (jade.escape((jade_interp = solver.source_terms.rhw) == null ? '' : jade_interp)) + "\nE = " + (jade.escape((jade_interp = solver.source_terms.E) == null ? '' : jade_interp)) + "\n ");
	}
	if ( Object.keys(solver.interfaces).length > 0)
	{
	buf.push(" \n[solver-interfaces] \nriemann-solver = " + (jade.escape((jade_interp = solver.interfaces.riemann) == null ? '' : jade_interp)) + "\nldg-beta = " + (jade.escape((jade_interp = solver.interfaces.ldg_beta) == null ? '' : jade_interp)) + "\nldg-tau = " + (jade.escape((jade_interp = solver.interfaces.ldg_tau) == null ? '' : jade_interp)) + "\n ");
	}
	if ( Object.keys(solver_interfaces).length > 0 )
	{
	buf.push(" \n[" + (jade.escape((jade_interp = solver_interfaces.type) == null ? '' : jade_interp)) + "]\nflux-pts = " + (jade.escape((jade_interp = solver_interfaces.flux_pts) == null ? '' : jade_interp)) + "\nquad-deg = " + (jade.escape((jade_interp = solver_interfaces.quad_deg) == null ? '' : jade_interp)) + "\nquad-pts = " + (jade.escape((jade_interp = solver_interfaces.quad_pts) == null ? '' : jade_interp)) + "\n ");
	}
	if ( Object.keys(solver_elements).length > 0 )
	{
	buf.push(" \n[" + (jade.escape((jade_interp = solver_elements.type) == null ? '' : jade_interp)) + "]\nsoln-pts = " + (jade.escape((jade_interp = solver_elements.soln_pts) == null ? '' : jade_interp)) + "\nquad-deg = " + (jade.escape((jade_interp = solver_elements.quad_deg) == null ? '' : jade_interp)) + "\nquad-pts = " + (jade.escape((jade_interp = solver_elements.quad_pts) == null ? '' : jade_interp)) + "\n ");
	}
	if ( Object.keys(solution.filter).length > 0 )
	{
	buf.push(" \n[soln-filter]\nnsteps = " + (jade.escape((jade_interp = solution.filter.nsteps) == null ? '' : jade_interp)) + "\nalpha = " + (jade.escape((jade_interp = solution.filter.alpha) == null ? '' : jade_interp)) + "\norder = " + (jade.escape((jade_interp = solution.filter.order) == null ? '' : jade_interp)) + "\ncutoff = " + (jade.escape((jade_interp = solution.filter.cutoff) == null ? '' : jade_interp)) + "\n ");
	}
	if ( solution.plugin_writer )
	{
	buf.push(" \n[soln-plugin-writer]\ndt-out = " + (jade.escape((jade_interp = solution.plugin_writer.dt_out) == null ? '' : jade_interp)) + "\nbasedir = " + (jade.escape((jade_interp = solution.plugin_writer.basedir) == null ? '' : jade_interp)) + "\nbasename = " + (jade.escape((jade_interp = solution.plugin_writer.basename) == null ? '' : jade_interp)) + "\n ");
	}
	if ( solution.plugin_fluidforce_name)
	{
	buf.push(" \n[soln-plugin-fluidforce-name]\nnsteps = " + (jade.escape((jade_interp = solution.plugin_fluidforce_name.nsteps) == null ? '' : jade_interp)) + "\nfile = " + (jade.escape((jade_interp = solution.plugin_fluidforce_name.file) == null ? '' : jade_interp)) + "\nheader = " + (jade.escape((jade_interp = solution.plugin_fluidforce_name.header) == null ? '' : jade_interp)) + "\n ");
	}
	if ( solution.plugin_nan_check )
	{
	buf.push(" \n[soln-plugin-nancheck]\nnsteps = " + (jade.escape((jade_interp = solution.plugin_nancheck.nsteps) == null ? '' : jade_interp)) + "\n ");
	}
	if ( solution.plugin_residual)
	{
	buf.push(" \n[soln-plugin-sampler]\nnsteps = " + (jade.escape((jade_interp = solution.plugin_sampler.nsteps) == null ? '' : jade_interp)) + "\nsamp-pts = " + (jade.escape((jade_interp = solution.plugin_sampler.samp_pts) == null ? '' : jade_interp)) + "\nformat = " + (jade.escape((jade_interp = solution.plugin_sampler.format) == null ? '' : jade_interp)) + "\nfile = " + (jade.escape((jade_interp = solution.plugin_sampler.file) == null ? '' : jade_interp)) + "\nheader = " + (jade.escape((jade_interp = solution.plugin_sampler.header) == null ? '' : jade_interp)) + "\n ");
	}
	if ( solution.plugin_time_average)
	{
	buf.push(" \n[soln-plugin-tavg]\nnsteps = " + (jade.escape((jade_interp = solution.plugin_time_average.nsteps) == null ? '' : jade_interp)) + "\ndt-out = " + (jade.escape((jade_interp = solution.plugin_time_average.dt_out) == null ? '' : jade_interp)) + "\nbasedir = " + (jade.escape((jade_interp = solution.plugin_time_average.basedir) == null ? '' : jade_interp)) + "\nbasename = " + (jade.escape((jade_interp = solution.plugin_time_average.basename) == null ? '' : jade_interp)) + "\navg-name = " + (jade.escape((jade_interp = solution.plugin_time_average.avg_name) == null ? '' : jade_interp)) + "\n ");
	}
	if ( solution.ics)
	{
	buf.push(" \n[soln-ics]\nrho = " + (jade.escape((jade_interp = solution.ics.rho) == null ? '' : jade_interp)) + "\nu = " + (jade.escape((jade_interp = solution.ics.u) == null ? '' : jade_interp)) + "\nv = " + (jade.escape((jade_interp = solution.ics.v) == null ? '' : jade_interp)) + "\nw = " + (jade.escape((jade_interp = solution.ics.w) == null ? '' : jade_interp)) + "\np = " + (jade.escape((jade_interp = solution.ics.p) == null ? '' : jade_interp)) + "\n ");
	}
	// iterate bcs
	;(function(){
	  var $$obj = bcs ;
	  if ('number' == typeof $$obj.length) {

	    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
	      var el = $$obj[$index];

	buf.push(" \n[soln-bcs-" + (jade.escape((jade_interp = el.name) == null ? '' : jade_interp)) + "]\n ");
	// iterate el.items
	;(function(){
	  var $$obj = el.items ;
	  if ('number' == typeof $$obj.length) {

	    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
	      var item = $$obj[$index];

	buf.push("" + (jade.escape((jade_interp = item.name) == null ? '' : jade_interp)) + " = " + (jade.escape((jade_interp = item.value) == null ? '' : jade_interp)) + "\n ");
	    }

	  } else {
	    var $$l = 0;
	    for (var $index in $$obj) {
	      $$l++;      var item = $$obj[$index];

	buf.push("" + (jade.escape((jade_interp = item.name) == null ? '' : jade_interp)) + " = " + (jade.escape((jade_interp = item.value) == null ? '' : jade_interp)) + "\n ");
	    }

	  }
	}).call(this);

	    }

	  } else {
	    var $$l = 0;
	    for (var $index in $$obj) {
	      $$l++;      var el = $$obj[$index];

	buf.push(" \n[soln-bcs-" + (jade.escape((jade_interp = el.name) == null ? '' : jade_interp)) + "]\n ");
	// iterate el.items
	;(function(){
	  var $$obj = el.items ;
	  if ('number' == typeof $$obj.length) {

	    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
	      var item = $$obj[$index];

	buf.push("" + (jade.escape((jade_interp = item.name) == null ? '' : jade_interp)) + " = " + (jade.escape((jade_interp = item.value) == null ? '' : jade_interp)) + "\n ");
	    }

	  } else {
	    var $$l = 0;
	    for (var $index in $$obj) {
	      $$l++;      var item = $$obj[$index];

	buf.push("" + (jade.escape((jade_interp = item.name) == null ? '' : jade_interp)) + " = " + (jade.escape((jade_interp = item.value) == null ? '' : jade_interp)) + "\n ");
	    }

	  }
	}).call(this);

	    }

	  }
	}).call(this);
	}.call(this,"Object" in locals_for_with?locals_for_with.Object:typeof Object!=="undefined"?Object:undefined,"backend" in locals_for_with?locals_for_with.backend:typeof backend!=="undefined"?backend:undefined,"bcs" in locals_for_with?locals_for_with.bcs:typeof bcs!=="undefined"?bcs:undefined,"constants" in locals_for_with?locals_for_with.constants:typeof constants!=="undefined"?constants:undefined,"solution" in locals_for_with?locals_for_with.solution:typeof solution!=="undefined"?solution:undefined,"solver" in locals_for_with?locals_for_with.solver:typeof solver!=="undefined"?solver:undefined,"solver_elements" in locals_for_with?locals_for_with.solver_elements:typeof solver_elements!=="undefined"?solver_elements:undefined,"solver_interfaces" in locals_for_with?locals_for_with.solver_interfaces:typeof solver_interfaces!=="undefined"?solver_interfaces:undefined,"undefined" in locals_for_with?locals_for_with.undefined: false?undefined:undefined));;return buf.join("");
	}

/***/ },
/* 205 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Merge two attribute objects giving precedence
	 * to values in object `b`. Classes are special-cased
	 * allowing for arrays and merging/joining appropriately
	 * resulting in a string.
	 *
	 * @param {Object} a
	 * @param {Object} b
	 * @return {Object} a
	 * @api private
	 */

	exports.merge = function merge(a, b) {
	  if (arguments.length === 1) {
	    var attrs = a[0];
	    for (var i = 1; i < a.length; i++) {
	      attrs = merge(attrs, a[i]);
	    }
	    return attrs;
	  }
	  var ac = a['class'];
	  var bc = b['class'];

	  if (ac || bc) {
	    ac = ac || [];
	    bc = bc || [];
	    if (!Array.isArray(ac)) ac = [ac];
	    if (!Array.isArray(bc)) bc = [bc];
	    a['class'] = ac.concat(bc).filter(nulls);
	  }

	  for (var key in b) {
	    if (key != 'class') {
	      a[key] = b[key];
	    }
	  }

	  return a;
	};

	/**
	 * Filter null `val`s.
	 *
	 * @param {*} val
	 * @return {Boolean}
	 * @api private
	 */

	function nulls(val) {
	  return val != null && val !== '';
	}

	/**
	 * join array as classes.
	 *
	 * @param {*} val
	 * @return {String}
	 */
	exports.joinClasses = joinClasses;
	function joinClasses(val) {
	  return (Array.isArray(val) ? val.map(joinClasses) :
	    (val && typeof val === 'object') ? Object.keys(val).filter(function (key) { return val[key]; }) :
	    [val]).filter(nulls).join(' ');
	}

	/**
	 * Render the given classes.
	 *
	 * @param {Array} classes
	 * @param {Array.<Boolean>} escaped
	 * @return {String}
	 */
	exports.cls = function cls(classes, escaped) {
	  var buf = [];
	  for (var i = 0; i < classes.length; i++) {
	    if (escaped && escaped[i]) {
	      buf.push(exports.escape(joinClasses([classes[i]])));
	    } else {
	      buf.push(joinClasses(classes[i]));
	    }
	  }
	  var text = joinClasses(buf);
	  if (text.length) {
	    return ' class="' + text + '"';
	  } else {
	    return '';
	  }
	};


	exports.style = function (val) {
	  if (val && typeof val === 'object') {
	    return Object.keys(val).map(function (style) {
	      return style + ':' + val[style];
	    }).join(';');
	  } else {
	    return val;
	  }
	};
	/**
	 * Render the given attribute.
	 *
	 * @param {String} key
	 * @param {String} val
	 * @param {Boolean} escaped
	 * @param {Boolean} terse
	 * @return {String}
	 */
	exports.attr = function attr(key, val, escaped, terse) {
	  if (key === 'style') {
	    val = exports.style(val);
	  }
	  if ('boolean' == typeof val || null == val) {
	    if (val) {
	      return ' ' + (terse ? key : key + '="' + key + '"');
	    } else {
	      return '';
	    }
	  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
	    if (JSON.stringify(val).indexOf('&') !== -1) {
	      console.warn('Since Jade 2.0.0, ampersands (`&`) in data attributes ' +
	                   'will be escaped to `&amp;`');
	    };
	    if (val && typeof val.toISOString === 'function') {
	      console.warn('Jade will eliminate the double quotes around dates in ' +
	                   'ISO form after 2.0.0');
	    }
	    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
	  } else if (escaped) {
	    if (val && typeof val.toISOString === 'function') {
	      console.warn('Jade will stringify dates in ISO form after 2.0.0');
	    }
	    return ' ' + key + '="' + exports.escape(val) + '"';
	  } else {
	    if (val && typeof val.toISOString === 'function') {
	      console.warn('Jade will stringify dates in ISO form after 2.0.0');
	    }
	    return ' ' + key + '="' + val + '"';
	  }
	};

	/**
	 * Render the given attributes object.
	 *
	 * @param {Object} obj
	 * @param {Object} escaped
	 * @return {String}
	 */
	exports.attrs = function attrs(obj, terse){
	  var buf = [];

	  var keys = Object.keys(obj);

	  if (keys.length) {
	    for (var i = 0; i < keys.length; ++i) {
	      var key = keys[i]
	        , val = obj[key];

	      if ('class' == key) {
	        if (val = joinClasses(val)) {
	          buf.push(' ' + key + '="' + val + '"');
	        }
	      } else {
	        buf.push(exports.attr(key, val, false, terse));
	      }
	    }
	  }

	  return buf.join('');
	};

	/**
	 * Escape the given string of `html`.
	 *
	 * @param {String} html
	 * @return {String}
	 * @api private
	 */

	var jade_encode_html_rules = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;'
	};
	var jade_match_html = /[&<>"]/g;

	function jade_encode_char(c) {
	  return jade_encode_html_rules[c] || c;
	}

	exports.escape = jade_escape;
	function jade_escape(html){
	  var result = String(html).replace(jade_match_html, jade_encode_char);
	  if (result === '' + html) return html;
	  else return result;
	};

	/**
	 * Re-throw the given `err` in context to the
	 * the jade in `filename` at the given `lineno`.
	 *
	 * @param {Error} err
	 * @param {String} filename
	 * @param {String} lineno
	 * @api private
	 */

	exports.rethrow = function rethrow(err, filename, lineno, str){
	  if (!(err instanceof Error)) throw err;
	  if ((typeof window != 'undefined' || !filename) && !str) {
	    err.message += ' on line ' + lineno;
	    throw err;
	  }
	  try {
	    str = str || __webpack_require__(206).readFileSync(filename, 'utf8')
	  } catch (ex) {
	    rethrow(err, null, lineno)
	  }
	  var context = 3
	    , lines = str.split('\n')
	    , start = Math.max(lineno - context, 0)
	    , end = Math.min(lines.length, lineno + context);

	  // Error context
	  var context = lines.slice(start, end).map(function(line, i){
	    var curr = i + start + 1;
	    return (curr == lineno ? '  > ' : '    ')
	      + curr
	      + '| '
	      + line;
	  }).join('\n');

	  // Alter exception message
	  err.path = filename;
	  err.message = (filename || 'Jade') + ':' + lineno
	    + '\n' + context + '\n\n' + err.message;
	  throw err;
	};

	exports.DebugItem = function DebugItem(lineno, filename) {
	  this.lineno = lineno;
	  this.filename = filename;
	}


/***/ },
/* 206 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ }
/******/ ]);
