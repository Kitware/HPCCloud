angular.module("kitware.cmb.core")
    .directive('cmbNavigationBar', ['$templateCache', function ($templateCache) {
        return {
            template: $templateCache.get('cmb/core/tpls/cmb-navigation-bar.html')
        };
    }]);
