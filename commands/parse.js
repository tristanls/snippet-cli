/*

parse.js: snippet-cli

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
var CONFIG_FILE_PATH = path.normalize(path.join(TEMP_DIR, 'parse.config'));
var FORMATS_DIR_PATH = path.normalize(path.join(__dirname, '..', 'formats'));

var parse = module.exports = clie.command(function (args) {
    var self = this;

    if (args.length < 2) {

        return self.data(parse.usage).end();
    }

    var formatArg = args.shift();
    var format = path.normalize(path.join(FORMATS_DIR_PATH, formatArg));
    var log = path.normalize(args.shift());

    if (!fs.existsSync(format)) {
        self.error("Format '" + formatArg + "' not found at " + format + ".")
            .end();
        return;
    }

    if (!fs.existsSync(log)) {
        return self.error("File '" + log + "' not found.").end();
    }

    var emitter = new events.EventEmitter();

    var snippet = require('../index.js');

    var config;
    var logstashTerminated = false;

    var configfileArgs = [];
    configfileArgs.params = {
        filter: fs.readFileSync(format, 'utf8')
    };
    var configfile = snippet.commands.configfile(configfileArgs);

    configfile.on('data', function (data) {
        config = data;
    });
    configfile.on('end', function () {
        emitter.emit('configfile');
    });

    emitter.on('configfile', function () {
        self.data('Using configuration:\n\n' + config);
        fs.writeFileSync(CONFIG_FILE_PATH, config);
        self.data('Wrote configuration to ' + CONFIG_FILE_PATH + '\n');

        var elasticsearchArgs = [];
        elasticsearchArgs.params = {};
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
    });

    emitter.on('elasticsearch', function () {
        var logstashArgs = [CONFIG_FILE_PATH];
        logstashArgs.params = {};
        self.data('Starting Logstash process...');
        var logstash = snippet.commands.logstash(logstashArgs);
        logstash.on('listening', function (stdin) {
            self.data('Logstash process is listening...');
            emitter.emit('logstash', stdin);
        });
        // logstash.on('data', function (data) {
        //     self.data(data);
        // });
        logstash.on('error', function (error) {
            self.error(error);
        });
        logstash.on('end', function () {
            logstashTerminated = true;
            self.data('Logstash process terminated.');
        });
    });

    emitter.on('logstash', function (stdin) {
        var lines = snippet.commands.lines([log]);
        var count = 0;
        lines.on('data', function (data) {
            if (!logstashTerminated) {
                stdin.write(data);
                stdin.write('\n');
                count++;
                if ((count % 10000) == 0) {
                    self.data('Snippet pushed ' + count + ' lines to Logstash.');
                }
            }
        });
        lines.on('error', function (error) {
            self.error(error);
        });
        lines.on('end', function () {
            self.data('Snippet pushed ' + count + ' lines to Logstash.');
            stdin.end();
        });
    });

    emitter.on('logstash', function () {
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

parse.knownOpts = {
    "filter": String
};

parse.usage = [
    "\nUsage: snippet parse <format> <log-file>",
    "",
    "arguments:",
    "<format>: Name of a file in 'formats'(" + FORMATS_DIR_PATH + ") directory.",
    "          Available formats are " + fs.readdirSync(FORMATS_DIR_PATH),
    "<log-file>: The log file to be parsed.",
    ""
].join('\n');