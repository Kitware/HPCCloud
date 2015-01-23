angular.module("kitware.cmb.core")
    .directive('cmbViewPanel', ['$templateCache', '$compile', function ($templateCache, $compile) {
        return {
            restrict: 'AE',
            scope: {
                viewId: '@',
                viewIndex: '@',
                viewData: '=',
                template: '=',
                workflow: '@'
            },
            controller: ['$scope', function($scope) {
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
