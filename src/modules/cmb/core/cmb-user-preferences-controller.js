angular.module("kitware.cmb.core")
    .controller('CmbUserPreferencesController', ['$scope', 'kw.Girder', '$state', '$stateParams',
        '$templateCache', '$window', '$http', '$timeout', '$interval', '$mdToast', '$mdDialog',
        function ($scope, $girder, $state, $stateParams, $templateCache, $window, $http, $timeout, $interval, $mdToast, $mdDialog) {
            $scope.password = {oldPass: '', newPass: '', confirmPass: ''};

            $scope.awsProfiles = [];
            $scope.clusterProfiles = [];

            $scope.statusClasses = {
                //AWS
                'creating': 'fa-circle-o-notch fa-spin',
                'available': 'fa-check',
                'error': 'fa-warning',
                //Cluster
                //'creating' ...
                'created': 'fa-pencil-square-o',
                'initializing': 'fa-circle-o-notch fa-spin',
                'running': 'fa-rocket',
                'terminating': 'fa-bomb',
                'terminated': 'fa-ban',
                //'error' ...
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
                    data = data.map(function(el) {
                        el.saved = true;
                        return el;
                    });
                    $scope.awsProfiles = angular.copy(data);
                })
                .error(function(err){
                    showToast(err.message);
                });

            $girder.getClusterProfiles()
                .success(function(data){
                    data = data.map(function(el) {
                        el.saved = true;
                        return el;
                    });
                    $scope.clusterProfiles = angular.copy(data);
                })
                .error(function(err) {
                    showToast(err.message);
                });

            $scope.$on('profile.status', genericStatusUpdate('awsProfiles'));
            $scope.$on('cluster.status', genericStatusUpdate('clusterProfiles'));

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
            $scope.validateZone = function(ind) {
                var region = $scope.awsProfiles[ind].regionName,
                    aZone = $scope.awsProfiles[ind].availabilityZone;
                if (aZone && aZone.indexOf(region) < 0) {
                    $scope.awsProfiles[ind].availabilityZone = region + $scope.ec2[region][0];
                }
            };

            $scope.addProfile = function() {
                inputDialog( 'Add AWS profile', 'profile name',
                    function(name) {
                        $scope.awsProfiles.push({name: name});
                    },
                    function(){/*do nothing on failure*/}
                );
            };

            function createAWSProfile(index) {
                $girder.createAWSProfile($scope.awsProfiles[index])
                    .success(function(data) {
                        console.log('created aws profile');
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
                confirmDialog('Are you sure you want to delete this profile, "' +
                    $scope.awsProfiles[index].name + '"?', 'Delete', 'Cancel',
                    genericDelete('awsProfiles', index, 'deleteAWSProfile'), function(){});
            };

            // Cluster profile
            $scope.addClusterProfile = function() {
                inputDialog( 'Add cluster profile', 'profile name',
                    function(name) {
                        $scope.clusterProfiles.push({name: name, type: 'trad'});
                    },
                    function(){/*do nothing on failure*/}
                );
            };

            $scope.ableToTestCluster = function(profile){
                return profile.saved &&
                    profile.status !== 'initializing' &&
                    profile.status !== 'creating';
            };

            $scope.clusterProfileAction = function(index, profile) {
                if ($scope.ableToTestCluster(profile)) {
                    testClusterProfile(index);
                } else {
                    createClusterProfile(index);
                }
            };

            function createClusterProfile(index) {
                $girder.createClusterProfile($scope.clusterProfiles[index])
                    .success(function(data) {
                        console.log('created cluster profile :)');
                        $scope.clusterProfiles[index].saved = true;
                        $scope.clusterProfiles[index].status = data.status;
                        $scope.clusterProfiles[index]._id = data._id;
                    })
                    .error(function(err){
                        showToast(err.message);
                        console.log('failed to create cluster profile');
                    });
            }

            function testClusterProfile(index) {
                $girder.testCluster($scope.clusterProfiles[index]._id)
                    .success(function(data, status){
                        if (status == 200) {
                            showToast('Test successfull');
                        }
                    })
                    .error(function(){});
            }

            $scope.deleteClusterProfile = function(index){
                confirmDialog('Are you sure you want to delete this profile, "' +
                    $scope.clusterProfiles[index].name + '"?', 'Delete', 'Cancel',
                    genericDelete('clusterProfiles', index, 'deleteClusterProfile'), function(){});
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

            function genericDelete(profileSet, index, girderDeleteFunc) {
                return function() {
                    var tmpProfile = $scope[profileSet],
                        removed = tmpProfile.splice(index, 1)[0];
                    $scope[profileSet] = tmpProfile;
                    if (removed.saved || removed._id) {
                        $girder[girderDeleteFunc](removed);
                    }
                };
            }

             function genericStatusUpdate(profileSet) {
                return function(event, data) {
                    var profileIndex,
                        notFound = $scope[profileSet].every(function(el, index) {
                            if (el._id === data._id) {
                                profileIndex = index;
                                return false; //break
                            } else {
                                return true;
                            }
                        });
                    if (notFound) {
                        console.error('_id "'+data._id+'" from SSE not found in ' + profileSet);
                    } else {
                        $scope[profileSet][profileIndex].status = data.status;
                        if (/cluster/.test(event.name)) {
                            $girder.getSingleClusterProfile(data._id)
                                .success(function(data) {
                                    $scope[profileSet][profileIndex].config = data.config;
                                })
                                .error(function(err) {
                                    console.error(err.message);
                                });
                        }
                    }
                };
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