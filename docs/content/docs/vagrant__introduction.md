title: Vagrant
---

Relying on Vagrant for deploying the HPCCloud infrastructure's is great but we can't assuming that it will always work and additional interaction with the infrastructure may be required. Therefore, that documentation aims to provide various `how to` with Vagrant and HPCCloud deployment.

## Setting-up HPCCloud for development

The very first time you may want to run the following commands.

```sh
$ mkdir HPCCloud
$ cd HPCCloud

$ git clone https://github.com/Kitware/HPCCloud.git
$ git clone https://github.com/Kitware/HPCCloud-deploy.git
$ git clone https://github.com/Kitware/cumulus.git
$ git clone https://github.com/Kitware/girder.git

$ ln -s HPCCloud hpccloud

$ virtualenv python
$ source ./python/bin/activate
$ pip install -r HPCCloud/requirements.txt
$ pip install -r HPCCloud-deploy/requirements.txt

$ cd HPCCloud-deploy
$ DEVELOPMENT=1 vagrant up
```

Then you can simply start again the Virtual Machine with the following commands.

```sh
$ cd HPCCloud

$ source ./python/bin/activate

$ cd HPCCloud-deploy
$ DEVELOPMENT=1 vagrant up
```

In order to fully stop the Virtual Machine, you can run the following commands.


```sh
$ cd HPCCloud

$ source ./python/bin/activate

$ cd HPCCloud-deploy
$ vagrant halt
```

## SSH to Virtual Machine

```sh
$ cd HPCCloud

$ source ./python/bin/activate

$ cd HPCCloud-deploy
$ vagrant ssh
$ sudo -iu hpccloud
$ cd /opt/hpccloud
```

Once logged to the VM, services can be stoped and restarted with the following commands

```sh
sudo service girder [stop/start/restart]
sudo service celeryd [stop/start/restart]
```

## Fixing invalid Hostname

When HPCCloud run jobs on a remote cluster, that cluster needs to contact back the HPCCloud server and therefore the proper information needs to be given to those cluster.

This can be adjusted in the following file (replace: HOSTNAME_OR_VALID_IP by the proper value):

```js /opt/hpccloud/cumulus/cumulus/conf/config.json
{
  "girder": {
    "baseUrl": "http://HOSTNAME_OR_VALID_IP:8080/api/v1",
    "user": "cumulus",
    "group": "cumulus"
  },
  "moabReader": {
    "pluginPath": "/opt/hpccloud/moabreader/build/libvtkCmbMoabReaderPlugin.so"
  },
    "ssh": {
    "keyStore": "/opt/hpccloud/keys"
  },

  "amis": {
  },
  "taskflow": {
    "path": ["/opt/hpccloud/hpccloud/server/taskflows"]
  }
}
```
