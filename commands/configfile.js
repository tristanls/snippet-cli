/*

configfile.js: snippet-cli

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

var DEFAULT_FILTER_SECTION = [
    '',
    'grok {',
    '  match => { "message" => "%{COMBINEDAPACHELOG}" }',
    '}',
    'date {',
    '  match => [ "timestamp", "dd/MMM/yyyy:HH:mm:ss Z" ]',
    '}'
].join('\n');

var DEFAULT_INPUT_SECTION = "stdin { }";

var DEFAULT_OUTPUT_SECTION = [
    '',
    'elasticsearch {',
    '  host => localhost',
    '  protocol => http',
    '}',
    'stdout { codec => json }'
].join('\n');

var configfile = module.exports = clie.command(function (args) {
    var self = this;

    var config = "";
    config += "# INPUT SECTION\n",
    config += "input { ";
    config += args.params.input ? args.params.input : DEFAULT_INPUT_SECTION;
    config += " }\n";

    config += "# FILTER SECTION\n",
    config += "filter { ";
    config += args.params.filter ? args.params.filter : DEFAULT_FILTER_SECTION;
    config += " }\n";

    config += "# OUTPUT SECTION\n",
    config += "output { ";
    config += args.params.output ? args.params.output : DEFAULT_OUTPUT_SECTION;
    config += " }\n";

    if (args.params.file) {
        fs.writeFileSync(path.normalize(args.params.file), config);
        self.end();
        return;
    }

    self.data(config);
    self.end();
});

configfile.knownOpts = {
    "file": String,
    "filter": String,
    "input": String,
    "output": String
};

configfile.usage = [
    "\nUsage: snippet configfile [options]",
    "",
    "options:",
    "   --file <path> (The path of config file to write; Default: stdout)",
    "   --filter <filter-section> (The filter section for logstash config file)",
    "   --input <input-section> (The input section for logstash config file)",
    "   --output <output-section> (The output section for logstash config file)",
    ""
].join('\n');
