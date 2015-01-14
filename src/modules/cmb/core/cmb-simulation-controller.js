angular.module("kitware.cmb.core")
    .controller('CmbSimulationController', ['$scope', 'kw.Girder', '$state', '$stateParams', '$mdDialog', '$templateCache', '$window', '$http', '$timeout', '$interval', 'CmbWorkflowHelper', function ($scope, $girder, $state, $stateParams, $mdDialog, $templateCache, $window, $http, $timeout, $interval, CmbWorkflowHelper) {
        var timoutId = 0;


        // BEGIN - Refresh simulation status base on task progress every 10s
        timeoutId = $interval(function() {
            if($scope.simulation.meta.task === 'pending') {
                $girder.updateTaskStatus($scope.simulation);
            } else if($scope.simulation.meta.task === 'terminated') {
                $girder.deleteTask($scope.simulation);
            }
        }, 10000);

        $scope.$on('$destroy', function() {
            $interval.cancel(timeoutId);
        });
        // END - Refresh simulation status base on task progress every 10s

        $scope.parameterDataTemplate = {};

        $scope.activateSection = function(id) {
            $scope.activeSection = id;
        };

        $scope.taskCallback = function(simulationResponse) {
            // Move to the newly created simulation
            var simulation = simulationResponse[0];
            updateScope();
            $state.go('project', { collectionName: $stateParams.collectionName, projectID: simulation.folderId });
        };

        function updateScope() {
            if($scope.collection && CmbWorkflowHelper.getTemplate($scope.collection.name) !== null) {
                $scope.parameterDataTemplate = CmbWorkflowHelper.getTemplate($scope.collection.name);
            } else {
                $timeout(updateScope, 100);
            }
        }

        if($girder.getUser() === null) {
            $state.go('login');
        } else {
            updateScope();
        }
    }]);
