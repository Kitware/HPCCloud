(function(GLOBAL) {
    var module = GLOBAL.WorkflowHelper || {};

    module['simple'] = {
        'create-project' : function (groupId, $girder, $data, $mdDialog) {
            $girder.createFolder(groupId, $data.name, $data.description)
                .success(function (folder) {
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
