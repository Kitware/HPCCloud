export default [
  {
    "_id": "a1",
    "config": {
      "launch": {
        "params": {
          "extra_rules": [
            {
              "cidr_ip": "100",
              "from_port": 9000,
              "proto": "tcp",
              "to_port": 9000
            }
          ],
          "gpu": 0,
          "master_instance_ami": "ami-wow",
          "master_instance_type": "t2.nano",
          "node_instance_ami": "ami-wow",
          "node_instance_count": 0,
          "node_instance_type": "t2.nano",
          "source_cidr_ip": "100"
        },
        "spec": "ec2"
      },
      "scheduler": {
        "type": "sge"
      },
    },
    "name": "0001",
    "profileId": "p1",
    "status": "running",
    "type": "ec2",
  },
  {
    "_id": "b2",
    "config": {
      "host": "100",
      "launch": {
        "params": {
          "extra_rules": [
            {
              "cidr_ip": "100",
              "from_port": 9000,
              "proto": "tcp",
              "to_port": 9000
            }
          ],
          "gpu": 0,
          "master_instance_ami": "ami-wow",
          "master_instance_type": "t2.nano",
          "node_instance_ami": "ami-wow",
          "node_instance_count": 1,
          "node_instance_type": "t2.nano",
          "source_cidr_ip": "100"
        },
        "spec": "ec2"
      },
      "scheduler": {
        "type": "sge"
      },
    },
    "name": "my new node",
    "profileId": "q2",
    "status": "running",
    "type": "ec2",
  },
]
