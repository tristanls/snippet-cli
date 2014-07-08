/*

logstash.js: snippet-cli

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
var fs = require('fs');
var path = require('path');
var SnippetLogstash = require('snippet-logstash');

var logstash = module.exports = clie.command(function (args) {
    var self = this;
    if (args.length < 1) {

        return self.data(logstash.usage).end();
    }

    var configFilePath = path.normalize(args.shift());

    if (!fs.existsSync(configFilePath)) {
        return self.error("File '" + configFilePath + "' not found.").end();
    }

    var snippetLogstash = new SnippetLogstash({
        configFilePath: configFilePath
    });

    snippetLogstash.on('listening', function (stdin) {
        // if there are no listeners for 'listening' event, hook up to stdin
        if (self.listeners('listening').length == 0) {
            process.stdin.setEncoding('utf8');
            process.stdin.on('readable', function () {
                var chunk = process.stdin.read();
                if (chunk != null) {
                    stdin.write(chunk);
                }
            });
            process.stdin.on('end', function () {
                stdin.end();
            });
        }

        self.emit('listening', stdin);
    });

    snippetLogstash.on('exit', function (code, signal) {
        self.data('Logstash process terminated.').end();
    });

    snippetLogstash.on('stdout', function (data) {
        self.data(data.toString('utf8'));
    });
    snippetLogstash.on('stderr', function (data) {
        self.error(data.toString('utf8'));
    });

    snippetLogstash.listen();
});

logstash.usage = [
    "\nUsage: snippet logstash <config-file-path>",
    ""
].join('\n');