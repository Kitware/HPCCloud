angular.module("kitware.cmb.core")
    .controller('CmbUserPreferencesController', ['$scope', 'kw.Girder', '$state', '$stateParams',
        '$templateCache', '$window', '$http', '$timeout', '$interval', '$mdToast',
        function ($scope, $girder, $state, $stateParams, $templateCache, $window, $http, $timeout, $interval, $mdToast) {
            $scope.password = {oldPass: '', newPass: '', confirmPass: ''};

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

            function toastMe(message) {
                $mdToast.show(
                    $mdToast.simple()
                        .content(message)
                        .position('bottom right')
                        .hideDelay(3000)
                );
            }
    }]);