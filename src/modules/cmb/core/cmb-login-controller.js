angular.module('kitware.cmb')
    .controller('CmbLoginController', ['$scope', '$state', 'kw.Girder', function($scope, $state, $girder) {
        $scope.$watch('user', function(newVal, oldVal) {
            if (!!newVal) {
                $state.go('home');
            }
        });
    }]);