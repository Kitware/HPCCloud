## HPCCloud ##

### Goal ###

Web interface to the HPCCloud infrastructure that abstract simulation
environment and resources on which you can run those simulations.

## Installation

```
$ npm install -g hpc-cloud
```

After installing the package you will get one executable **HPCCloud** with
the following set of options.

```
$ HPCCloud

  Usage: HPCCloud [options]

  Options:

    -h, --help                output usage information
    -V, --version             output the version number

>>> FIXME <<<

```

## Development

Using the tonic suite:

```sh
$ git clone https://github.com/Kitware/tonic.git
$ cd tonic
$ npm run global
$ npm install
$ cd tonic-applications/hpc-cloud
```

Using just the repository:

```sh
$ git clone https://github.com/Kitware/HPCCloud.git
$ cd HPCCloud
$ npm run dev:local
$ npm install
```

## Documentation

FIXME: Not yet available

See the [documentation](https://kitware.github.io/hpc-cloud) for a
getting started guide, advanced documentation, and API descriptions.

#### Licensing

**HPCCloud**  is licensed under [Apache 2](LICENSE).

#### Getting Involved

Fork our repository and do great things. At [Kitware](http://www.kitware.com),
we've been contributing to open-source software for 15 years and counting, and
want to make **hpc-cloud** useful to as many people as possible.
