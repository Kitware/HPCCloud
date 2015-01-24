angular.module("kitware.cmb.core")
    .controller('CmbSimulationController', ['$scope', 'kw.Girder', '$state', '$stateParams', '$mdDialog', '$templateCache', '$window', '$http', '$timeout', '$interval', 'CmbWorkflowHelper', function ($scope, $girder, $state, $stateParams, $mdDialog, $templateCache, $window, $http, $timeout, $interval, CmbWorkflowHelper) {
        var timeoutId = 0;


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


        if($girder.getUser() === null) {
            $state.go('login');
        }
    }]);
