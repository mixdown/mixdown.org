var $ = jQuery = require('jquery-browserify'),
    Backbone = require('backbone-browserify'),
    _ = require('lodash');

var template = '<img src="<%= profile_image_url %>"><strong><%= from_user %>:</strong><%= text %>';

var TweetView = Backbone.View.extend({
    render: function() {
        this.$el.html(_.template(template, this.model.toJSON()));
    }
});

module.exports = TweetView;