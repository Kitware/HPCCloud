// This is a controller for an mdDialog,
// the variable `locals` is passed through from main-controller where this is used.
angular.module('kitware.cmb.core')
    .controller('CmbSimulationLauncher' ,['$scope', '$window', 'kw.Girder', '$mdDialog', 'locals',
        function($scope, $window, $girder, $mdDialog, locals) {
        $scope.data = angular.copy($window.WorkflowHelper[locals.collectionName]['default-simulation-cluster']);

        $scope.serverOptions = ['EC2', 'Traditional'];
        $scope.serverSelection = 'EC2';

        $scope.title = locals.title;
        $scope.machines = locals.machines;
        $scope.hasLauncher = locals.hasLauncher;

        $girder.getClusterProfiles()
            .success(function(data){
                $scope.clusters = data.filter(function(el){
                    return el.status === 'running';
                });
                $scope.selectedCluster = $scope.clusters[0]._id;
            });

        $scope.updateCost = function() {
            var cost = 0,
                array = $scope.machines,
                count = array.length;

            while(count--) {
                if(array[count].id === $scope.data.type) {
                   cost = array[count].cost;

                   // Keep track of machine CPU + GPU
                   $scope.data.cores =  array[count].cpu;
                   $scope.data.gpu = array[count].gpu;
                }
            }

            cost *= Number($scope.data.size);
            $scope.data.cost = cost;
        };
        $scope.updateCost();

        $scope.ok = function() {
            if ($scope.serverSelection === 'Traditional') {
                $scope.data = {_id: $scope.selectedCluster, type:'trad'};
            }

            // Delegate the start class on the callback function
            $mdDialog.hide([
                locals.simulation,
                $scope.data,
                $girder.getTaskId(locals.collectionName, locals.taskName)
            ]);
        };

        $scope.cancel = function() {
          $mdDialog.cancel();
        };
    }]);