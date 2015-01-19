angular.module("kitware.cmb.core")
    .directive('cmbProperty', ['$templateCache', '$compile', function ($templateCache, $compile) {
        return {
            restrict: 'AE',
            scope: {
                workflow: '@',
                property: '='
            },
            controller: ['$scope', function($scope) {
                $scope.toggleHelp = function(id) {
                    var domElem = document.getElementsByClassName('help-' + id)[0],
                        display = domElem.style.display;

                    if(display === 'none') {
                        domElem.style.display = '';
                    } else {
                        domElem.style.display = 'none';
                    }
                };
            }],
            link: function(scope, element, attrs) {
                var htmlCode = null,
                    templatePath = 'cmb/core/tpls/properties/cmb-property-';

                templatePath += scope.property.type + '-' + scope.property.size;
                templatePath += (scope.property.layout) ? '-' + scope.property.layout : '';
                templatePath += '.html';

                htmlCode = $templateCache.get(templatePath);
                if(htmlCode) {
                    // Add help
                    var helpTemplate = $templateCache.get( scope.workflow + '/help/' + scope.property.id);
                    if(helpTemplate) {
                        htmlCode += '<md-card class="help-'+scope.property.id+'"><md-card-content>' + helpTemplate + '</md-card-content></md-card>';
                    }
                    element.replaceWith($compile(htmlCode)(scope));
                    if(helpTemplate) {
                        document.getElementsByClassName('help-' + scope.property.id)[0].display = 'none';
                    }
                } else {
                    element.replaceWith($compile($templateCache.get('cmb/core/tpls/properties/cmb-property-error.html'))(scope));
                }
            }
        };
    }]);
