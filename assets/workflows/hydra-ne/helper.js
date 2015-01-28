(function(GLOBAL) {
    var module = GLOBAL.WorkflowHelper || {};

    module['hydra-ne'] = {
        'validate-input': function (simulationItem, viewModel, template) {
            var templateDataModel = { data: {}, valid: true },
                count = 0,
                list = null;

            // Update metadata
            templateDataModel.data.title = simulationItem.name;

            // Time
            templateDataModel.data.time = {
                nsteps : viewModel.time[0].Time['time.nstep'],
                deltat : viewModel.time[0].Time['time.deltat'],
                term   : viewModel.time[0].Time['time.term']
            };
            templateDataModel.data.time_integration = {
                type    : viewModel.time[0].TimeIntegration['timeintegration.type'],
                CFLinit : viewModel.time[0].TimeIntegration['timeintegration.CFLinit'],
                CFLmax  : viewModel.time[0].TimeIntegration['timeintegration.CFLmax'],
                dtmax   : viewModel.time[0].TimeIntegration['timeintegration.dtmax'],
                dtscal  : viewModel.time[0].TimeIntegration['timeintegration.dtscale'],
                thetaa  : viewModel.time[0].TimeIntegration['timeintegration.thetaA'],
                thetak  : viewModel.time[0].TimeIntegration['timeintegration.thetaK'],
                thetaf  : viewModel.time[0].TimeIntegration['timeintegration.thetaF']
            };

            // Output Plot
            templateDataModel.data.output = {
                filetype   : viewModel.output[0].Plot['plot.filetype'],
                pltype     : viewModel.output[0].Plot['plot.pltype'],
                nvariables : viewModel.output[0].Plot['plot.nvariables'],
               Psvariables : viewModel.output[0].Plot['plot.svariables'],
                nplot      : viewModel.output[0].Plot['plot.nplot'],
                dump       : viewModel.output[0].Dump['dump.ndump'],
                nprint     : viewModel.output[0].ASCII['ascii.nprint'],
                prtlev     : viewModel.output[0].ASCII['ascii.prtlev'],
                evariables : viewModel.output[0].TimeHistory['timehistory.evariables'],
                surfaceid  : viewModel.output[0].TimeHistory['timehistory.surfaceid'],
               Tsvariables : viewModel.output[0].TimeHistory['timehistory.svariables'],
                nstep      : viewModel.output[0].TimeHistory['timehistory.nstep']
            };

            // Handle material list
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
                    beta     : list[count].Material['material.beta'],
                    rigid    : list[count].Material['material.rigid'],
                    vel      : list[count].Material['material.vel'],
                    blockids : list[count].Material['material.blockids'],
                    type     : list[count].Material['material.type'],
                    name     : list[count].name
                });
            }

            // Execution
            templateDataModel.data.loadBalance = {
                method      : viewModel.execution[0].LoadBalance['loadbalance.method'].value,
                diagnostics : viewModel.execution[0].LoadBalance['loadbalance.diagnostics'].value
            };

            // Solution
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
