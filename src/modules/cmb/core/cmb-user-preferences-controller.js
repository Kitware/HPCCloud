angular.module("kitware.cmb.core")
    .controller('CmbUserPreferencesController', ['$scope', 'kw.Girder', '$state', '$stateParams',
        '$templateCache', '$window', '$http', '$timeout', '$interval', '$mdToast', '$mdDialog',
        function ($scope, $girder, $state, $stateParams, $templateCache, $window, $http, $timeout, $interval, $mdToast, $mdDialog) {
            $scope.password = {oldPass: '', newPass: '', confirmPass: ''};

            // formatted {'accessKeyId','availabilityZone','name','regionName','secretAccessKey}
            $scope.awsProfiles = [];

            $scope.clusterProfiles = [
                {name: 'item 1', description: 'no description', status: 'ready'},
                {name: 'item 2', description: 'no description either!', status: 'created'},
                {name: 'item third', description: 'One day in 1945,'+
                'Mike the Headless Chicken was decapitated in a farm in Colorado;'+
                'he survived another 18 months as part of sideshows before choking'+
                'to death in Phoenix, Arizona.', status: 'starting'},
            ];

            $scope.statusClasses = {
                'ready': 'fa-check',
                'starting': 'fa-circle-o-notch fa-spin',
                'available': 'fa-terminal',
                'incomplete': 'fa-warning'
            };

            // regions: https://docs.aws.amazon.com/general/latest/gr/rande.html#ec2_region
            // zones: http://www.stelligent.com/cloud/list-all-the-availability-zones/
            $scope.ec2 = {
                'us-east-1': ['a','b','c','d','e'],
                'us-west-1': ['a','b','c'],
                'us-west-2': ['a','b','c'],
                'eu-west-1': ['a','b','c'],
                'eu-central-1': ['a','b'],
                'ap-southeast-1': ['a','b'],
                'ap-southeast-2': ['a','b'],
                'ap-northeast-1': ['a','b','c'],
                'sa-east-1': ['a','b']
            };
            $scope.regions = Object.keys($scope.ec2);

            $girder.getAWSProfiles()
                .success(function(data){
                    data.map(function(el) {
                        el.saved = true;
                        return el;
                    });
                    console.log(data);
                    $scope.awsProfiles = angular.copy(data);
                })
                .error(function(err){
                    showToast(err.message);
                });

            $girder.getClusterProfiles()
                .success(function(data){
                    data.map(function(el) {
                        el.saved = true;
                        return el;
                    });
                    $scope.clusterProfiles = angular.copy(data);
                })
                .error(function(err) {
                    showToast(err.message);
                });

            $scope.changePassword = function() {
                if ($scope.password.newPass !== $scope.password.confirmPass) {
                    showToast('New passwords are not equal');
                    return;
                }
                $girder.changeUserPassword($scope.password.oldPass, $scope.password.newPass)
                    .success(function(){
                        showToast('Password updated!');
                    }).error(function(res){
                        showToast(res.message);
                    });
            };

            // AWS profile
            $scope.addProfile = function() {
                inputDialog( 'Add AWS profile', 'profile name',
                    function(name) {
                        $scope.awsProfiles.push({name: name, description: 'no description', status: 'incomplete'});
                    },
                    function(){/*do nothing on failure*/}
                );
            };

            function createAWSProfile(index) {
                $girder.createAWSProfile($scope.awsProfiles[index])
                    .success(function(data) {
                        console.log('created aws profile :)');
                        $scope.awsProfiles[index].saved = true;
                    })
                    .error(function(err){
                        showToast(err.message);
                        console.log('failed to create aws profile');
                    });
            }

            $scope.saveAWSProfile = function(index) {
                if (!$scope.awsProfiles[index].saved) {
                    createAWSProfile(index);
                    return;
                }

                $girder.saveAWSProfile($scope.awsProfiles[index])
                    .success(function(data) {
                        showToast('"' + $scope.awsProfiles[index].name + '" updated.');
                    })
                    .error(function(err){
                        showToast(err.message);
                        console.log('failed to save aws profile');
                    });
            };

            $scope.deleteAWSProfile = function(index){
               confirmDialog('Are you sure you want to delete this profile?', 'Delete', 'Cancel',
                function() {
                    var tmpProfiles = $scope.awsProfiles,
                        removed = tmpProfiles.splice(index, 1)[0];
                    $scope.awsProfiles = tmpProfiles;
                    $girder.deleteAWSProfile(removed);
                }, function(){});
            };

            // Cluster profile
            $scope.addClusterProfile = function() {
                inputDialog( 'Add cluster profile', 'profile name',
                    function(name) {
                        $scope.clusterProfiles.push({name: name, description: 'no description', status: 'incomplete'});
                    },
                    function(){/*do nothing on failure*/}
                );
            };

            function createClusterProfile(index) {
                console.log('cluster profile created');
            }

            $scope.saveClusterProfile = function(index) {
                if (!$scope.clusterProfiles[index].saved) {
                    createClusterProfile(index);
                    return;
                }

                $girder.saveClusterProfile($scope.awsProfiles[index])
                    .success(function(data) {
                        showToast('"' + $scope.clusterProfiles[index].name + '" updated.');
                    })
                    .error(function(err){
                        showToast(err.message);
                        console.log('failed to save cluster profile');
                    });
            };

            $scope.deleteClusterProfile = function(index){
               confirmDialog('Are you sure you want to delete this profile?', 'Delete', 'Cancel',
                function() {
                    var tmpProfiles = $scope.clusterProfiles,
                        removed = tmpProfiles.splice(index, 1);
                    $scope.clusterProfiles = tmpProfiles;
                    $girder.deleteAWSProfile(removed);
                }, function(){});
            };

            // Other UI functions
            function showToast(message) {
                $mdToast.show(
                    $mdToast.simple()
                        .content(message)
                        .position('bottom right')
                        .hideDelay(3000)
                );
            }

            function inputDialog(title, inputLabel, succesCallback, failureCallback) {
                $mdDialog.show({
                    controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
                        $scope.ok = function(response) {
                            if ($scope.data.name.trim() === '') {
                                return;
                            }
                            $mdDialog.hide($scope.data.name);
                        };
                        $scope.cancel = function() {
                          $mdDialog.cancel();
                        };
                        $scope.title= title;
                        $scope.namePlaceHolder = inputLabel;
                        $scope.data = {name: ''};
                    }],
                    template: $templateCache.get('cmb/core/tpls/cmb-create-input-view-dialog.html'),
                    targetEvent: event,
                })
                .then(succesCallback, failureCallback);
            }

            function confirmDialog(title, ok, cancel, succesCallback, failureCallback) {
                 //are you sure prompt
                var confirm = $mdDialog.confirm({
                    title: title,
                    ok: ok,
                    cancel: cancel
                });

                $mdDialog.show(confirm).then(succesCallback, failureCallback);
            }
    }]);