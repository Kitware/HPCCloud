angular.module('kitware.cmb.core')
    .directive('cmbProperty', ['$templateCache', '$compile', function ($templateCache, $compile) {

        function extractDefault(property) {
            var valueStr = property.default,
                result = [],
                value = null,
                count = property.size;

            if(property.type === 'double' || property.type === 'integer') {
                value = Number(valueStr);
            }

            while(count--) {
                result.push(value ? value : valueStr);
            }

            return result.length > 1 ? result : result[0];
        }

        return {
            restrict: 'AE',
            scope: {
                data: '=',
                workflow: '@',
                property: '=',
                globals: '='
            },
            controller: ['$scope', function($scope) {
                $scope.toggleLocalHelp = function(id) {
                    console.log('toggleLocalHelp ' + id);
                    var domElem = document.getElementsByClassName('help-' + id)[0],
                        display = domElem ? domElem.style.display : null;

                    if(domElem) {
                        if(display === 'none') {
                            domElem.style.display = '';
                        } else {
                            domElem.style.display = 'none';
                        }
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
                    // Add data for property
                    if(scope.data[scope.property.id] === undefined) {
                        scope.data[scope.property.id] = extractDefault(scope.property);
                    }

                    // Add help
                    var helpTemplate = $templateCache.get( scope.workflow + '/help/' + scope.property.id);
                    if(helpTemplate) {
                        htmlCode += '<md-card style="display:none;" class="help-content help-'+scope.property.id+'"><md-card-content>' + helpTemplate + '</md-card-content></md-card>';
                    } else {
                        console.log('No help for ' + scope.property.id + ' path: ' + scope.workflow + '/help/' + scope.property.id);
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
