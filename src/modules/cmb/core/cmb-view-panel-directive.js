angular.module('kitware.cmb.core')
    .directive('cmbViewPanel', ['$templateCache', function ($templateCache) {
        return {
            restrict: 'AE',
            scope: {
                viewId: '@',
                viewIndex: '@',
                viewData: '=',
                template: '=',
                globals: '=',
                workflow: '@'
            },
            controller: ['$scope', function($scope) {
                $scope.isArray = angular.isArray;

                $scope.toggleHelp = function ($event) {
                    var list = $event.target.parentElement.parentElement.getElementsByClassName('help-content'),
                        count = list.length,
                        show = count > 0 ? (list[0].style.display === 'none') : false;

                    while(count--){
                        list[count].style.display = show ? '' : 'none';
                    }
                };
            }],
            template: $templateCache.get('cmb/core/tpls/cmb-view-panel.html')
        };
    }]);
