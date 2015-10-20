angular.module('kitware.cmb')
    .controller('CmbLoginController', ['$scope', '$state', 'kw.Girder', function($scope, $state, $girder) {
        if ($girder.hasToken()) {
            $state.go('home');
        }
    }]);