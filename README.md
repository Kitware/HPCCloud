# HPC Cloud

## Related/Companion Repositories

- [HPC Cloud VM deploy](https://github.com/Kitware/HPCCloud-deploy)*
- [Cumulus](https://github.com/Kitware/cumulus)
- [Girder](https://github.com/girder/girder)

\* most important

## Installation
Consult the setup instructions on the README of [HPCCloud-deploy repository](https://github.com/Kitware/HPCCloud-deploy)

## Configuration

Install system wide the following application

    $ brew install node
    $ npm install -g gulp

Project specific configuration and setup after cloning this repository

	$ cd HPCCloud/
    $ npm install
    $ gulp watch

If you're not using the VM you can use this NGINX configuration file to blend Girder with server running from `gulp serve` into http://localhost:8888/

Comments:
    By default, the configuration file is named nginx.conf and placed
    in the directory /usr/local/nginx/conf, /etc/nginx, or /usr/local/etc/nginx/nginx.conf.

    | worker_processes  1;
    |
    | events {
    |     worker_connections  1024;
    | }
    |
    | http {
    |     include       mime.types;
    |     default_type  application/octet-stream;
    |
    |     sendfile        on;
    |
    |     keepalive_timeout  65;
    |
    |     server {
    |         listen       8888;
    |         server_name  localhost;
    |
    |         client_max_body_size 32M;
    |
    |         location / {
    |             proxy_pass http://localhost:3000;
    |         }
    |
    |         location /paraview {
    |             proxy_pass http://localhost:8889/paraview;
    |         }
    |
    |         location /api/v1 {
    |             proxy_pass http://localhost:8080/api/v1;
    |         }
    |
    |         location /browser-sync {
    |             proxy_pass http://localhost:3000/browser-sync;
    |             proxy_http_version 1.1;
    |             proxy_set_header Upgrade $http_upgrade;
    |             proxy_set_header Connection "upgrade";
    |         }
    |
    |         error_page   500 502 503 504  /50x.html;
    |         location = /50x.html {
    |             root   html;
    |         }
    |     }
    | }

## Girder initial structure

OSX Side notes:

    $ mkdir -p girder-data/asset-store girder-data/mongo-db
    $ cd girder-data
    $ sudo easy_install pip
    $ sudo pip install virtualenv
    $ virtualenv cmb-web
    $ source cmb-web/bin/activate

    emacs start-girder.sh

    | mongod --dbpath /.../girder-data/mongo-db &
    | cd /.../Girder/src
    | /.../girder-data/cmb-web/bin/python -m girder

    $ cd [...]/Girder
    $ git clone https://github.com/girder/girder.git src
    $ cd src
    $ export PKG_CONFIG_PATH=/usr/local/Cellar/libffi/3.0.13/lib/pkgconfig
    $ pip install -r requirements.txt
    $ npm install -g grunt-cli
    $ npm install
    $ grunt init
    $ grunt

Using the Girder interface a set of users, collections, folders and groups
should be created.

For development purpose 3 users should be created:

    - User 001:
        Login       : user001
        Password    : user001001
        E-Mail      : user001@nowhere.com
        First Name  : User
        Last Name   : 001
    - User 002:
        Login       : user002
        Password    : user002002
        E-Mail      : user002@nowhere.com
        First Name  : User
        Last Name   : 002
    - User 003:
        Login       : user003
        Password    : user003003
        E-Mail      : user003@nowhere.com
        First Name  : User
        Last Name   : 003

Here is an example hierarchy that can be used:

    (Collections)
      - hydra-ne (can-edit: hydra-ne-members)
          + (Folders)
              - user001 (can-edit: user001)
              - user002 (can-edit: user002)
              - Core simulation team (can-edit: user001, user002)
              - Multi-scale simulation team (can-edit: user001)
      - mpas-ocean (can-edit: mpas-ocean-members)
          + (Folders)
              - user001 (can-edit: user001)
              - user003 (can-edit: user003)
              - Oceanic climate (can-edit: user001, user003)
              - El Nino (can-edit: user003)

    (Groups)
      - hydra-ne-members: user001, user002
      - mpas-ocean-members: user001, user003

### Comments:
The name of the collections should be part of the file {repo}/src/workflows.json


