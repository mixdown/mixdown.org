var $ = jQuery = require('jquery-browserify'),
    Backbone = require('backbone-browserify'),
    Tweets = require('./tweets.js'),
    TweetView = require('./tweetview.js');

/**
 * Main application entry point. Coordinates user interactions, etc.
 **/
var TwitterView = Backbone.View.extend({
    events: {
        "click #getTwitters": "fetchTweets"
    },

    initialize: function(options) {
        this.tweets = new Tweets();
        this.$tweetspecifyificator = $("#q");
    },

    fetchTweets: function() {
        var data = {
                q: this.$tweetspecifyificator.val()
            },
            self = this;

        this.tweets.fetch({
            success: function(collection, response) {
                self.render();
            },
            error: function(collection, response) {
                console.log("error", collection, response);
            },
            data: data
        });
    },
    
    render: function() {
        console.log("rendering tweets");
        var container = this.$el.find("#tweets");
        
        container.empty();

        this.tweets.each(function(tweet) {
            var tweetView = new TweetView({model: tweet});
            tweetView.render();
            container.append(tweetView.$el);
        });
    }
});


module.exports = TwitterView;