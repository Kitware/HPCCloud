angular.module("kitware.girder", ["ngCookies"])
    /**
     * The girder.net.GirderConnector service simplify management
     * and interaction with a Girder server using its Restful API.
     */
    .service('kw.Girder', [ '$window', '$http', '$rootScope', '$cookies', '$timeout',  function ($window, $http, $rootScope, $cookies, $timeout) {
        'use strict';

        // Internal state
        var apiBasePathURL = '/api/v1/',
            user = null,
            authToken = $cookies.girderToken,
            taskList = {},
            collectionMap = {};

        this.fetchUser = function() {
            var self = this;

            $http({
                method: 'GET',
                url: apiBasePathURL + 'user/me',
                headers: {
                    'Girder-Token': authToken
                }
            })
            .success(function(data, status, headers, config) {
                user = data;
                $rootScope.$broadcast('login', user);
                self.fetchTaskList();
            })
            .error(function(data, status, headers, config) {
                user = null;
                authToken = null;
            });
        };

        this.hasToken = function() {
            return !!authToken; //boolean cast
        };

        var notifications = null;

        function connectToNotificationStream() {
            if ($window.EventSource) {
                notifications = new EventSource(apiBasePathURL + 'notification/stream');
                notifications.onmessage = function(e) {
                    var parsed = JSON.parse(e.data);
                    console.log('broadcasting SSE:', parsed.type, parsed.data.status);
                    $rootScope.$broadcast(parsed.type, parsed.data);
                };

                notifications.onerror = function(e) {
                    // Wait 10 seconds if the browser hasn't reconnected then
                    // reinitialize.
                    $timeout(function() {
                        // If the EventSource in CLOSED state start again
                        if (notifications.readyState == 2) {
                            connectToNotificationStream();
                        }
                    }, 10000);
                };

            } else {
                console.error('No Server Side Event notifications available');
            }
        }

        connectToNotificationStream();

        // takes an object returns a parameterized url suffix
        // e.g. {profile: 'Joe', id: 12345, zone: 'west'} =>
        // "?profile=Joe&id=12345&zone=west"
        function objectArgumentSerializer(obj) {
          var str = '';
          Object.keys(obj).forEach(function(el, index) {
            if (index === 0) {
              str += '?' + el + '=' + escape(obj[el].toString());
            }
            else {
              str += '&' + el + '=' + escape(obj[el].toString());
            }
          });
          return str;
        }

        // Helper function use to generate $http argument base on
        // the targetted method and URL.
        function generateHttpConfig (method, url, data, config) {
            config = config || {};

            if (url[0] === '/') {
                url = url.substr(1);
            }

            // Create basic request config
            var httpConfig = {
                method: method,
                url: apiBasePathURL + url
            };

            if (data) {
                httpConfig.data = data;
            }

            // Add authentication token if available
            if (authToken) {
                httpConfig.headers = { 'Girder-Token' : authToken };
            }

            // Add extra configuration directives if present.  If one of the
            // options is "headers", *merge* it to the exists headers object
            // instead of blindly rewriting it.
            for (var c in config) {
                if (config.hasOwnProperty(c)) {
                    if (c !== 'headers') {
                        httpConfig[c] = config[c];
                    } else {
                        httpConfig.headers = httpConfig.headers || {};
                        for (var h in config.headers) {
                            if (config.headers.hasOwnProperty(h)) {
                                httpConfig.headers[h] = config.headers[h];
                            }
                        }
                    }
                }
            }

            return httpConfig;
        }

        this.getApiBase = function () {
            return apiBasePathURL;
        };

        this.getAuthToken = function () {
            return authToken;
        };

        /**
         * Change Girder API endpoint if need be.
         * The default value is '/api/v1/'
         */
         this.setGirderBasePathAPI = function (newBasePath) {
            apiBasePathURL = newBasePath;
         };

         /**
          * Try to Authenticate a given user. Once the action is fullfiled
          * one of the following event will be broadcasted on the $rootScope.
          *
          * Events:
          *   - 'login', { user data [...] }
          *   - 'login-error'
          */
        this.login = function (login, password) {
            var authString = $window.btoa(login + ':' + password),
                self = this;
            $http({
                method: 'GET',
                url: apiBasePathURL + 'user/authentication',
                headers: {
                    'Authorization': 'Basic ' + authString
                }
            })
            .success(function(data, status, headers, config) {
                user = data.user;
                authToken = data.authToken.token;
                $rootScope.$broadcast('login', user);

                $cookies.girderToken = authToken;

                self.fetchTaskList();
            })
            .error(function(data, status, headers, config) {
                user = null;
                authToken = null;
                $rootScope.$broadcast('login-error');
            });
        };

        /**
         * Try to delete authentication cookie.
         *
         * Events:
         *   - 'logout'
         *   - 'logout-error'
         */
        this.logout = function () {
            $cookies.cmbUser = null;
            $cookies.cmbAuthToken = null;
            if (user) {
                this.delete('user/authentication')
                .success(function(){
                    $rootScope.$broadcast('logout');
                    user = null;
                    authToken = null;
                })
                .error(function(){
                    $rootScope.$broadcast('logout-error');
                });
            }
        };

        this.registerUser = function(user) {
            return this.post('user' + objectArgumentSerializer(user));
        };

        this.changeUserPassword = function(oldPass, newPass) {
            return this.put('user/password?old='+oldPass+'&new='+newPass);
        };

        /**
         * Return the logged in user if any.
         */
        this.getUser = function () {
            return user;
        };

        /**
         * Return true if logged in, false otherwise.
         */
        this.isLoggedIn = function () {
            return !!user;
        };

        /**
         * Perform a GET http call to the given url with
         * the authentication Token if available.
         */
        this.get = function (url, param) {
            return $http(generateHttpConfig('GET', url, null, param));
        };

        /**
         * Perform a PUT http call to the given url with
         * the authentication Token if available.
         */
        this.put = function (url, data) {
            return $http(generateHttpConfig('PUT', url, data));
        };

        /**
         * Perform a DELETE http call to the given url with
         * the authentication Token if available.
         */
        this.delete = function (url) {
            return $http(generateHttpConfig('DELETE', url));
        };

        /**
         * Perform a PATCH http call to the given url with
         * the authentication Token if available.
         */
        this.post = function (url, data, config) {
            return $http(generateHttpConfig('POST', url, data, config));
        };

        this.patch = function (url, data, config) {
            return $http(generateHttpConfig('PATCH', url, data, config));
        };

        /**
         * Annonymous HTTP get call on a given URL and
         * return a promise like on which could be
         * attached a .success(function(data){}) or
         * .error(function(){}) callback.
         */
        this.fetch = function (url) {
            return $http({ method: 'GET', url: url});
        };

        // ====================================================================

        /**
         * Return a promise which should provide the list of available workflow
         */
        this.listCollections = function () {
            return this.get('collection');
        };

        /**
         * Return a promise which should provide the list of available groups
         * within a workflow.
         */
        this.listWorkflowGroups = function ( collectionId ) {
            return this.get('folder?parentType=collection&parentId=' + collectionId);
        };

        /**
         * Return a promise which should provide the list of available folders
         * within a folder.
         */
        this.listFolders = function ( parentId, parentType ) {
            parentType = parentType || "folder";
            return this.get('folder?parentType='+parentType+'&parentId=' + parentId);
        };

        /**
         * Return a promise which should provide the list of available items
         * within a folder.
         */
        this.listItems = function (parentId, name) {
            return this.get('item?folderId=' + parentId + (name ? '&text=' + name : ''));
        };

        this.listItemFiles = function (itemId) {
            return this.get('item/' + itemId + '/files');
        };

        this.getFileId = function (itemId, fileName, callback) {
            this.listItemFiles(itemId)
                .success(function(files) {
                    var count = files.length;
                    while(count--) {
                        if(files[count].name === fileName) {
                            callback(files[count]._id);
                            return;
                        }
                    }
                    callback(undefined);
                }).error(function() {
                    callback(undefined);
                });
        };

        this.createFolder = function (parentId, name, description, parentType) {
            parentType = parentType || "folder";
            return this.post(['folder?parentId=', parentId,
                '&parentType=', parentType,
                '&name=', escape(name),
                '&description=', escape(description)].join(''));
        };

        this.setFolderAccess = function (folderId, access) {
            return this.put('folder/' + folderId + '/access?access=' + JSON.stringify(access));
        };

        this.deleteFolder = function (id) {
            return this.delete('folder/' + id);
        };

        this.getCollectionFromName = function (name) {
            return this.get('collection?text=' + name);
        };

        this.getFolder = function (id) {
            return this.get('folder/' + id);
        };

        this.getItem = function (id) {
            return this.get('item/' + id);
        };

        this.patchItemMetadata = function(itemId, data) {
            return this.put('item/' + itemId + '/metadata', data);
        };

        this.deleteItem = function (item) {
            if (item.meta.volumeId) {
                this.deleteVolume(item);
            }
            return this.delete('item/' + item._id);
        };

        this.createItem = function (folderId, name, description, metadata) {
            var that = this,
                obj = {folderId: folderId, name: name, description: description},
                promise = this.post('item' + objectArgumentSerializer(obj));
            if (metadata) {
                promise
                .success(function(newItem) {
                    return that.put('item/' + newItem._id + '/metadata', metadata);
                })
                .error(function(){
                    console.log('Error while creating item');
                    return promise;
                });
            }
            return promise;
        };

        this.copyItem = function (simulationToClone, projectId, name, description) {
            return this.post(['item', simulationToClone._id, 'copy?folderId=' + projectId + '&name=' + escape(name) + '&description=' + escape(description)].join('/'));
        };

        this.copyFile = function (fileId, itemId) {
            return this.post(['file', fileId, 'copy?itemId=' + itemId].join('/'));
        };

        this.uploadChunk = function (uploadId, offset, blob) {
            var formdata = new FormData();
            formdata.append('offset', offset);
            formdata.append('uploadId', uploadId);
            formdata.append('chunk', blob);

            return this.post('file/chunk', formdata, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            });
        };

        this.uploadFile = function (parentType, parentId, file, opt) {
            var that = this;

            opt = opt || {};

            // Create a new file.
            //
            // If the "name" parameter is given, use that for the filename;
            // otherwise use the filename in the File object.
            this.post(['file',
                       '?parentType=', parentType,
                       '&parentId=', parentId,
                       '&name=', opt.name || file.name,
                       '&size=', file.size,
                       '&mimeType=', file.type].join(''))
                .success(function (upload) {
                    var chunkSize = 16*1024*1024,
                        uploadNextChunk,
                        i = 0,
                        chunks = Math.floor(file.size / chunkSize);

                    // Notify that upload started
                    $rootScope.$broadcast('notification-message', {
                        type: 'upload',
                        file: file.name,
                        done: 0,
                        total: chunks
                    });

                    uploadNextChunk = function (offset) {
                        var blob;

                        if (offset + chunkSize >= file.size) {
                            blob = file.slice(offset);
                            that.uploadChunk(upload._id, offset, blob)
                                .then(function (data) {
                                    $rootScope.$broadcast('file-uploaded', parentId, data);
                                    $rootScope.$broadcast('notification-message', null);
                                }, function (data) {
                                    console.warn('could not upload data');
                                    console.warn(data);
                                });
                        } else {
                            blob = file.slice(offset, offset + chunkSize);
                            that.uploadChunk(upload._id, offset, blob)
                                .then(function (data) {
                                    var msg;

                                    i += 1;
                                    msg = 'chunk ' + i + ' of ' + chunks + ' uploaded';

                                    $rootScope.$broadcast('notification-message', {
                                        type: 'upload',
                                        file: file.name,
                                        done: i,
                                        total: chunks
                                    });

                                    uploadNextChunk(offset + chunkSize);
                                }, function (data) {
                                    console.warn('could not upload data');
                                    console.warn(data);
                                });
                        }
                    };

                    uploadNextChunk(0);
                })
                .error(function (data) {
                    console.warn("Could not upload file");
                    console.warn(data);
                });
        };

        this.uploadFileItem = function (itemId, file, opt) {
            this.uploadFile('item', itemId, file, opt);
        };

        this.uploadContentToItem = function (itemId, name, content) {
            var self = this,
                blob = new Blob([content], { type: "text/plain"});

            function uploadFunction (upload) {
                self.uploadChunk(upload._id, 0, blob)
                    .success(function (data) {
                        console.log("Upload ok");
                    })
                    .error(function (data) {
                        console.warn('could not upload data');
                        console.warn(data);
                    });
            }

            function foundFileId (fileId) {
                if(fileId) {
                    self.put(['file/', fileId, '/contents',
                               '?size=', content.length].join(''))
                        .success(uploadFunction)
                        .error(function (data) {
                            console.warn("Could not upload content");
                            console.warn(data);
                        });
                } else {
                    self.post(['file',
                               '?parentType=item',
                               '&parentId=', itemId,
                               '&name=', name,
                               '&size=', content.length,
                               '&mimeType=txt/plain'].join(''))
                        .success(uploadFunction)
                        .error(function (data) {
                            console.warn("Could not upload content");
                            console.warn(data);
                        });
                }
            }

            // Find  out if the file already exist
            self.getFileId(itemId, name, foundFileId);
        };

        this.downloadItem = function (itemId) {
            return this.get(['item', itemId, 'download'].join('/'), {responseType:'arraybuffer'});
        };

        this.downloadContentFromItem = function (itemId, name, callback) {
            var self = this;

            function processFileId (fileId) {
                if(fileId) {
                    self.get(['file/', fileId, '/download/', name].join(''))
                        .success(callback)
                        .error(function(data) {
                            console.warn("Error while downloading file content");
                            console.warn(data);
                        });
                } else {
                    callback(undefined);
                }
            }

            self.getFileId(itemId, name, processFileId);
        };

        // PUT /meshes/{mesh_file_id}/extract/surface
        //
        // Where mesh_file_id is the id of the file containing the mesh.
        //
        // The body of the request should have the following form:
        //
        // {
        //   "output": {
        //     "itemId": "The id of the item you what the output to be uploaded to",
        //     "name": "The name to give the output file"
        //   }
        // }
        this.processMesh = function(itemId, fileId) {
          return this.put(
            "meshes/" + fileId + "/extract/surface",
            {
              output: {
                itemId: itemId,
                name: 'mesh-faceset.vtk'
              }
            }
          );
        };

        this.updateItemMetadata = function (item, metadata) {
            console.log('new meta data:', item.name, metadata);
            // status needs to be nested with it's task
            if (metadata.status) {
                var newMeta = {};
                newMeta[item.meta.task] = metadata;
                metadata = newMeta;
            }
            return this.put(['item', item._id, 'metadata'].join('/'), metadata)
                .success(function(){
                    console.log('Success metadata updating to ', metadata);
                }).error(function(error){
                    console.log('Error when updating metadata:', error.message);
                });
        };

        this.getJobOutput = function (jobId, filePath, offset) {
            return this.get(['jobs', jobId, 'output?path=' + filePath + '&offset=' + offset].join('/'));
        };

        this.extractMeshInformationFromProject = function(folderId, callback) {
            var self = this;

            self.listItems(folderId)
                .success(function(items) {
                    var count = items.length,
                        meshItem = null,
                        meshFile = null;

                    // Find item that contains the mesh
                    while(count-- && meshItem === null) {
                        if(items[count].name === 'mesh') {
                           meshItem =  items[count];
                        }
                    }

                    // Find the name of the mesh file
                    self.listItemFiles(meshItem._id)
                        .success(function(files) {
                            count = files.length;

                            while(count-- && meshFile === null) {
                                if(files[count].exts[0] === 'exo') {
                                    meshFile =  files[count];
                                    callback(meshItem, meshFile);
                                }
                            }
                        })
                        .error(function(){
                            console.log('Error while listing files inside mesh item');
                        });
                })
                .error(function() {
                    console.log('Error while listing items inside ' + folderId);
                });
        };

        // Tasks
        this.startTask = function (item, taskDefId, cluster, taskConfig, cb) {
            var self = this,
                sessionId = null;

            if (taskConfig.hasOwnProperty('sessionId')) {
                sessionId = taskConfig.sessionId;
            }

            // Create task instance
            taskConfig.cluster.name = item._id;
            if (item.meta.hasOwnProperty('volumeId')) {
                taskConfig.cluster.volumeId = item.meta.volumeId;
            }
            self.post('tasks', { taskSpecId: taskDefId })
                .then(function(response){
                    // Update Item metadata
                    var metadata = {};
                    metadata.task = taskConfig.taskName;
                    metadata[taskConfig.taskName] = {
                        taskId: response.data._id,
                        spec: response.data.taskSpecId,
                        task: response.data.status,
                        startTime: new Date().getTime(),
                        cost: cluster.cost,
                        totalCost: (item.meta.totalCost || 0),
                    };

                    if (sessionId !== null) {
                        metadata.sessionId = sessionId;
                    }

                    // Start task
                    return self.put(['tasks', response.data._id, 'run'].join('/'), taskConfig)
                        .then(function(response){
                            console.log("Task successfully started");
                            metadata[taskConfig.taskName].status = 'running';
                            self.updateItemMetadata(item, metadata);
                            if (cb) {
                                cb(metadata[metadata.task].taskId);
                            }
                        }, function(error) {
                            console.log("Error while starting Task", error.data.message);
                            item.meta[taskConfig.taskName].status = 'error';
                            self.updateItemMetadata(item, item.meta);
                        });
                }, function(error) {
                    console.log("Error while task creation", error.data.message);
                    item.meta[taskConfig.taskName].status = 'error';
                    self.updateItemMetadata(item, item.meta);
                });
        };

        this.startTaggerTask = function (item, taskDefId, cluster, taskConfig) {
            var self = this;
            // Create task instance
            taskConfig.cluster.name = item._id;
            return self.post('tasks', { taskSpecId: taskDefId })
                .then(function(res) {
                    return self.put(['tasks', res.data._id, 'run'].join('/'), taskConfig);
                });
        };

        this.getTaskId = function(workflow, taskName) {
            if(workflow && taskName) {
                return taskList[workflow][taskName];
            }
            return null;
        };

        this.getTask = function(item) {
            var taskId = item.meta[item.meta.task].taskId;
            return this.getTaskWithId(taskId);
        };

        this.getTaskWithId = function(taskId) {
            return this.get(['tasks/', taskId].join(''));
        };

        this.getTaskLog = function(url, offset) {
            if (!offset) {
                offset = 0;
            }
            return this.get(url + '?offset=' + offset);
        };

        this.fetchTaskList = function() {
            var self = this;

        //callback hell, with loops, doesn't work with .then()'s
            self.listCollections()
                .success(function(collections) {
                    angular.forEach(collections, function(collection) {
                        collectionMap[collection.name] = collection;
                        taskList[collection.name] = {};
        /*list folders*/self.listFolders(collection._id, 'collection')
                            .success(function(folders){
                                angular.forEach(folders, function(folder) {
                                    if (folder.name === 'tasks') {
                                        self.listItems(folder._id)
        /* list items for folders -------*/ .success(function(items) {
                                                angular.forEach(items, function(item) {
        /* list files in items ----------------- */ self.listItemFiles(item._id).success(function(files){
                                                        angular.forEach(files, function(file) {
                                                            taskList[collection.name][file.name] = file._id;
                                                        });
                                                    });
                                                });
                                            });
                                    }
                                });
                            });
                    });
                });
        };

        this.updateTaskStatus = function (item) {
            var self = this;

            self.get(['tasks/', item.meta[item.meta.task].taskId].join(''))
                .success(function(response) {
                    if(item.meta.status !== response.status) {
                        console.log('update status to ' + response.status + ' from: ' + item.meta[item.meta.task].task);
                        var sesssionId = (response.output && response.output.pvw_job) ? response.output.cluster._id + '%2F' + response.output.pvw_job._id : '',
                            connectionURL = ( $window.location.protocol === 'https:' ? "wss://" : "ws://") + $window.location.host + "/proxy?sessionId=" + sesssionId,
                            meta = angular.copy(item.meta[item.meta.task]);

                        meta[item.meta.task].task = response.status;
                        meta[item.meta.task].connectionURL = connectionURL;

                        // FIXME
                        if(meta[item.meta.task].task === 'running' && meta[item.meta.task].status === 'valid') {
                            meta[meta.task].status = 'running';
                            console.log('wf => running');
                        }
                        if(meta[item.meta.task].task === 'complete' && meta[item.meta.task].status === 'running') {
                            meta[meta.task].status = 'completed';
                            meta[meta.task].task = 'terminated';
                            console.log('wf => completed(terminated)');
                        }

                        self.updateItemMetadata(item, meta);
                    } else {
                        var changeDetected = false,
                            newMeta = angular.copy(item.meta);

                        // FIXME
                        if(newMeta[newMeta.task].task === 'running' && newMeta[newMeta.task].status === 'valid') {
                            newMeta[newMeta.task].status = 'running';
                            changeDetected = true;
                            console.log('wf => running');
                        }
                        if(newMeta[newMeta.task].task === 'complete' && newMeta[newMeta.task].status === 'running') {
                            newMeta[newMeta.task].status = 'completed';
                            newMeta[newMeta.task].task = 'terminated';
                            console.log('wf => completed(terminated)');
                            changeDetected = true;
                        }

                        if(changeDetected) {
                            self.updateItemMetadata(item, newMeta);
                        }
                    }
                })
                .error(function(resp){
                    console.log('error when updating status');
                });
        };

        this.deleteTask = function (item) {
            var self = this,
                taskId = item.meta[item.meta.task].taskId,
                timings = {},
                ready = 0;

            console.log('deleting:', item);
            function extractTiming(obj) {
                angular.extend(timings, obj.timings);
                self.updateItemMetadata(item, {timings: timings});
                ready--;

                if(ready === 0){
                    // Execute the delete
                    var toUpdate = {
                        task: null
                    };
                    toUpdate[item.meta.task] = null;
                    self.delete(['tasks', taskId].join('/'))
                        .success(function(){
                            // Remove item metadata
                            self.updateItemMetadata(item, toUpdate);
                        })
                        .error(function(error){
                            console.log("Error when deleting task " + taskId, error.message || error.data.message);
                            self.updateItemMetadata(item, toUpdate);
                        });
                }
            }

            // Retrieve timing information first //WHY
            self.get('tasks/' + taskId)
                .success(function(task){
                    var clusterId = null,
                        jobId = null;

                    if(task.output && task.output.cluster) {
                        clusterId = task.output.cluster._id;
                        ready++;
                    }
                    if(task.output && task.output.hydra_job) {
                        ready++;
                        jobId = task.output.hydra_job._id;
                    }
                    if(ready === 0) {
                        extractTiming({timings:{"info": "nothing to get"}});
                    }

                    if(clusterId) {
                        self.get(['clusters', clusterId].join('/'))
                            .success(extractTiming);
                    }
                    if(jobId) {
                        self.get(['jobs', jobId].join('/'))
                            .success(extractTiming);
                    }
                })
                .error(function() {
                    console.log('unable to fetch task');
                    // Maybe update metadata if task does not exist anymore...
                });
        };

        this.terminateTask = function (item) {
            var self = this,
                taskId = item.meta[item.meta.task].taskId;

            // PUT /task/<_id from above>/terminate
            // DELETE /task/<_id from above>
            self.put(['tasks', taskId, 'terminate'].join('/'))
                .success(function(){
                    item.meta[item.meta.task].status = 'terminated';
                    item.meta[item.meta.task].totalCost += item.meta[item.meta.task].cost * Math.floor( 1 + (new Date().getTime() - item.meta[item.meta.task].startTime)/3600000);
                    item.meta[item.meta.task].startTime = null;
                    // flip the active task back to the simulation if paraview is being terminated.
                    if (item.meta.task === 'pvw') {
                        var keys = Object.keys(item.meta);
                        for (var i=0; i < keys.length; i++) {
                            if (keys[i] !== 'task' && keys[i] !== item.meta.task) {
                                item.meta.task = keys[i];
                                break;
                            }
                        }
                    }
                    self.updateItemMetadata(item, item.meta);
                })
                .error(function(error) {
                    console.log("Error when terminating task " + taskId, error.message);
                });
        };

        this.getSessionURL = function (taskId, callback) {
            this.get(['tasks', taskId].join('/'))
                .success(function(resp){
                    var sesssionId = resp.output.cluster._id + '%2F' + resp.output.pvw_job._id;
                    callback( ( $window.location.protocol === 'https:' ? "wss://" : "ws://") + $window.location.host + "/proxy?sessionId=" + sesssionId);
                })
                .error(function(error){
                    console.log("Error when fetching task info for " + taskId, error.message);
                });
        };

        // AWS
        this.getAWSProfiles = function() {
            return this.get('user/' + user._id + '/aws/profiles');
        };

        this.createAWSProfile = function(prof) {
            return this.post('user/' + user._id + '/aws/profiles', prof);
        };

        this.saveAWSProfile = function(prof) {
            return this.patch('user/' + user._id + '/aws/profiles/' + prof._id, prof);
        };

        this.getAWSRunningInstances = function(prof) {
            return this.get('user/' + user._id + '/aws/profiles/' + prof._id + '/runninginstances');
        };

        this.getAWSMaxInstances = function(prof) {
            return this.get('user/' + user._id + '/aws/profiles/' + prof._id + '/maxinstances');
        };

        this.deleteAWSProfile = function(prof) {
            return this.delete('user/' + user._id + '/aws/profiles/' + prof._id);
        };

        // Clusters
        this.getClusterProfiles = function() {
            return this.get('clusters?type=trad');
        };

        this.getSingleClusterProfile = function(id) {
            return this.get('clusters/' + id);
        };

        this.getClusterStatus = function(id) {
            return this.get('clusters/' + id + '/status');
        };

        this.getClusterLog = function(taskId, offset) {
            if (offset === undefined || offset < 0) {
                offset = 0;
            }

            return this.get('clusters/' + taskId + '/log');
        };

        this.testCluster = function(id) {
            return this.put('clusters/' + id + '/start');
        };

        this.createClusterProfile = function(prof) {
            return this.post('clusters', prof);
        };

        this.deleteClusterProfile = function(prof) {
            return this.delete('clusters/' + prof._id);
        };

        // Volumes
        this.getVolume = function(id) {
            return this.get('volumes/' + id);
        };

        this.createVolume = function(data) {
            return this.post('volumes', data);
        };

        this.detachVolume = function(id) {
            return this.get('volumes/' + id + '/detach');
        };

        this.deleteVolume = function(item) {
            return this.delete('volumes/' + item.meta.volumeId);
        };

        this.getToken = function() {
            return this.get('token/current');
        };

        this.getToken().then(angular.bind(this, function(response) {
            if (response.data && response.data._id) {
                authToken = response.data._id;

                if (authToken) {
                    this.fetchUser();
                }
            }
            else {
                authToken = null;
                $rootScope.$broadcast('logout');
            }
        }), function(error) {
            console.log(error);
            authToken = null;
            $rootScope.$broadcast('logout');
        });
    }]);
