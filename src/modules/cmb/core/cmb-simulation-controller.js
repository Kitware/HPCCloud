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

        $scope.taskCallback = function(simulationResponse) {
            // Move to the newly created simulation
            var simulation = simulationResponse[0];
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
                                var item = items[count],
                                    faces, blocks;

                                if (item.hasOwnProperty('meta') && item.meta.hasOwnProperty('annotation')) {
                                    faces = items[count].meta.annotation.faces;
                                    blocks = items[count].meta.annotation.blocks;
                                } else {
                                    return;
                                }

                                // loop over faces
                                function convertAnnotations(faces) {
                                    var tagMap = {},
                                        processedTags = [],
                                        faceCount = faces.length,
                                        tagValues = [];

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
                                    return {labels: processedTags, values: tagValues};
                                }

                                $scope.external = {
                                    'face-tags': convertAnnotations(faces),
                                    'block-tags': convertAnnotations(blocks),
                                    'element-tags': { labels: ["Elements for Stats"], values: [ 3720242 ] }
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
        }

        $scope.$watch('simulation._id', function(newValue, oldValue) {
            if (newValue !== undefined) {
                fetchData();
            }
        });
    }]);
