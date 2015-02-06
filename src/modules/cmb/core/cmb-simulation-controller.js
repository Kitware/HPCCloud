angular.module("kitware.cmb.core")
    .controller('CmbSimulationController', ['$scope', 'kw.Girder', '$state', '$stateParams', '$mdDialog', '$templateCache', '$window', '$http', '$timeout', '$interval', function ($scope, $girder, $state, $stateParams, $mdDialog, $templateCache, $window, $http, $timeout, $interval) {
        var timeoutId = 0;

        $scope.template = null;
        $scope.viewModel = null;


        // BEGIN - Refresh simulation status base on task progress every 10s
        timeoutId = $interval(function() {
            if($scope.simulation.meta.task === 'terminated') {
                $girder.deleteTask($scope.simulation);
            } else if($scope.simulation.meta.taskId) {
                $girder.updateTaskStatus($scope.simulation);
            }
        }, 10000);

        $scope.$on('$destroy', function() {
            $interval.cancel(timeoutId);
        });
        // END - Refresh simulation status base on task progress every 10s

        $scope.taskCallback = function(simulationResponse) {
            // Move to the newly created simulation
            var simulation = simulationResponse[0];
            $state.go('project', { collectionName: $stateParams.collectionName, projectID: simulation.folderId });
        };

        $scope.runVisualizationCallback = function(args) {
            var simulation = args[0],
                clusterData = args[1],
                taskId = args[2],
                config = {
                    cluster: clusterData,
                    input: {
                        item: { id: simulation._id },
                        data: "data"
                    },
                    output: {
                        item: { id: simulation._id }
                    }
                };

            console.log(config);
            console.log('Task spec ' + taskId);
            console.log("Cluster provided for viz task");
            console.log(clusterData);

            if(clusterData.selectedIndex === 0) {
                $girder.startTask(simulation, taskId, clusterData, config);
            }

            // Move back to the project view
            $state.go('project', { collectionName: $stateParams.collectionName, projectID: simulation.folderId });
        };

        $scope.runSimulationCallback = function(args) {
            var simulation = args[0],
                clusterData = args[1],
                taskId = args[2],
                mesh = $scope.mesh;

            console.log(simulation);

            $girder.extractMeshInformationFromProject(simulation.folderId, function(meshItem, meshFile){
                var config = {
                    cluster: clusterData,
                    input: {
                        data: {
                            item: {
                                id: meshItem._id
                            }
                        },
                        config: {
                            item: {
                                id: simulation._id
                            }
                        }
                    },
                    mesh: {
                        name: meshFile.name
                    },
                    output: {
                        item: { id: simulation._id }
                    }
                };
                console.log('Task spec ' + taskId);
                console.log(config);
                $girder.startTask(simulation, taskId, clusterData, config);
            });

            // Move back to the project view
            $state.go('project', { collectionName: $stateParams.collectionName, projectID: simulation.folderId });
        };

        function fetchData() {
            if($scope.collection && $scope.collection.name && $scope.simulation) {
                $scope.template = SimPut.getTemplate($scope.collection.name);

                var fetchedId = $scope.simulation._id,
                    simName = $scope.simulation.name;

                $girder.downloadContentFromItem(fetchedId, 'hydra.json', function(dataModelFromServer) {
                    if(fetchedId !== $scope.simulation._id) {
                        fetchData();
                    } else {
                        $scope.viewModel = dataModelFromServer || { external: {} };
                        if($scope.external) {
                            $scope.viewModel.name = simName;
                            $scope.viewModel.external = $scope.external;
                        }
                    }
                });

                // Extract annotation
                $girder.listItems($scope.simulation.folderId)
                    .success(function (items) {
                        var count = items.length;
                        if (count === 0) {
                            console.error("no item found");
                        }

                        while(count--) {
                            if(items[count].name === 'mesh') {
                                var faces = items[count].meta.annotation,
                                    tagMap = {},
                                    processedTags = [],
                                    faceCount = faces.length,
                                    tagValues = [];

                                // loop over faces
                                while(faceCount--) {
                                    var tags = faces[faceCount].tags,
                                        tagCount = tags.length;

                                    while(tagCount--) {
                                        if(tagMap[tags[tagCount]]) {
                                            tagMap[tags[tagCount]].push(faceCount);
                                        } else {
                                            tagMap[tags[tagCount]] = [ faceCount ];
                                        }
                                    }
                                }

                                // Make enum structure
                                for(var tag in tagMap) {
                                    processedTags.push(tag);
                                }
                                processedTags.sort();
                                for(var idx = 0; idx < processedTags.length; ++idx) {
                                    tagValues.push(tagMap[processedTags[idx]]);
                                }

                                $scope.external = { 
                                    'face-tags': { labels: processedTags, values: tagValues },
                                    'element-tags': { labels: ["Elements for Stats"], values: [ 3720242 ] },
                                    'block-tags': { labels: ["Water"], values: [1] } // FIXME specific to hydra
                                };

                                if($scope.viewModel) {
                                    $scope.viewModel.external = $scope.external;
                                }

                                count = 0;
                                console.log($scope.globals);
                            }
                        }
                    })
                    .error(function(err) {
                        console.log(err);
                    });
            } else {
                $timeout(fetchData, 500);
            }
        }

        $scope.$on('simput-error', function(event) {
            if($scope.simulation.meta.status === 'valid') {
                $girder.updateItemMetadata($scope.simulation, { status: 'incomplete' });

                // Move to the incomplete page
                $state.go('simulation', { collectionName: $stateParams.collectionName, projectID: $scope.simulation.folderId, mode: 'incomplete', simulationID: $scope.simulation._id });
            }
        });

        $scope.$on('save-file', function(event, arg) {
            if(arg.name.indexOf('.json') === -1) {
                // Update item state
                if($scope.simulation.meta.status !== 'valid') {
                    $girder.updateItemMetadata($scope.simulation, { status: 'valid' });
                }

                // Update input deck
                $girder.uploadContentToItem($scope.simulation._id, 'hydra.ctln', arg.content);

                // Move to the valid page
                $state.go('simulation', { collectionName: $stateParams.collectionName, projectID: $scope.simulation.folderId, mode: 'valid', simulationID: $scope.simulation._id });
            }
        });
        $scope.$on('simput-click', function(event, type) {
            if(type === 'save-output') {
                $girder.uploadContentToItem($scope.simulation._id, 'hydra.json', JSON.stringify($scope.viewModel, undefined, 3));    
            }
        });
        
        if($girder.getUser() === null) {
            $state.go('login');
        } else {
            fetchData();
        }
    }]);
