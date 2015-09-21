angular.module("kitware.cmb.core")
    .controller('CmbCollectionsController', ['$scope', 'kw.Girder', '$state', function ($scope, $girder, $state) {

        $scope.collections = [];

        if($scope.user === null) {
            $state.go('login');
        } else {
            $girder.listCollections()
                .success(function(list){
                    $scope.collections = list;
                })
                .error(function(msg){
                    $scope.collections = [];
                    console.log(msg);
                });
        }
    }]);
