/*

lines.js: snippet-cli

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

var lines = module.exports = clie.command(function (args) {
    var self = this;
    if (args.length < 1) {

        return self.data(lines.usage).end();
    }

    var file = path.normalize(args.shift());

    if (!fs.existsSync(file)) {
        return self.error("File '" + file + "' not found.").end();
    }

    var lastNewlineIndex = 0;
    var dataBuffer = "";

    var reader = fs.createReadStream(file, {encoding: 'utf8'});

    reader.on('readable', function () {
        var data = reader.read();

        if (dataBuffer.length > 0) {
            data = dataBuffer + data;
            dataBuffer = "";
            lastNewlineIndex = 0;
        }

        for (var i = 0; i < data.length; i++) {
            if (data[i] === '\n') {
                if (i >= 0) {
                    self.data(data.slice(lastNewlineIndex, i));
                }
                lastNewlineIndex = i + 1;
            }
        }
        if (lastNewlineIndex != data.length) {
            dataBuffer = dataBuffer + data.slice(lastNewlineIndex);
        }
    });

    reader.on('end', function () {
        if (dataBuffer) {
            self.data(dataBuffer);
        }
        self.end();
    });
});

lines.usage = [
    "\nUsage: snippet lines <file>",
    ""
].join('\n');