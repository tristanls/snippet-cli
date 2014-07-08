/*

elasticsearch.js: snippet-cli

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
var SnippetElasticsearch = require('snippet-elasticsearch');

var elasticsearch = module.exports = clie.command(function (args) {
    var self = this;

    var snippetElasticsearch = new SnippetElasticsearch({
        path : {
            data: args.params.data,
            logs: args.params.logs
        },
        pidFile: args.params.pidFile
    });

    self.data('Elasticsearch logs: ' + snippetElasticsearch.path.logs);
    self.data('Elasticsearch data: ' + snippetElasticsearch.path.data);

    snippetElasticsearch.on('listening', function () {
        self.emit('listening');
        self.data('Elasticsearch server listening...');
    });

    snippetElasticsearch.on('close', function () {
        return self.data('Elasticsearch server terminated.').end();
    });

    snippetElasticsearch.on('stdout', function (data) {
        self.data(data.toString('utf8'));
    });
    snippetElasticsearch.on('stderr', function (data) {
        self.error(data.toString('utf8'));
    });

    snippetElasticsearch.listen();
});

elasticsearch.knownOpts = {
    "data": String,
    "logs": String,
    "pidFile": String
};

elasticsearch.usage = [
    "\nUsage: snippet elasticsearch [options]",
    "",
    "options:",
    "   --data <path> (Default: TEMP_DIR/snippet/elasticsearch/logs)",
    "   --logs <path> (Default: TEMP_DIR/snippet/elasticsearch/data)",
    "   --pidFile <path> (Default: TEMP_DIR/snippet/elasticsearch/elasticsearch.pid)"
].join('\n');