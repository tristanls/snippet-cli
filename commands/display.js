/*

display.js: snippet-cli

The MIT License (MIT)

Copyright (c) 2014 Tristan Slominski

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/

"use strict";

var clie = require('clie');
var events = require('events');
var fs = require('fs');
var path = require('path');
var shelljs = require('shelljs');

var TEMP_DIR = shelljs.tempdir();

var display = module.exports = clie.command(function (args) {
    var self = this;

    var emitter = new events.EventEmitter();

    var snippet = require('../index.js');

    var elasticsearchArgs = [];
    elasticsearchArgs.params = {
        data: args.params.data
    };
    self.data('Starting Elasticsearch server...');
    var elasticsearch = snippet.commands.elasticsearch(elasticsearchArgs);
    elasticsearch.on('listening', function () {
        self.data('Elasticsearch server is listening...');
        emitter.emit('elasticsearch');
    });
    elasticsearch.on('data', function (data) {
        self.data(data);
    });
    elasticsearch.on('error', function (error) {
        self.error(error);
    });
    elasticsearch.on('end', function () {
        self.data('Elasticsearch server terminated.');
    });

    emitter.on('elasticsearch', function () {
        var kibanaArgs = [];
        kibanaArgs.params = {};
        var kibana = snippet.commands.kibana(kibanaArgs);
        kibana.on('listening', function (hostname, port) {
            self.data('Kibana server is listening at ' + hostname + ':' + port);
        });
        kibana.on('end', function () {
            self.data('Kibana server terminated.');
        });
    });
});

display.knownOpts = {
    "data": String
};

display.usage = [
    "\nUsage: snippet display [options]",
    "",
    "options:",
    "   --data <path> (Default: TEMP_DIR/snippet/elasticsearch/data)",
    ""
].join('\n');
