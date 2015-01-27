angular.module("kitware.cmb.core")
    .controller('cmbSimulationConfigurationController', ['$scope', 'kw.Girder', '$mdDialog', '$templateCache', '$window', '$timeout', 'CmbWorkflowHelper', function ($scope, $girder, $mdDialog, $templateCache, $window, $timeout, CmbWorkflowHelper) {
        var templateIndexForSelect = null;

        $scope.workflow = null;
        $scope.template = null;
        $scope.dataModel = null;
        $scope.activeSection = null;
        $scope.meshAnnotations = null;

        function extractEnumList(template) {
            var indexedData = {},
                attributes = template.definitions;

            for(var key in attributes) {
                // Reserve memory
                indexedData[key] = [];

                var parameters = attributes[key].parameters,
                    count = parameters ? parameters.length : 0;

                while(count--) {
                    if(parameters[count].type === 'enum') {
                        indexedData[key].push(parameters[count].id);
                    }
                }
            }
            return indexedData;
        }

        function extractActiveItemInEnum(activeValue, template, globals, attributeName, parameterId) {
            var parameters = template.definitions[attributeName].parameters,
                count = parameters ? parameters.length : 0,
                list = null;

            while(count--) {
                if(parameters[count].id === parameterId) {
                    list = parameters[count].enum.values;
                    count = 0;

                    if(list === undefined) {
                        // Must be a global enum
                        list = globals[parameters[count].enum.type];
                    }
                }
            }

            // Search active value
            count = list ? list.length : 0;
            while(count--) {
                if(angular.equals(activeValue, list[count].value)) {
                    return list[count];
                }
            }

            return null;
        }

        function updateActiveListElements(modelToValidate, template, globals) {
            var list, count, active, views, viewCount;

            // Handle enum selection
            for(var attrName in modelToValidate) {
                if(['or', 'name'].indexOf(attrName) !== -1 || attrName[0] === '$') {
                    continue;
                }

                list = templateIndexForSelect[attrName];
                count = list.length;

                while(count--) {
                    active = modelToValidate[attrName][list[count]];
                    if(active) {
                        if(angular.isArray(active)) {
                            var newSetOfActive = [];
                            for(var idx = 0; idx < active.length; ++idx) {
                                newSetOfActive.push(
                                    extractActiveItemInEnum(
                                        active[idx].value,
                                        template,
                                        globals,
                                        attrName,
                                        list[count]));
                            }
                            modelToValidate[attrName][list[count]] = newSetOfActive;
                        } else {
                            modelToValidate[attrName][list[count]] =
                                extractActiveItemInEnum(
                                    active.value,
                                    template,
                                    globals,
                                    attrName,
                                    list[count]);
                        }
                    }
                }
            }

            // Handle the OR selection
            views = modelToValidate.or;
            viewCount = views.length;

            while(viewCount--) {
                list = views[viewCount].list;
                active = views[viewCount].active;
                count = list ? list.length : 0;

                while(count--) {
                    if(active.value === list[count].value) {
                        views[viewCount].active = list[count];
                        count = 0;
                    }
                }
            }
        }

        function extractDefault(parameter) {
            var value = parameter.default,
                size = Number(parameter.size),
                type = parameter.type;

            if(type === 'enum') {
                if(size === -1) {
                    var enumList = [],
                        idxList = value,
                        count = idxList ? idxList.length : 0;
                    while(count--) {
                        enumList.push(parameter.enum.values[idxList[count]]);
                    }

                    return enumList;
                } else {
                    return parameter.enum.values[value];
                }
            } else if (type === 'function') {
                return [];
            } else if(['integrer', 'double'].indexOf(type) !== -1) {
                value = Number(value);
            }

            if(size > 1) {
                var result = [];
                while(result.length < size) {
                    result.push(value);
                }
                return result;
            }
            return value;
        }

        function generateAttributeData(definitions, attributeName) {
            var params = definitions[attributeName].parameters,
                pCount = params ? params.length : 0,
                data = {};

            // Feel current data object
            while(pCount--) {
                data[params[pCount].id] = extractDefault(params[pCount]);
            }

            return data;
        }


        function generateViewDataModel(viewId, viewIndex) {
            var definitions = $scope.template.definitions,
                attributes = $scope.template.views[viewId].attributes,
                count = attributes.length,
                viewData = { name: "New view", or: []};

            if($scope.template.views[viewId].names && viewIndex < $scope.template.views[viewId].names.length) {
                viewData.name = $scope.template.views[viewId].names[viewIndex];
            }

            // Process each attributes
           while(count--) {
                // Fill or list
                viewData.or.push({});

                if(angular.isArray(attributes[count])) {
                    // We are in the OR case
                    var attrList = attributes[count],
                        orItem = { active: "", list: [], collapsed: false };

                    // Add attributes
                    for(var idx = 0; idx < attrList.length; ++idx) {
                        viewData[attrList[idx]] = generateAttributeData(definitions, attrList[idx]);
                        orItem.list.push( { label: definitions[ attrList[idx] ].label, value: attrList[idx] });
                    }
                    orItem.active = orItem.list[0];

                    // Register our OR data model
                    viewData.or.pop();
                    viewData.or.push(orItem);
                } else {
                    // Regular attribute
                    if(!definitions[attributes[count]].parameters) {
                        console.log("No parameters for " + attributes[count]);
                        continue;
                    }

                    // Keep data inside viewModel
                    viewData[attributes[count]] = generateAttributeData(definitions, attributes[count]);
                }
            }
            viewData.or.reverse();

            return viewData;
        }

        $scope.removeView = function (viewId, index) {
            $scope.dataModel[viewId].splice(index,1);
            $scope.activateSection(null, 0);
        };

        $scope.saveAndValidate = function () {
            console.log($scope.dataModel);
            $girder.uploadContentToItem($scope.simulation._id, 'hydra.json', JSON.stringify($scope.dataModel, undefined, 3));
        };

        $scope.addView = function (event, viewId) {
            var controllerScope = $scope,
                title = $scope.template.views[viewId].label;

            $mdDialog.show({
                controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {

                    $scope.title = title;
                    $scope.namePlaceHolder = "Name for the new view";

                    $scope.ok = function(response) {
                        $mdDialog.hide(response);
                    };
                    $scope.cancel = function() {
                        $mdDialog.cancel();
                    };
                }],
                template: $templateCache.get('cmb/core/tpls/cmb-create-input-view-dialog.html'),
                targetEvent: event,
            })
            .then(function(formData) {
                // Make sure we have room for given view
                if($scope.dataModel[viewId] === undefined) {
                   $scope.dataModel[viewId] = [];
                }

                // Activate view
                var viewModel = generateViewDataModel(viewId, controllerScope.dataModel[viewId].length);
                viewModel.name = formData.name;
                controllerScope.dataModel[viewId].push(viewModel);
                controllerScope.activateSection(viewId, controllerScope.dataModel[viewId].length - 1);
            }, function() {
                // Nothing to do when close
            });
        };

        $scope.activateSection = function(viewId, index) {
            var viewSubDataModel = null;

            if(!viewId ) {
                $scope.activeSection = { view: null, idx: 0, data: {} };
                return;
            }

            if($scope.dataModel[viewId] === undefined) {
                $scope.dataModel[viewId] = [];
            }

            // Check if view data already available
            if(index < $scope.dataModel[viewId].length) {
                viewSubDataModel = $scope.dataModel[viewId][index];

                // Revalidate enum properties...
                console.log('got it from model');
                updateActiveListElements(viewSubDataModel, $scope.template, $scope.meshAnnotations);

            } else {
                // Need to generate data from default
                console.log('generate it');
                viewSubDataModel = generateViewDataModel(viewId, $scope.dataModel[viewId] ? $scope.dataModel[viewId].length : 0);
                $scope.dataModel[viewId].push(viewSubDataModel);
            }

            $scope.activeSection = { view: viewId, idx: index, data: viewSubDataModel };
        };

        function fetchData() {
            if($scope.collection && CmbWorkflowHelper.getTemplate($scope.collection.name) !== null && $scope.simulation) {
                $scope.workflow = $scope.collection.name;
                $scope.template = CmbWorkflowHelper.getTemplate($scope.collection.name);

                templateIndexForSelect = extractEnumList($scope.template);
                var fetchedId = $scope.simulation._id;

                $girder.downloadContentFromItem(fetchedId, 'hydra.json', function(dataModelFromServer) {
                    if(fetchedId !== $scope.simulation._id) {
                        fetchData();
                    } else {
                        $scope.dataModel = dataModelFromServer || {};
                    }
                });

                // Extract annotation
                $girder.listItems($scope.simulation.folderId)
                    .success(function (items) {
                        var count = items.length;
                        if (count === 0) {
                            console.error("no item found");
                        }

                        while(count--) {
                            if(items[count].name === 'mesh') {
                                var faces = items[count].meta.annotation,
                                    tagMap = {},
                                    processedTags = [],
                                    faceCount = faces.length;

                                // loop over faces
                                while(faceCount--) {
                                    var tags = faces[faceCount].tags,
                                        tagCount = tags.length;

                                    while(tagCount--) {
                                        if(tagMap[tags[tagCount]]) {
                                            tagMap[tags[tagCount]].push(faceCount);
                                        } else {
                                            tagMap[tags[tagCount]] = [ faceCount ];
                                        }
                                    }
                                }

                                // Make enum structure
                                for(var tag in tagMap) {
                                    processedTags.push({ label: tag, value: tagMap[tag] });
                                }


                                $scope.meshAnnotations = { 'face-tags': processedTags };
                                count = 0;
                                console.log($scope.meshAnnotations);
                            }
                        }
                    })
                    .error(function(err) {
                        console.log(err);
                    });
            } else {
                $timeout(fetchData, 500);
            }
        }

        fetchData();
    }]);
