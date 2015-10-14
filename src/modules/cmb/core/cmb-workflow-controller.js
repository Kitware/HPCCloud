angular.module("kitware.cmb.core")
    .controller('CmbWorkflowController', ['$scope', 'kw.Girder', '$state', '$stateParams',
        '$mdDialog', '$templateCache', '$window',
        function ($scope, $girder, $state, $stateParams, $mdDialog, $templateCache, $window) {

        $scope.groups = [];
        $scope.projects = {};

        function updateProjectList() {
            $girder.listCollections().success(function(collections){
                var collectionId = null,
                    count = collections.length,
                    name = $stateParams.collectionName;

                while(count--) {
                    if(collections[count].name === name) {
                        collectionId = collections[count]._id;
                        count = 0;
                    }
                }

                if(collectionId) {
                    $girder.listWorkflowGroups(collectionId)
                        .success(function (groups) {
                            var found,
                                i;

                            function processGroups(groups) {
                                $scope.groups = [];
                                var count = groups.length,
                                    array = groups,
                                    projectsMap = {};

                                function addGroupProjects(projects) {
                                    var list = projects,
                                        size = list.length;

                                    while(size--) {
                                        var project = list[size];
                                        projectsMap[project._id] = project;
                                    }
                                }

                                while(count--) {
                                    if(array[count].name !== 'tasks') {
                                        $scope.groups.push(array[count]);
                                        $girder.listFolders(array[count]._id).success(addGroupProjects);
                                    }

                                }
                                $scope.projects = projectsMap;
                            }

                            // Look for a folder in this workflow with the same name as the
                            // user's login - this is the user's "My Projects" folder.  If
                            // it does not create it before rendering the projects view.
                            found = false;
                            for (i = 0; i < groups.length && !found; i++) {
                                if (groups[i].name === $girder.getUser().login) {
                                    found = true;
                                }
                            }

                            if (!found) {

                                return $girder.getCollectionFromName($stateParams.collectionName).then(function(result) {
                                    var collectionId = result.data[0]._id;
                                    return $girder.createFolder(collectionId, $girder.getUser().login,
                                        $girder.getUser().login + "'s projects", "collection")
                                        .success(function (folder) {
                                            processGroups(groups.concat(folder));
                                        });
                                });
                            } else {
                                processGroups(groups);
                            }
                        });

                        }
            });
        }

        $scope.createProject = function ( groupId, event ) {
            var collectionName = $scope.collection.name;
            $mdDialog.show({
                controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
                    $scope.ok = function(response) {
                        $window.WorkflowHelper[collectionName]['create-project'](groupId, $girder, response, $mdDialog);
                    };
                    $scope.cancel = function() {
                      $mdDialog.cancel();
                    };
                    $scope.data = {
                        name: '',
                        description: ''
                    };
                }],
                template: $templateCache.get(collectionName + '/tpls/create-project.html'),
                targetEvent: event,
            })
            .then(function(project) {
                // Move to the newly created project
                $state.go('project', { collectionName: $stateParams.collectionName, projectID: project._id });
            }, function() {
                // Nothing to do when close
            });
        };

        $scope.deleteProject = function ( projectId ) {
            //make this a mdDialog
            var confirm = $mdDialog.confirm({
                title: 'Are you sure you want to delete this project?',
                ok: 'Delete',
                cancel: 'Cancel'
            });

            $mdDialog.show(confirm).then(function(){
                $girder.deleteFolder(projectId).success(updateProjectList).error(updateProjectList);
            }, function() {
                //clicked
            });
        };

        if(!$girder.hasToken()) {
            $state.go('login');
        } else {
            updateProjectList();
        }
    }]);
