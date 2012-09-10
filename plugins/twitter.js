var request = require('request');

var Twitter = function() {};

Twitter.prototype.attach = function(options) {
    var app = options.app;

    this.twitter = function(options, callback) {
        request(
            {
                uri: 'http://search.twitter.com/search.json',
                qs: options,
                json: true
            },
            function(error, response, body) {
                if (error) {
                    callback(error);
                }
                else {
                    callback(null, body);
                }
            }
        )
    };

};

module.exports = Twitter;