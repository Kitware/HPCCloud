angular.module("kitware.cmb.core")
    .controller('CmbProjectController', ['$scope', 'kw.Girder', '$state', '$stateParams', '$mdDialog', '$templateCache', '$window', function ($scope, $girder, $state, $stateParams, $mdDialog, $templateCache, $window) {

        $scope.mesh = null;
        $scope.simulations = [];

        $scope.toggleSimulationFilter = function (event) {
            event.originalTarget.classList.toggle('md-raised');
        };

        $scope.createSimulation = function (event) {
            var projectId = $scope.getActiveProject(),
                collectionName = $scope.collection.name;

            $mdDialog.show({
                controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
                    $scope.ok = function(response) {
                        $window.WorkflowHelper[collectionName]['create-simulation'](projectId, $girder, response, $mdDialog);
                    };
                    $scope.cancel = function() {
                      $mdDialog.cancel();
                    };
                }],
                template: $templateCache.get(collectionName + '/dialog/create-simulation.html'),
                targetEvent: event,
            })
            .then(function(simulation) {
                // Move to the newly created simulation
                updateScope();
                $state.go('simulation', { collectionID: $stateParams.collectionID, projectID: $stateParams.projectID, simulationID: simulation._id});
            }, function() {
                // Nothing to do when close
            });
        };

        function extractExodusFile(files) {
            var exoFile = null,
                fCount = files.length;

            while(fCount--) {
                if (files[fCount].exts[0] === 'exo') {
                    exoFile = files[fCount];
                }
            }

            $scope.mesh = exoFile;
        }

        function updateScope() {
            $girder.listItems($scope.getActiveProject())
                .success(function (items) {
                    var count = items.length;
                    if (count === 0) {
                        console.error("no item found");
                    }

                    $scope.simulations = [];
                    while(count--) {
                        if(items[count].name === 'mesh') {
                            $girder.listItemFiles(items[count]._id).success(extractExodusFile);
                        } else {
                            // Simulation
                            $scope.simulations.push(items[count]);
                        }
                    }
                })
                .error(function(err) {
                    console.log(err);
                });
        }

        // $scope.$on('$stateChangeSuccess', updateScope);

        if($girder.getUser() === null) {
            $state.go('login');
        } else {
            updateScope();
        }
    }]);
