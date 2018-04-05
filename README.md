# HPCCloud

[![codecov.io](https://codecov.io/github/Kitware/HPCCloud/coverage.svg?branch=master)](https://codecov.io/github/Kitware/HPCCloud?branch=master)
[![Build Status](https://travis-ci.org/Kitware/HPCCloud.svg?branch=master)](https://travis-ci.org/Kitware/HPCCloud)
[![Dependency Status](https://david-dm.org/kitware/hpc-cloud.svg)](https://david-dm.org/kitware/hpc-cloud)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
![npm-download](https://img.shields.io/npm/dm/hpc-cloud.svg)
![npm-version-requirement](https://img.shields.io/badge/npm-5-brightgreen.svg)
![node-version-requirement](https://img.shields.io/badge/node-8-brightgreen.svg)

### Goal

Web interface to the HPCCloud infrastructure that abstract simulation
environment and resources on which you can run those simulations.

## Installation

Observe the instructions for [HPCCloud deploy](https://github.com/Kitware/HPCCloud-deploy);

## Development

```sh
$ git clone https://github.com/Kitware/HPCCloud.git
$ cd HPCCloud
$ npm install
$ npm start
```

## Troubleshooting

(With the vm running from HPCCloud-Deploy)
```sh
$ vagrant ssh
$ sudo -iu hpccloud
```

### Fixing celery Girder URL

```sh
$ vi /opt/hpccloud/cumulus/cumulus/conf/config.json
  +-> Fix host to be localhost
  +-> baseUrl: "http://localhost:8080/api/v1",
$ sudo service celeryd restart
```

## Documentation

See the [documentation](docs/README.md) in this repository for a
getting started guide, advanced documentation, and workflow descriptions.

## Licensing

**HPCCloud** is licensed under [Apache 2](LICENSE).

## Getting Involved

Fork our repository and do great things. At [Kitware](http://www.kitware.com),
we've been contributing to open-source software for 15 years and counting, and we
want to make **hpc-cloud** useful to as many people as possible.
