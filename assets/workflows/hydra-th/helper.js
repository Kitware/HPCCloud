(function(GLOBAL) {
    var module = GLOBAL.WorkflowHelper || {};

    module['hydra-th'] = {
        'create-project' : function (groupId, $girder, $data, $mdDialog) {
            $girder.createFolder(groupId, $data.name, $data.description)
                .success(function (folder) {
                    $girder.createItem(folder._id, 'mesh', 'Mesh file used for simulation')
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
            $q = angular.injector(['ng']).get('$q');

            if(simulationToClone) {
                $girder.createItem(projectId,
                    $data.name,
                    $data.description,
                    { task: 'hydra', hydra: {status: 'incomplete'}}).then(function(response) {
                        return response.data;
                    }, function(error) {
                        console.log(error);
                        $mdDialog.cancel();
                    }).then(function(item) {
                        // Now fetch list of file associated with the simulation to copy
                        return $girder.listItemFiles(simulationToClone._id).then(function(response) {
                            return {
                                files: response.data,
                                item: item
                            };
                        }, function(error) {
                            console.log(error);
                            $mdDialog.cancel();
                        });
                    }).then(function(data) {
                        // Copy over hydra.json and hydra.cntl
                        var promises = [];
                        angular.forEach(data.files, function(file) {
                            if (file.name === 'hydra.json' ||
                                file.name === 'hydra.cntl') {

                                var promise = $girder.copyFile(file._id, data.item._id).then(function(response) {

                                }, function(error) {
                                    console.log(error);
                                    $mdDialog.cancel();
                                });

                                promises.push(promise);
                            }
                        });

                        // Wait for copy to complete
                        return $q.all(promises).then(function() {
                            $mdDialog.hide(data.item);
                        });
                    });
            } else {
                $girder.createItem(projectId, $data.name, $data.description, { task: 'hydra', hydra: {status: 'incomplete'}})
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
