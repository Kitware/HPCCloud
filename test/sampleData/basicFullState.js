/* eslint-disable */
export default {
  "auth": {
    "pending": false,
    "user": {
      "_accessLevel": 2,
      "_id": "574c841b0640fd3f1a3b3741",
      "_modelType": "user",
      "admin": false,
      "created": "2016-05-30T18:19:06.921000+00:00",
      "email": "123@the.wow",
      "firstName": "Emma",
      "groupInvites": [],
      "groups": [],
      "lastName": "Maybe",
      "login": "qwert",
      "public": true,
      "size": 438974
    }
  },
  "fs": {
    "folderMapById": {},
    "itemMapById": {}
  },
  "network": {
    "pending": {},
    "success": {},
    "error": {},
    "backlog": [],
    "progress": {},
    "progressReset": false
  },
  "preferences": {
    "clusters": {
      "list": [],
      "active": 0,
      "pending": false,
      "mapById": {}
    },
    "aws": {
      "list": [],
      "active": 0,
      "pending": false,
      "mapById": {}
    },
    "statuses": {
      "ec2": [],
      "clusters": []
    }
  },
  "projects": {
    "list": [
      "574c84270640fd3f1a3b3747"
    ],
    "active": null,
    "mapById": {
      "574c84270640fd3f1a3b3747": {
        "_id": "574c84270640fd3f1a3b3747",
        "access": {
          "groups": [],
          "users": [
            {
              "id": "574c841b0640fd3f1a3b3741",
              "level": 2
            }
          ]
        },
        "created": "2016-05-30T18:19:19.405000+00:00",
        "description": "",
        "folderId": "574c84270640fd3f1a3b3745",
        "metadata": {
          "inputFolder": {
            "_id": "574c84270640fd3f1a3b3749",
            "files": {}
          },
          "outputFolder": {
            "_id": "574c84270640fd3f1a3b3748",
            "files": {}
          }
        },
        "name": "proj 1",
        "steps": [
          "Introduction",
          "Simulation",
          "Visualization"
        ],
        "type": "PyFrExec",
        "updated": "2016-05-30T18:19:19.461000+00:00",
        "userId": "574c841b0640fd3f1a3b3741"
      }
    },
    "simulations": {
      "574c84270640fd3f1a3b3747": {
        "list": [
          "574c8aa00640fd3f1a3b379f",
          "574ca0420640fd6e13b11e43"
        ],
        "active": null
      }
    },
    "workflowNames": [
      {
        "value": "PyFr",
        "label": "PyFR"
      },
      {
        "value": "PyFrExec",
        "label": "PyFR (Runtime)"
      },
      {
        "value": "Visualizer",
        "label": "ParaViewWeb"
      }
    ]
  },
  "simulations": {
    "mapById": {
      "574c8aa00640fd3f1a3b379f": {
        "_id": "574c8aa00640fd3f1a3b379f",
        "access": {
          "groups": [],
          "users": [
            {
              "id": "574c841b0640fd3f1a3b3741",
              "level": 2
            }
          ]
        },
        "active": "Simulation",
        "created": "2016-05-30T18:46:56.487000+00:00",
        "description": "will error",
        "disabled": [
          "Visualization"
        ],
        "folderId": "574c8aa00640fd3f1a3b379b",
        "metadata": {
          "inputFolder": {
            "_id": "574c8aa00640fd3f1a3b37a1",
            "files": {
              "ini": "574c8aa00640fd3f1a3b37a6",
              "mesh": "574c8aa00640fd3f1a3b37a7"
            }
          },
          "outputFolder": {
            "_id": "574c8aa00640fd3f1a3b37a0",
            "files": {}
          },
          "status": "complete"
        },
        "name": "sim001",
        "projectId": "574c84270640fd3f1a3b3747",
        "steps": {
          "Introduction": {
            "folderId": "574c8aa00640fd3f1a3b379c",
            "metadata": {},
            "status": "created",
            "type": "information"
          },
          "Simulation": {
            "folderId": "574c8aa00640fd3f1a3b379e",
            "metadata": {
              "sessionId": "MC43NjU1MDAyMzYxNDc5NTI4LDAuMDYxMTY5Njg0NTE5NTAzMTEsMC43NDY1NzU1NDY2MTEwMjg0",
              "taskflowId": "574c9d900640fd6e133b4b57"
            },
            "status": "created",
            "type": "output",
            "view": "run"
          },
          "Visualization": {
            "folderId": "574c8aa00640fd3f1a3b379d",
            "metadata": {},
            "status": "created",
            "type": "output"
          }
        },
        "updated": "2016-05-30T20:25:03.260000+00:00",
        "userId": "574c841b0640fd3f1a3b3741"
      },
      "574ca0420640fd6e13b11e43": {
        "_id": "574ca0420640fd6e13b11e43",
        "access": {
          "groups": [],
          "users": [
            {
              "id": "574c841b0640fd3f1a3b3741",
              "level": 2
            }
          ]
        },
        "active": "Simulation",
        "created": "2016-05-30T20:19:14.859000+00:00",
        "description": "error this!",
        "disabled": [
          "Visualization"
        ],
        "folderId": "574ca0420640fd6e13b11e3f",
        "metadata": {
          "inputFolder": {
            "_id": "574ca0420640fd6e13b11e45",
            "files": {
              "ini": "574ca0430640fd6e13b11e4a",
              "mesh": "574ca0430640fd6e13b11e4b"
            }
          },
          "outputFolder": {
            "_id": "574ca0420640fd6e13b11e44",
            "files": {}
          },
          "status": "terminated"
        },
        "name": "sim002",
        "projectId": "574c84270640fd3f1a3b3747",
        "steps": {
          "Introduction": {
            "folderId": "574ca0420640fd6e13b11e40",
            "metadata": {},
            "status": "created",
            "type": "information"
          },
          "Simulation": {
            "folderId": "574ca0420640fd6e13b11e42",
            "metadata": {
              "sessionId": "MC4wOTE2NTY4MTY4MjMwOTA5LDAuMDcwOTkyOTM3NzIxODk2OTYsMC4xMjAyODE0OTE5NDg5NjU0Mg==",
              "taskflowId": "574ca2670640fd6e134265e1"
            },
            "status": "created",
            "type": "output",
            "view": "run"
          },
          "Visualization": {
            "folderId": "574ca0420640fd6e13b11e41",
            "metadata": {},
            "status": "created",
            "type": "output"
          }
        },
        "updated": "2016-05-30T20:34:17.871000+00:00",
        "userId": "574c841b0640fd3f1a3b3741"
      }
    }
  },
  "taskflows": {
    "mapById": {},
    "taskflowMapByTaskId": {},
    "taskflowMapByJobId": {},
    "updateLogs": []
  },
  "routing": {
    "locationBeforeTransitions": {
      "pathname": "\/",
      "search": "",
      "hash": "",
      "state": null,
      "action": "POP",
      "key": "5ix77j",
      "query": {

      },
      "$searchBase": {
        "search": "",
        "searchBase": ""
      }
    }
  }
}
