angular.module("kitware.cmb.core")
    .controller('CmbWorkflowController', ['$scope', 'kw.Girder', '$state', '$stateParams', function ($scope, $girder, $state, $stateParams) {

        $scope.groups = [];
        $scope.projects = {};

        if($girder.getUser() === null) {
            $state.go('login');
        } else {
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
    }]);
