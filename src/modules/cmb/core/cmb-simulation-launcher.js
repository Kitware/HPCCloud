// This is a controller for an mdDialog,
// the variable `locals` is passed through from main-controller where this is used.
angular.module('kitware.cmb.core')
    .controller('CmbSimulationLauncher' ,['$scope', '$window', 'kw.Girder', '$mdDialog', 'locals',
        function($scope, $window, $girder, $mdDialog, locals) {
        $scope.data = angular.copy($window.WorkflowHelper[locals.collectionName]['default-simulation-cluster']);

        $scope.serverOptions = Object.keys(locals.availability).filter(
            function(el) {
                return locals.availability[el];
            }); // ideally ['EC2', 'Traditional']
        $scope.serverSelection = $scope.serverOptions[0];

        $scope.title = locals.title;
        $scope.machines = locals.machines;
        $scope.hasLauncher = locals.hasLauncher;

        $scope.volume = {
            size: 1,
            type: 'ebs',
            name: Math.floor(Math.random() * 0xffff).toString()
        };

        if ($scope.serverOptions.indexOf('Traditional') >= 0) {
            $scope.clusterData = {};
            $girder.getClusterProfiles()
                .then(function(data, status){
                    $scope.clusters = data.data.filter(function(el){
                        return el.status === 'running';
                    });
                    $scope.clusterData.selectedCluster = $scope.clusters[0];
                });
        }

        if ($scope.serverOptions.indexOf('EC2') >= 0) {
            $girder.getAWSProfiles()
                .then(function(data){
                    $scope.profiles = data.data;
                    $scope.selectedProfile = $scope.profiles[0];
                    return $girder.getAWSRunningInstances($scope.selectedProfile);
                })
                .then(function(data) {
                    $scope.runningInstances = data.data.runninginstances;
                    return $girder.getAWSMaxInstances($scope.selectedProfile);
                })
                .then(function(data) {
                    $scope.availableMaxInstances = data.data.maxinstances;
                });
        }

        $scope.updateAvailableAWSInstance = function() {
            $girder.getAWSRunningInstances($scope.selectedProfile)
                .then(function(data) {
                    $scope.runningInstances = data.data.runninginstances;
                    return $girder.getAWSMaxInstances($scope.profiles[0]);
                })
                .then(function(data) {
                    $scope.availableMaxInstances = data.data.maxinstances;
                });
        };

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

        $scope.valid = function() {
            if ($scope.serverSelection === 'Traditional') {
                return $scope.clusterData.selectedCluster !== undefined;
            } else if ($scope.serverSelection === 'EC2'){
                return $scope.runningInstances < $scope.availableMaxInstances;
            } else {
                return true; //should never get here.
            }
        };

        $scope.ok = function() {
            if ($scope.serverSelection === 'Traditional') {
                $scope.data = $scope.clusterData.selectedCluster;
                locals.taskName += '_trad';
            } else { //ec2
                $scope.data.profileId = $scope.selectedProfile._id;
                $scope.volume.aws = {profileId: $scope.selectedProfile._id};
                $girder.createVolume($scope.volume)
                    .then(function(data) {
                        console.log('volume created: ', data.data._id);
                        return $girder.updateItemMetadata(locals.simulation, {volumeId: data.data._id});
                    }, function(error) {
                        console.error('error creating volume', error.message);
                    });
            }

            var args = [
                locals.simulation,
                $scope.data,
                $girder.getTaskId(locals.collectionName, locals.taskName)
            ];

            if ($scope.serverSelection === 'Traditional') {
                args.push($scope.clusterData);
            }

            // Delegate the start class on the callback function
            $mdDialog.hide(args);
        };

        $scope.cancel = function() {
          $mdDialog.cancel();
        };
    }]);