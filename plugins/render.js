var _ = require('lodash')
    ,Handlebars = require('broadway-handlebars')
    ,helpers = {
      json: function(obj) {
        return JSON.stringify(obj);
      }
    };

var Render = function() {};

Render.prototype.attach = function(options) {
  var app = options.app
      ,opt = _.cloneDeep(options);
      
  opt.helpers = _.extend(helpers, {
    getUrl: function(route, params) {
        return app.plugins.getUrl ? app.plugins.getUrl(route, params) : 'Url plugin not defined';
    }
  });

  this.use(new Handlebars(), opt);
  this.render.helpers = opt.helpers;
};

module.exports = Render;