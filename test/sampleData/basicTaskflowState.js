/* eslint-disable */
export default {
  "mapById": {
    "574c9d900640fd6e133b4b57": {
      "taskMapById": {
        "574c9f350640fd6e13b11e39": {
          "_accessLevel": 2,
          "_id": "574c9f350640fd6e13b11e39",
          "_modelType": "tasks",
          "created": "2016-05-30T20:14:45.187000+00:00",
          "log": [],
          "name": "hpccloud.taskflow.pyfr.setup_input",
          "status": "complete",
          "taskFlowId": "574c9d900640fd6e133b4b57"
        },
        "574c9e460640fd6e13b11e32": {
          "_accessLevel": 2,
          "_id": "574c9e460640fd6e13b11e32",
          "_modelType": "tasks",
          "created": "2016-05-30T20:10:46.658000+00:00",
          "log": [],
          "name": "hpccloud.taskflow.pyfr.pyfr_terminate",
          "status": "complete",
          "taskFlowId": "574c9d900640fd6e133b4b57"
        },
        "574c9d910640fd6e133b4b59": {
          "_accessLevel": 2,
          "_id": "574c9d910640fd6e133b4b59",
          "_modelType": "tasks",
          "created": "2016-05-30T20:07:45.398000+00:00",
          "log": [
            {
              "args": [],
              "created": 1464638865.5593,
              "exc_info": null,
              "exc_text": null,
              "filename": "__init__.py",
              "funcName": "setup_cluster",
              "levelname": "INFO",
              "levelno": 20,
              "lineno": 143,
              "module": "__init__",
              "msecs": 559.30709838867,
              "msg": "Cluster name my new node",
              "name": "task.574c9d910640fd6e133b4b59",
              "pathname": "\/opt\/hpccloud\/hpccloud\/server\/taskflows\/hpccloud\/taskflow\/utility\/__init__.py",
              "process": 17447,
              "processName": "Worker-1",
              "relativeCreated": 7804605.1511765,
              "thread": 1.4053705497581e+14,
              "threadName": "MainThread"
            },
            {
              "args": [],
              "created": 1464638866.0911,
              "exc_info": null,
              "exc_text": null,
              "filename": "__init__.py",
              "funcName": "create_ec2_cluster",
              "levelname": "INFO",
              "levelno": 20,
              "lineno": 65,
              "module": "__init__",
              "msecs": 91.130971908569,
              "msg": "Using source ip: 123.201.24.01",
              "name": "task.574c9d910640fd6e133b4b59",
              "pathname": "\/opt\/hpccloud\/hpccloud\/server\/taskflows\/hpccloud\/taskflow\/utility\/__init__.py",
              "process": 17447,
              "processName": "Worker-1",
              "relativeCreated": 7805136.97505,
              "thread": 1.4053705497581e+14,
              "threadName": "MainThread"
            },
            {
              "args": [],
              "created": 1464638866.2976,
              "exc_info": null,
              "exc_text": null,
              "filename": "__init__.py",
              "funcName": "create_ec2_cluster",
              "levelname": "INFO",
              "levelno": 20,
              "lineno": 107,
              "module": "__init__",
              "msecs": 297.59693145752,
              "msg": "Created cluster: 574c9d920640fd6e133b4b60",
              "name": "task.574c9d910640fd6e133b4b59",
              "pathname": "\/opt\/hpccloud\/hpccloud\/server\/taskflows\/hpccloud\/taskflow\/utility\/__init__.py",
              "process": 17447,
              "processName": "Worker-1",
              "relativeCreated": 7805343.4410095,
              "thread": 1.4053705497581e+14,
              "threadName": "MainThread"
            },
            {
              "args": [],
              "created": 1464638866.3557,
              "exc_info": null,
              "exc_text": null,
              "filename": "__init__.py",
              "funcName": "create_ec2_cluster",
              "levelname": "INFO",
              "levelno": 20,
              "lineno": 112,
              "module": "__init__",
              "msecs": 355.6981086731,
              "msg": "Starting cluster.",
              "name": "task.574c9d910640fd6e133b4b59",
              "pathname": "\/opt\/hpccloud\/hpccloud\/server\/taskflows\/hpccloud\/taskflow\/utility\/__init__.py",
              "process": 17447,
              "processName": "Worker-1",
              "relativeCreated": 7805401.5421867,
              "thread": 1.4053705497581e+14,
              "threadName": "MainThread"
            },
            {
              "args": [],
              "created": 1464639285.1466,
              "exc_info": null,
              "exc_text": null,
              "filename": "__init__.py",
              "funcName": "setup_cluster",
              "levelname": "INFO",
              "levelno": 20,
              "lineno": 148,
              "module": "__init__",
              "msecs": 146.5539932251,
              "msg": "Cluster started.",
              "name": "task.574c9d910640fd6e133b4b59",
              "pathname": "\/opt\/hpccloud\/hpccloud\/server\/taskflows\/hpccloud\/taskflow\/utility\/__init__.py",
              "process": 17447,
              "processName": "Worker-1",
              "relativeCreated": 8224192.3980713,
              "thread": 1.4053705497581e+14,
              "threadName": "MainThread"
            }
          ],
          "name": "hpccloud.taskflow.utility.setup_cluster",
          "status": "complete",
          "taskFlowId": "574c9d900640fd6e133b4b57"
        }
      },
      "log": [
        {
          "args": [],
          "created": 1464638865.5391,
          "exc_info": null,
          "exc_text": null,
          "filename": "__init__.py",
          "funcName": "setup_cluster",
          "levelname": "INFO",
          "levelno": 20,
          "lineno": 142,
          "module": "__init__",
          "msecs": 539.0989780426,
          "msg": "We are creating an EC2 cluster.",
          "name": "taskflow.574c9d900640fd6e133b4b57",
          "pathname": "\/opt\/hpccloud\/hpccloud\/server\/taskflows\/hpccloud\/taskflow\/utility\/__init__.py",
          "process": 17447,
          "processName": "Worker-1",
          "relativeCreated": 7804584.9430561,
          "thread": 1.4053705497581e+14,
          "threadName": "MainThread"
        },
        {
          "args": [],
          "created": 1464638866.2742,
          "exc_info": null,
          "exc_text": null,
          "filename": "__init__.py",
          "funcName": "create_ec2_cluster",
          "levelname": "INFO",
          "levelno": 20,
          "lineno": 106,
          "module": "__init__",
          "msecs": 274.18994903564,
          "msg": "Created cluster: 574c9d920640fd6e133b4b60",
          "name": "taskflow.574c9d900640fd6e133b4b57",
          "pathname": "\/opt\/hpccloud\/hpccloud\/server\/taskflows\/hpccloud\/taskflow\/utility\/__init__.py",
          "process": 17447,
          "processName": "Worker-1",
          "relativeCreated": 7805320.0340271,
          "thread": 1.4053705497581e+14,
          "threadName": "MainThread"
        }
      ],
      "actions": [],
      "simulation": "574c8aa00640fd3f1a3b379f",
      "stepName": "Simulation",
      "flow": {
        "_accessLevel": 2,
        "_id": "574c9d900640fd6e133b4b57",
        "_modelType": "taskflows",
        "activeTaskCount": 0,
        "log": [
          {
            "args": [],
            "created": 1464638865.5391,
            "exc_info": null,
            "exc_text": null,
            "filename": "__init__.py",
            "funcName": "setup_cluster",
            "levelname": "INFO",
            "levelno": 20,
            "lineno": 142,
            "module": "__init__",
            "msecs": 539.0989780426,
            "msg": "We are creating an EC2 cluster.",
            "name": "taskflow.574c9d900640fd6e133b4b57",
            "pathname": "\/opt\/hpccloud\/hpccloud\/server\/taskflows\/hpccloud\/taskflow\/utility\/__init__.py",
            "process": 17447,
            "processName": "Worker-1",
            "relativeCreated": 7804584.9430561,
            "thread": 1.4053705497581e+14,
            "threadName": "MainThread"
          },
          {
            "args": [],
            "created": 1464638866.2742,
            "exc_info": null,
            "exc_text": null,
            "filename": "__init__.py",
            "funcName": "create_ec2_cluster",
            "levelname": "INFO",
            "levelno": 20,
            "lineno": 106,
            "module": "__init__",
            "msecs": 274.18994903564,
            "msg": "Created cluster: 574c9d920640fd6e133b4b60",
            "name": "taskflow.574c9d900640fd6e133b4b57",
            "pathname": "\/opt\/hpccloud\/hpccloud\/server\/taskflows\/hpccloud\/taskflow\/utility\/__init__.py",
            "process": 17447,
            "processName": "Worker-1",
            "relativeCreated": 7805320.0340271,
            "thread": 1.4053705497581e+14,
            "threadName": "MainThread"
          }
        ],
        "meta": {
          "cluster": {
            "_id": "574c9d920640fd6e133b4b60",
            "config": {
              "launch": {
                "params": {
                  "extra_rules": [
                    {
                      "cidr_ip": "123.201.24.01",
                      "from_port": 9000,
                      "proto": "tcp",
                      "to_port": 9000
                    }
                  ],
                  "gpu": 0,
                  "master_instance_ami": "some-ami",
                  "master_instance_type": "t2.nano",
                  "node_instance_ami": "another-ami",
                  "node_instance_count": 1,
                  "node_instance_type": "t2.nano",
                  "source_cidr_ip": "123.201.24.01"
                },
                "spec": "ec2"
              },
              "scheduler": {
                "type": "sge"
              },
              "ssh": {
                "key": "mysuperstrongsshkeyw0w",
                "user": "someuser"
              }
            },
            "name": "my new node",
            "profileId": "574c8a770640fd3f1a3b377a",
            "status": "created",
            "type": "ec2",
            "userId": "574c841b0640fd3f1a3b3741"
          }
        },
        "status": "terminated",
        "taskFlowClass": "hpccloud.taskflow.pyfr.PyFrTaskFlow"
      },
      "jobMapById": {

      },
      "primaryJob": "pyfr_run",
      "allComplete": true
    }
  },
  "taskflowMapByTaskId": {
    "574c9f350640fd6e13b11e39": "574c9d900640fd6e133b4b57",
    "574c9e460640fd6e13b11e32": "574c9d900640fd6e133b4b57",
    "574c9d910640fd6e133b4b59": "574c9d900640fd6e133b4b57"
  },
  "taskflowMapByJobId": {

  },
  "updateLogs": [

  ]
}
