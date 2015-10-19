angular.module('pv.web')
    .directive('pvJobStatus', ['$templateCache', function($templateCache) {
        return {
            restrict: 'E',
            template: $templateCache.get('pv/tpls/pv-job-status.html')
         };
    }]);