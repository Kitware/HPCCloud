angular.module("kitware.cmb.core")
    .service('CmbWorkflowHelper', [ '$http', function ($http) {
        'use strict';

        var templateCache = {}, pendingRequests = [];

        this.getTemplate = function (workflowName) {
            if(templateCache[workflowName]) {
                return templateCache[workflowName];
            } else {
                if(pendingRequests.indexOf(workflowName) === -1) {
                    pendingRequests.push(workflowName);
                    $http
                    .get('assets/wf/' + workflowName + '/input-template.json')
                    .success(function(data, status, headers, config) {
                        templateCache[workflowName] = data;
                        pendingRequests.pop();
                    })
                    .error(function(data, status, headers, config) {
                        console.log("Fecth error for " + workflowName);
                        pendingRequests.pop();
                    });
                }
            }
            return null;
        };

    }]);
