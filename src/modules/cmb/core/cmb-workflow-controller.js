angular.module("kitware.cmb.core")
    .controller('CmbWorkflowController', ['$scope', 'kw.Girder', '$state', '$stateParams', '$mdDialog', '$templateCache', '$window', function ($scope, $girder, $state, $stateParams, $mdDialog, $templateCache, $window) {

        $scope.groups = [];
        $scope.projects = {};

        function updateProjectList() {
            $girder.listWorkflowGroups($stateParams.collectionID)
                .success(function (groups) {
                    var found,
                        i;

                    function processGroups(groups) {
                        $scope.groups = groups;
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
                            $girder.listFolders(array[count]._id).success(addGroupProjects);
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
                        $girder.createFolder($stateParams.collectionID, $girder.getUser().login, $girder.getUser().login + "'s projects", "collection")
                            .success(function (folder) {
                                $scope.groups = groups = groups.concat(folder);
                                processGroups(groups);
                            });
                    } else {
                        processGroups(groups);
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
                }],
                template: $templateCache.get(collectionName + '/dialog/create-project.html'),
                targetEvent: event,
            })
            .then(function(project) {
                // Move to the newly created project
                $state.go('project', { collectionID: $stateParams.collectionID, projectID: project._id });
            }, function() {
                // Nothing to do when close
            });
        };

        $scope.deleteProject = function ( projectId ) {
            $girder.deleteFolder(projectId).success(updateProjectList).error(updateProjectList);
        };

        if($girder.getUser() === null) {
            $state.go('login');
        } else {
            updateProjectList();
        }
    }]);
