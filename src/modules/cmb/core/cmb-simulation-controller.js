angular.module("kitware.cmb.core")
    .controller('CmbSimulationController', ['$scope', 'kw.Girder', '$state', '$stateParams', '$mdDialog', '$templateCache', '$window', '$http', '$timeout', '$interval', function ($scope, $girder, $state, $stateParams, $mdDialog, $templateCache, $window, $http, $timeout, $interval) {
        var timeoutId = 0;

        function findSimulationIndexById(id) {
            for (var i=0; i < $scope.simulations.length; i++) {
                if ($scope.simulations[i].meta.taskId === id) {
                    return i;
                }
            }
            return -1;
        }

        $scope.template = null;
        $scope.viewModel = null;

        $scope.$on('task.status', function(event, data) {
            var taskIndex = findSimulationIndexById(data._id);
            if (taskIndex < 0) {
                console.error('_id '+data._id+' not found');
            } else {
                if ($scope.simulations[taskIndex].meta.task === 'terminated') {
                    $girder.deleteTask($scope.simulations[taskIndex]);
                } else {
                    $scope.simulations[taskIndex].meta.status = data.status;
                }
            }
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

            // console.log(config);
            // console.log('Task spec ' + taskId);
            // console.log("Cluster provided for viz task");
            // console.log(clusterData);

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

            //console.log(simulation);

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

                if (clusterData.type === 'trad') {
                    config.hydraExecutablePath = args[3].hydraExecutablePath;
                    if (args[3].parallelEnvironment) config.parallelEnvironment = args[3].parallelEnvironment;
                    if (args[3].numberOfSlots) config.numberOfSlots = args[3].numberOfSlots;
                    if (args[3].jobOutputDir) config.jobOutputDir = args[3].jobOutputDir;
                }
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
                        fetchData(); //looks dangerous
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
                                            tagMap[tags[tagCount]].push(faces[faceCount].id);
                                        } else {
                                            tagMap[tags[tagCount]] = [ faces[faceCount].id ];
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
                $girder.uploadContentToItem($scope.simulation._id, arg.name, arg.content);

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
