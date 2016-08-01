# Getting Started

The HPCCloud stack is deployed using [Ansible](https://www.ansible.com/). Our [deployment](https://github.com/Kitware/HPCCloud-deploy) repository contains the playbooks for the deployment. The repository also contains support for Vagrant which allows the full stack to be deployed to a virtual machine. This is quickest way to get up and running with HPCCloud. The deployment is perfect for evaluation or testing, however, this is not recommended in production as everything is deployed to a single machine.

The Vagrant deployment has the following prerequistes:

* [VirtualBox  >= 5.0](https://www.virtualbox.org/wiki/Downloads)
* [Ansible  >= 2.1](http://docs.ansible.com/ansible/intro_installation.html)
* [Vagrant >= 1.8](https://www.vagrantup.com/docs/installation/)

Once the prerequistes have been installed follow the following steps to set up the virtual machine.

1. Clone the deployment repository.
```sh
git clone git@github.com:Kitware/HPCCloud-deploy.git HPCCloud
```
2. Move into the repository directory.
```sh
cd HPCCloud
```
3. Execute vagrant up.
```sh
DEMO=1 vagrant up
```

Once the vagrant provisioning process it complete your VM will up and running. You can access the HPCCloud application by visting [http://localhost:8080](http://localhost:8080)

## Development: 

With the environment variable `DEVELOPMENT=1`, in your HPC-Cloud directory run:

```
$ npm start
```

This will run a webpack-dev server on `localhost:9999` which will reflect local changes to HPC-Cloud as you make them.
