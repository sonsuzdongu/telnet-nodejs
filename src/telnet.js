/*jshint white: true, browser: true, devel: true, evil: true, undef: true, nomen: true, 
eqeqeq: true, plusplus: false, bitwise: true, regexp: true, newcap: true, immed: true */
/*global require:true*/

/**
 * NodeJS powered telnet server for geeky "$ telnet sonsuzdongu.com 1453"
 */
var net = require('net'),
    fs = require('fs'),
    port = 1453,
    arr = [],
    logoFile = "logo.txt",
    footerText, /** will be the last line of logo.txt */
    lineNumber = 0,
    text;

var onNewSocket = function (socket) {
    console.log("Incoming connection");

    var clearTelnetScreen = function () {
        socket.write("\u001B[2J");
    };

    clearTelnetScreen();

    var currentLine = 0;

    /**
     * Write current buffer and clear screen in given interval
     */
    var blink = function (times, callback) {
        var blinkCount = 0;
        var doBlink = function () {
            setTimeout(function () {
                clearTelnetScreen();
                if (blinkCount % 2 === 0) {
                    socket.write(text);
                }
                blinkCount++;

                /**
                 * After blink stop put all text to socket
                 */
                if (blinkCount === times) {
                    socket.write(text);
                    return callback();
                }

                doBlink();

            }, 250);
        };

        doBlink();
    };

    /**
     * Write text in array 'arr' line by line
     */
    var writeLineByLine = function () {
        if (currentLine < lineNumber) {
            socket.write(arr[currentLine] + "\r\n");
            currentLine++;
            setTimeout(writeLineByLine, 200);
        }
        else {
            blink(10, function () {
                socket.end(footerText + '\r\n');
            });
        }
    };

    writeLineByLine();
};

/**
 * Read logo file and start server
 */
fs.readFile(logoFile, 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }

    arr = data.split("\n");
    arr.pop(); /** remove line end entry from array */
    footerText = arr.pop(); /** set last line of text as footer text */
    lineNumber = arr.length;

    text = arr.join('\r\n');

    var server = net.createServer(onNewSocket);
    console.log('Server listening on ' + port);
    server.listen(port);
});
