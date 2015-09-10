angular.module("kitware.cmb.core")
    .controller('CmbUserPreferencesController', ['$scope', 'kw.Girder', '$state', '$stateParams',
        '$templateCache', '$window', '$http', '$timeout', '$interval', '$mdToast', '$mdDialog',
        function ($scope, $girder, $state, $stateParams, $templateCache, $window, $http, $timeout, $interval,
            $mdToast, $mdDialog, $mdSidenav) {
            $scope.password = {oldPass: '', newPass: '', confirmPass: ''};
            //sample data
            $scope.awsProfiles = [
                {name: 'item 1', description: 'no description'},
                {name: 'item 2', description: 'no description either!'}
            ];

            $scope.statusClasses = {
                'ready': 'fa-check',
                'starting': 'fa-circle-o-notch fa-spin',
                'created': 'fa-terminal',
            };

            $scope.changePassword = function() {
                if ($scope.password.newPass !== $scope.password.confirmPass) {
                    toastMe('New passwords are not equal');
                    return;
                }
                $girder.changeUserPassword($scope.password.oldPass, $scope.password.newPass)
                    .success(function(){
                        toastMe('Password updated!');
                    }).error(function(res){
                        toastMe(res.message);
                    });
            };

            $scope.selectedIndex = 0;
            $scope.newSelection = function(index) {
                $scope.selectedIndex = index;
            };

            $scope.addItem = function() {
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
                        $scope.title= "Add profile";
                        $scope.data = {name: ''};
                    }],
                    template: $templateCache.get('cmb/core/tpls/cmb-create-input-view-dialog.html'),
                    targetEvent: event,
                })
                .then(function(name) {
                    $scope.awsProfiles.push({name: name, description: 'no description'});
                }, function() {
                    // Nothing to do when close
                });
            };

            $scope.deleteItem = function(index){
                //are you sure prompt
                var confirm = $mdDialog.confirm({
                    title: 'Are you sure you want to delete this profile?',
                    ok: 'Delete',
                    cancel: 'Cancel'
                });

                $mdDialog.show(confirm).then(function(){
                    $scope.awsProfiles = $scope.awsProfiles.splice(index, 1);
                }, function() {
                    //clicked
                });
            };

            $scope.saveItem = function(index) {
                // some post to the girder endpoint
                console.log('item saved');
            };

            function toastMe(message) {
                $mdToast.show(
                    $mdToast.simple()
                        .content(message)
                        .position('bottom right')
                        .hideDelay(3000)
                );
            }
    }]);