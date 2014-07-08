# snippet-cli

_Stability: 1 - [Experimental](https://github.com/tristanls/stability-index#stability-1---experimental)_

[![NPM version](https://badge.fury.io/js/snippet-cli.png)](http://npmjs.org/package/snippet-cli)

Snippet command-line interface for parsing logs and pushing them through a local [Logstash](http://logstash.net/) -> [Elasticsearch](http://www.elasticsearch.org/) -> [Kibana](http://www.elasticsearch.org/overview/kibana/) pipeline.

## Prerequisites

`snippet` requires Java to be installed. It should be a version sufficient to run Elasticsearch and Logstash.

## Installation

```
npm install -g snippet-cli
```

## Usage

```
~$ snippet -h
Usage: snippet <command>

where <command> is one of:
   configfile, elasticsearch, kibana, lines, logstash, parse

snippet <command> -h    quick help on <command>
```

For example:

```
~$ snippet parse combined-apache-log my.log
```