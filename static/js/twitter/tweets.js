var $ = jQuery = require('jquery-browserify'),
    Backbone = require('backbone-browserify'),
    Tweet = require('./tweet.js');

var Tweets = Backbone.Collection.extend({
    model: Tweet,
    url: "/api/twitter",
    parse: function(response) {
        // unwrap results
        return response.results;
    }
});

module.exports = Tweets;