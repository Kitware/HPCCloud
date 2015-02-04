(function(GLOBAL) {
    var module = GLOBAL.WorkflowHelper || {};

    module['hydra-ne'] = {
        'validate-input': function (simulationItem, viewModel, template) {
            var templateDataModel = { data: {}, valid: true , error: []},
                count = 0,
                list = null;

            // === Helper functions ===
            function extractArrayValues(array) {
                var result = [],
                    count = array.length;

                while(count--) {
                    result.push(array[count].value);  
                }
                return result;
            }

            // === Title + comment  section (3.1) ====
            templateDataModel.data.title = simulationItem.name;

            // === Load balancing section (3.2) ====

            try {
                templateDataModel.data.load_balance = {
                    method      : viewModel.execution[0].LoadBalance['loadbalance.method'].value,
                    diagnostics : viewModel.execution[0].LoadBalance['loadbalance.diagnostics'].value
                };
            } catch(error) {
                console.log(error);
                templateDataModel.error.push("Load balancing not valid");
                templateDataModel.valid = false;
            }

            // === Load curve section (3.3) ====
            // TODO / FIXME

            // === Materials section (3.4) ====
            try {
                templateDataModel.data.materials = [];
                list = viewModel.material;
                count = list.length;
                while(count--) {
                    templateDataModel.data.materials.push({
                        rho      : list[count].Material['material.rho'],
                        cp       : list[count].Material['material.cp'],
                        cv       : list[count].Material['material.cv'],
                        k        : list[count].Material['material.k'],
                        mu       : list[count].Material['material.mu'],
                        tref     : list[count].Material['material.tref'],
                        // FIXME MISSING GAMMA
                        beta     : list[count].Material['material.beta'],
                        rigid    : list[count].Material['material.rigid'].value,
                        vel      : list[count].Material['material.vel'],
                        blockids : list[count].Material['material.blockids'].split(','),
                        type     : list[count].Material['material.type'].value,
                        name     : list[count].name
                    });
                }
            } catch(error) {
                console.log(error);
                templateDataModel.error.push("Material section not valid");
                templateDataModel.valid = false;
            }

            // === Execution control section (3.5) ===
            try {
                templateDataModel.data.exe_control = {
                    nstep : viewModel.execution[0].ExecutionControl['executioncontrol.nstep']
                };
            } catch(error) {
                console.log(error);
                templateDataModel.error.push("Execution control section not valid");
                templateDataModel.valid = false;
            }

            // === Output section (3.6) ===
            try {
                templateDataModel.data.output = {
                    dump       : viewModel.output[0].Output['dump.ndump'],
                    plti       : viewModel.output[0].Output['plot.nplot'],
                    prtlev     : viewModel.output[0].Output['ascii.prtlev'].value,
                    prti       : viewModel.output[0].Output['ascii.prti'], // Only if previous is Verbose
                    thti       : viewModel.output[0].Output['timehistory.nstep'],
                    ttyi       : viewModel.output[0].Output['velocityminmax.nstep'],
                    pltype     : viewModel.output[0].Plot['plot.pltype'],
                    filetype   : viewModel.output[0].Plot['plot.filetype'].value,
                    histvar    : { TimeHistoryElem: [], TimeHistoryNode: [], TimeHistorySide: [] },
                    plotvar    : { 
                        elem: viewModel.output[0].Plot['plot.evariables'].value,
                        node: viewModel.output[0].Plot['plot.nvariables'].value,
                        side: []
                    }
                };
            } catch(error) {
                console.log(error);
                templateDataModel.error.push("Output section not valid");
                templateDataModel.valid = false;
            }

            // === histvar section (3.6.3) ===
            try {
                list = viewModel.histvar;
                count = list ? list.length : 0;
                while(count--) {
                    var activeAttr = list[count].or[0].active.value;
                    
                    templateDataModel.data.output.histvar[activeAttr].push({
                        ids: list[count][activeAttr]['timehistory.ids'], // FIXME handle split vs face ids
                        vars: extractArrayValues(list[count][activeAttr]['timehistory.variables'])
                    });
                }
            } catch(error) {
                console.log(error);
                templateDataModel.error.push("Time History (histvar) section not valid");
                templateDataModel.valid = false;
            }

            // === plotvar section (3.6.4) ===
            try {
                list = viewModel.plotvar;
                count = list.length;
                while(count--) {
                    console.log('++++++++++++++');
                    console.log(list[count].PlotSide);
                    console.log('++++++++++++++');
                    templateDataModel.data.output.plotvar.side.push({
                        ids:  list[count].PlotSide['face.tags'].value,
                        vars: list[count].PlotSide['plot.svariables'].value
                    });
                }
            } catch(error) {
                console.log(error);
                templateDataModel.error.push("Plot Variable (plotvar) section not valid");
                templateDataModel.valid = false;
            }

            // === Time Step and Time Integration section (3.7 + 4.11) ====

            try {
                templateDataModel.data.time = {
                    nsteps  : viewModel.time[0].Time['time.nstep'],
                    deltat  : viewModel.time[0].Time['time.deltat'],
                    term    : viewModel.time[0].Time['time.term'],
                    type    : viewModel.time[0].TimeIntegration['timeintegration.type'],
                    CFLinit : viewModel.time[0].TimeIntegration['timeintegration.CFLinit'],
                    CFLmax  : viewModel.time[0].TimeIntegration['timeintegration.CFLmax'],
                    dtmax   : viewModel.time[0].TimeIntegration['timeintegration.dtmax'],
                    dtscal  : viewModel.time[0].TimeIntegration['timeintegration.dtscale'],
                    thetaa  : viewModel.time[0].TimeIntegration['timeintegration.thetaA'],
                    thetak  : viewModel.time[0].TimeIntegration['timeintegration.thetaK'],
                    thetaf  : viewModel.time[0].TimeIntegration['timeintegration.thetaF']
                };
            } catch(error) {
                console.log(error);
                templateDataModel.error.push("Time Step and Time integration section not valid");
                templateDataModel.valid = false;
            }

            //- ==== Turbulence Statistics section (3.8) ====

            try {
                templateDataModel.data.plotstatvar = {
                    elem         : viewModel.output[0].TurbulenceStatistics['turbulencestatistics.evariables'].value,
                    node         : viewModel.output[0].TurbulenceStatistics['turbulencestatistics.nvariables'].value,
                    side         : [],
                    starttime    : viewModel.output[0].TurbulenceStatistics['turbulencestatistics.starttime'],
                    endtime      : viewModel.output[0].TurbulenceStatistics['turbulencestatistics.endtime'],
                    plotwinsize  : viewModel.output[0].TurbulenceStatistics['turbulencestatistics.plotwinsize']
                };

                list = viewModel.plotstatvar;
                count = list.length;
                while(count--) {
                    templateDataModel.data.plotstatvar.side.push({
                        ids:  list[count].TurbulenceStatisticsSide['face.tags'].value,
                        vars: list[count].TurbulenceStatisticsSide['turbulencestatistics.svariables'].value
                    });
                }
            } catch(error) {
                console.log(error);
                templateDataModel.error.push("Turbulence Statistics section not valid");
                templateDataModel.valid = false;
            }


            //- ==== Cell-centered incompressible Navier-Stokes section (4) ====


            //- ==== Energy section (4.2) ====

            try {
                templateDataModel.data.energy = {
                    form : viewModel.solvers[0].Energy['energy.form'].value
                };
            } catch(error) {
                console.log(error);
                templateDataModel.error.push("Energy section not valid");
                templateDataModel.valid = false;
            }

            //- ==== Hydrostat section (4.3) ====

            try {
                templateDataModel.data.hstat = [
                    { ids: [1,4,7,9],   curveId: 1, amplitude: 5.2354 },  // Fake data to test output
                    { ids: [2,3,5,6,8], curveId: 2, amplitude: 0.9235 }   // Fake data to test output
                ];
            } catch(error) {
                console.log(error);
                templateDataModel.error.push("Hydrostat section not valid");
                templateDataModel.valid = false;
            }
            // FIXME add nodeset => { ids: [], curveId: 34, amplitude: 2.567 }

            //- ==== Initial conditions section (4.4) ====

            try {
                templateDataModel.data.initial = {
                    vel          : viewModel.initial[0].Initial['initial.vel'],
                    tke          : viewModel.initial[0].Initial['initial.tke'],
                    eps          : viewModel.initial[0].Initial['initial.eps'],
                    omega        : viewModel.initial[0].Initial['initial.omega'],
                    turbnu       : viewModel.initial[0].Initial['initial.turbnu'],
                    temperature  : viewModel.initial[0].Initial['initial.temperature'],
                    enthalpy     : viewModel.initial[0].Initial['initial.enthalpy'],
                    init_energy  : viewModel.initial[0].Initial['initial.init_energy']
                };
            } catch(error) {
                console.log(error);
                templateDataModel.error.push("Initial conditions section not valid");
                templateDataModel.valid = false;
            }

            //- ==== Forces section (4.5) ====

            try {
                templateDataModel.data.forces = {
                    body_force: [
                        { force: [ 1.2, 0.2, 5.6], curveId: 34, id: 1, comment: "fake data"},     // Fake data to test output
                        { force: [12.3, 0.2, 5.6], curveId: 34, comment: "fake data" },           // Fake data to test output
                        { force: [23.4, 0.2, 5.6], comment: "fake data" }                         // Fake data to test output
                    ],
                    boussinesqforce: [
                        { gravity: [ 1.2, 0.2, 5.6], curveId: 33, id: 2, comment: "fake data"},   // Fake data to test output
                        { gravity: [12.3, 0.2, 5.6], curveId: 33, comment: "fake data" },         // Fake data to test output
                        { gravity: [23.4, 0.2, 5.6], comment: "fake data" }                       // Fake data to test output
                    ],
                    porous_drag: [
                        { amplitude: 1.23, curveId: 33, id: 2, comment: "fake data"},             // Fake data to test output
                        { amplitude: 2.34, curveId: 33, comment: "fake data" },                   // Fake data to test output
                        { amplitude: 3.45, comment: "fake data" }                                 // Fake data to test output
                    ]
                };
                // FIXME: Manage OR on "forces" view [ BodyForce, BoussinesqForce, PorousDragForce ].
            } catch(error) {
                console.log(error);
                templateDataModel.error.push("Forces section not valid");
                templateDataModel.valid = false;
            }


            //- ==== Boundary Conditions section (4.6) ====

            try {
                templateDataModel.data.boundary_conditions = {
                    enthalpy: [
                        { id: 2, curveId: -1, amplitude: 3.665, comment: "fake data"}                // Fake data to test output
                    ],
                    velocity: [
                        { id: 2, curveId: -1, amplitude: [0.1, 1.2, 2.3], comment: "fake data"}      // Fake data to test output
                    ]
                };
                // FIXME: Manage OR on "boundary" view [ "ScalarDirichlet", "VelocityDirichlet", "SymmetryVelocity", "HeatFlux", "PassiveOutflow", "PressureOutflow", "User-DefinedVelocity" ].
                // Add heatflux too
            } catch(error) {
                console.log(error);
                templateDataModel.error.push("Boundary Conditions section not valid");
                templateDataModel.valid = false;
            }

            //- ==== User-defined Velocity boundary conditions section (4.7)
            //- NOT SUPPORTED YET

            //- ==== Heat sources section (4.8) ===

            try {
                templateDataModel.data.heat_sources = [
                    { amplitude: 1.23, curveId: 33, id: 2, comment: "fake data"},             // Fake data to test output
                    { amplitude: 2.34, curveId: 33, comment: "fake data" },                   // Fake data to test output
                    { amplitude: 3.45, comment: "fake data" }                                 // Fake data to test output
                ];
                // FIXME
            } catch(error) {
                console.log(error);
                templateDataModel.error.push("Heat sources section not valid");
                templateDataModel.valid = false;
            }

            //- ==== Pressure, Momentum and Transport Solvers section (4.9) ===

            try {
                templateDataModel.data.ppesolver = {
                    type                : viewModel.solvers[0].Pressure['pressuresolver.type'].value,
                    amgpc               : viewModel.solvers[0].Pressure['pressuresolver.amgpc'].value,
                    hypre_type          : viewModel.solvers[0].Pressure['pressuresolver.hypre_type'].value,
                    hypre_coarsen_type  : viewModel.solvers[0].HypreBoomerAMG['hypreboomeramg.hypre_coarsen_type'].value,
                    hypre_smoother      : viewModel.solvers[0].HypreBoomerAMG['hypreboomeramg.hypre_smoother'].value,
                    hypre_smoother_dn   : viewModel.solvers[0].HypreBoomerAMG['hypreboomeramg.hypre_smoother_dn'].value,
                    hypre_smoother_up   : viewModel.solvers[0].HypreBoomerAMG['hypreboomeramg.hypre_smoother_up'].value,
                    hypre_smoother_co   : viewModel.solvers[0].HypreBoomerAMG['hypreboomeramg.hypre_smoother_co'].value,
                    interp_type         : viewModel.solvers[0].HypreBoomerAMG['hypreboomeramg.interp_type'].value,
                    hypre_nodal         : viewModel.solvers[0].HypreBoomerAMG['hypreboomeramg.hypre_nodal'].value,
                    trunc_factor        : viewModel.solvers[0].HypreBoomerAMG['hypreboomeramg.trunc_factor'],
                    pmax_elements       : viewModel.solvers[0].HypreBoomerAMG['hypreboomeramg.pmax_elements'],
                    agg_num_levels      : viewModel.solvers[0].HypreBoomerAMG['hypreboomeramg.agg_num_levels'],
                    agg_num_paths       : viewModel.solvers[0].HypreBoomerAMG['hypreboomeramg.agg_num_paths'],
                    strong_threshold    : viewModel.solvers[0].HypreBoomerAMG['hypreboomeramg.strong_threshold'],
                    max_rowsum          : viewModel.solvers[0].HypreBoomerAMG['hypreboomeramg.max_rowsum'],
                    smoother            : viewModel.solvers[0].MLAMG['mlamg.smoother'],
                    cycle               : viewModel.solvers[0].Pressure['pressuresolver.cycle'].value,
                    solver              : viewModel.solvers[0].Pressure['pressuresolver.solver'].value,
                    pre_smooth          : viewModel.solvers[0].Pressure['pressuresolver.pre_smooth'],
                    post_smooth         : viewModel.solvers[0].Pressure['pressuresolver.post_smooth'],
                    levels              : viewModel.solvers[0].Pressure['pressuresolver.levels'],
                    itmax               : viewModel.solvers[0].Pressure['pressuresolver.itmax'],
                    itchk               : viewModel.solvers[0].Pressure['pressuresolver.itchk'],
                    diagnostics         : viewModel.solvers[0].Pressure['pressuresolver.diagnostics'].value,
                    convergence         : viewModel.solvers[0].Pressure['pressuresolver.convergence'].value,
                    eps                 : viewModel.solvers[0].Pressure['pressuresolver.eps'],
                    zeropivot           : viewModel.solvers[0].Pressure['pressuresolver.pivot']
                };
    
                templateDataModel.data.momentumsolver = {
                    type          : viewModel.solvers[0].Momentum['momentumsolver.type'].value,
                    restart       : viewModel.solvers[0].Momentum['momentumsolver.restart'],
                    itmax         : viewModel.solvers[0].Momentum['momentumsolver.itmax'],
                    itchk         : viewModel.solvers[0].Momentum['momentumsolver.itchk'],
                    diagnostics   : viewModel.solvers[0].Momentum['momentumsolver.diagnostics'].value,
                    convergence   : viewModel.solvers[0].Momentum['momentumsolver.convergence'].value,
                    eps           : viewModel.solvers[0].Momentum['momentumsolver.eps']
                };
    
                templateDataModel.data.transportsolver = {
                    type          : viewModel.solvers[0].TransportSolver['transportsolver.type'].value,
                    restart       : viewModel.solvers[0].TransportSolver['transportsolver.restart'],
                    itmax         : viewModel.solvers[0].TransportSolver['transportsolver.itmax'],
                    itchk         : viewModel.solvers[0].TransportSolver['transportsolver.itchk'],
                    diagnostics   : viewModel.solvers[0].TransportSolver['transportsolver.diagnostics'].value,
                    convergence   : viewModel.solvers[0].TransportSolver['transportsolver.convergence'].value,
                    eps           : viewModel.solvers[0].TransportSolver['transportsolver.eps']
                };
            } catch(error) {
                console.log(error);
                templateDataModel.error.push("Pressure, Momentum and Transport Solvers section not valid");
                templateDataModel.valid = false;
            }

            //- ==== solution_method section (4.10) ====

            try {
                templateDataModel.data.solution = {
                    strategy         : viewModel.solution[0].SolutionMethod['solutionmethod.strategy'].value,
                    itmax            : viewModel.solution[0].SolutionMethod['solutionmethod.nitmax'],
                    nvec             : viewModel.solution[0].SolutionMethod['solutionmethod.strategy'],
                    error_norm       : viewModel.solution[0].SolutionMethod['solutionmethod.error_norm'].value,
                    eps              : viewModel.solution[0].SolutionMethod['solutionmethod.eps'],
                    eps_dist         : viewModel.solution[0].SolutionMethod['solutionmethod.eps_dist'],
                    eps_p0           : viewModel.solution[0].SolutionMethod['solutionmethod.eps_p0'],
                    drop_tol         : viewModel.solution[0].SolutionMethod['solutionmethod.drop_tol'],
                    timestep_control : viewModel.solution[0].SolutionMethod['solutionmethod.timestep_control'].value,
                    convergence      : viewModel.solution[0].SolutionMethod['solutionmethod.convergence'].value,
                    subcycle         : viewModel.solution[0].SolutionMethod['solutionmethod.subcycle'].value,
                    diagnostics      : viewModel.solution[0].SolutionMethod['solutionmethod.diagnostics'].value
                };
            } catch(error) {
                console.log(error);
                templateDataModel.error.push("Solution method section not valid");
                templateDataModel.valid = false;
            }

            //- ==== time_integration section (4.11) ====

            // Extracted previously in Time (3.7)

            //- ==== Turbulence models section (4.12) ====

            try {
                templateDataModel.data.turbulence = {
                    model             : viewModel.turbulence[0].Turbulence['turbulence.tmodel'].value,
                    timescale_limiter : viewModel.turbulence[0].RNG_ke['rgn_ke.timescale_limiter'].value,
                    c_s               : viewModel.turbulence[0].Smagorinsky['smagorinsky.c_s'],
                    prandtl_s         : viewModel.turbulence[0].Smagorinsky['smagorinsky.prandtl'],
                    schmidt_s         : viewModel.turbulence[0].Smagorinsky['smagorinsky.schmidt'],
                    c_w               : viewModel.turbulence[0].WALE['wale.c_w'],
                    prandtl_w         : viewModel.turbulence[0].WALE['wale.prandtl'],
                    schmidt_w         : viewModel.turbulence[0].WALE['wale.schmidt']
                };
            } catch(error) {
                console.log(error);
                templateDataModel.error.push("Turbulence models section not valid");
                templateDataModel.valid = false;
            }

            return templateDataModel;
        },
        'create-project' : function (groupId, $girder, $data, $mdDialog) {
            $girder.createFolder(groupId, $data.name, $data.description)
                .success(function (folder) {
                    $girder.createItem(folder._id, "mesh", "Mesh file used for simulation")
                        .success(function (item) {
                            $girder.uploadFileItem(item._id, $data.mesh);
                        })
                        .error(function (data) {
                            console.warn('Could not create mesh item');
                            console.warn(data);
                        });
                    $mdDialog.hide(folder);
                })
                .error(function (data, status, headers, config) {
                    console.log('creation failed');
                    console.log(data);
                    console.log(status);
                    console.log(headers);
                    console.log(config);
                    $mdDialog.cancel();
                });
        },
        'create-simulation' : function (projectId, $girder, $data, $mdDialog, simulationToClone) {
            if(simulationToClone) {
                $girder.copyItem(simulationToClone, projectId, $data.name, $data.description)
                    .success(function (simulation) {
                        // Reset meta-data
                        var defaultMetadata = {
                            taskId: null,
                            task: null,
                            status: 'incomplete',
                            startTime: null,
                            cost: null,
                            totalCost: null
                        };
                        $girder.updateItemMetadata(simulation, defaultMetadata)
                            .success(function(item) {
                                $mdDialog.hide(item);
                            })
                            .error(function(){
                                $mdDialog.hide();
                            });

                        // Remove unwanted files
                        // TODO / FIXME
                    })
                    .error(function (data, status, headers, config) {
                        console.log('clone failed');
                        console.log(data);
                        console.log(status);
                        console.log(headers);
                        console.log(config);
                        $mdDialog.cancel();
                    });
            } else {
                $girder.createItem(projectId, $data.name, $data.description, { type: $data.type, status: 'incomplete' })
                    .success(function (item) {
                        // Fill that item with default configuration
                        // FIXME TODO
                        $mdDialog.hide(item);
                    })
                    .error(function (data, status, headers, config) {
                        console.log('creation failed');
                        console.log(data);
                        console.log(status);
                        console.log(headers);
                        console.log(config);
                        $mdDialog.cancel();
                    });
            }
        },
        'default-simulation-cluster' : {
            type: 'm3.medium',
            size: 1
        }
    };

    // Expose the module as the main WorkflowHelper
    GLOBAL.WorkflowHelper = module;
})(window);
