var Router = require('pipeline-router'),
	Pipeline = require('node-pipeline'),
	path = require('path'),
	browserify = require('browserify'),
	uglify = require('uglify-js');

var BoilerplateRouter = function() {};

/**
* Attaches an autos router plugin to an application.
*
**/ 
BoilerplateRouter.prototype.attach = function (options) {
	var app = options.app;

	/**
	* Initializes the routes for this application
	*
	**/
	this.router = function() {
	    var router = new Router();

	    router.param('query', /(.*)/);
	    
	    // static files
	    router.get(/\/static\/(.*)/, function(req, res) {
	    	
	    	var filePath = req.url.match(/\/static(.*)/)[1];
	    	app.plugins.static(path.normalize(__dirname + '/../static/' + filePath), res, function(error) {
	    		app.plugins.error.notfound(error, res);
	    	});
	    	
	    });

	    // aggregate js
	    router.get('/js/main.js', function(req, res) {
	    	var fullPath = path.normalize(__dirname + '/../static/js/main.js');

	    	var data = app.plugins.browserify(fullPath);
	    	res.writeHead(200, {'Content-Type': 'text/javascript'});
	    	res.end(data);
	    });

	    // twitter
	    router.get('/twitter?:query', function (req, res) {
	    	var pl = Pipeline.create("Twitter Pipeline: " + req.params.query || req.query.q);

	    	pl.use(function(results, next) {
	    		app.plugins.twitter(results[0], next);
	    	}, "Executing Search")

	    	.on('step', function(name, action){
	    		console.log(pl.name + ':' + name);
	    	})

	    	.on('error', function(err) {
	    		app.plugins.error.fail(err, res);
	    	})

	    	.on('end', function(err, results) {
	    		if (!err) {
		    		var data = results[results.length - 1];
		    		app.plugins.render('views/twitter', data, function(err, html) {
	    				if (!err) {
			            	res.writeHead(200, { 'Content-Type': 'text/html' });
							res.end(html);
	    				}
	    			});
		    	}
	    	})

	    	.execute({
	    		q: req.params.query || req.query.q
	    	});
	    });

	    // secret twitter!
	    router.get('/api/twitter?:query', function(req, res) {
	    	var pl = Pipeline.create("Twitter API Pipeline: " + (req.params.query || req.query.q));

	    	pl.use(function(results, next) {
	    		app.plugins.twitter(results[0], next);
	    	}, "Executing Search")

	    	.on('step', function(name, action){
	    		console.log(pl.name + ':' + name);
	    	})

	    	.on('error', function(err) {
	    		app.plugins.error.fail(err, res);
	    	})

	    	.on('end', function(err, results) {
	    		if (!err) {
		    		app.plugins.json(results[results.length - 1], res);
		    	}
	    	})

	    	.execute({
	    		q: req.params.query || req.query.q
	    	});
	    });

	    return router;
	};


};

module.exports = BoilerplateRouter;