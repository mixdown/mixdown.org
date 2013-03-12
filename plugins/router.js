var path = require('path'),
	Router = require('pipeline-router');

var HelloRouter = function() {};

/**
* Attaches a router plugin to an application.
*
**/ 
HelloRouter.prototype.attach = function (options) {
	var app = options.app;

	/**
	* Initializes the routes for this application
	*
	**/
	this.router = function() {
	    var router = new Router();

	    router.param('css', /(.*)\.css/);
	    router.param('image', /.*\.jpeg|jpg|gif|png|ico|icns?/);

	    router.get('/', function(req, res) {

	    	// put the querystring on the viewmodel
	    	var viewmodel = { query: req.urlParsed.query };

	    	// render the html
	    	app.plugins.render('index', viewmodel, function(err, html) {

	    		// send to error handler if render problem.
	    		if (err) {
					app.plugins.error.fail(err, res);
					return;
				}
				
				// stream the response.
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.end(html);
	    	});	
	    });
	    
	     router.get('/api', function(req, res) {
	    	// put the querystring on the viewmodel
	    	var viewmodel = { query: req.urlParsed.query };

	    	// stream object.
	    	app.plugins.json(viewmodel, res);
	    });

	    // style sheets files
	    router.get('/css/:css', function(req, res) {

	    	var pl = app.plugins.less.pipeline(),
				file = path.normalize(__dirname + '/../css/' + req.params.css + '.less');

			pl.on('error', function(err) {
				app.plugins.error.fail(err, res);
			})
			.on('end', function(err, results) {
				if (!err) {
					app.plugins.static.stream({
	    				path: req.urlParsed.pathname,
	    				res: res,
	    				content: results[results.length - 1]
	    			}, function(err) {
	    				app.plugins.error.fail(err, res);
	    			});
				}
			})
			.execute({
				file: file
			});
	    });

		// style sheets files
	    router.get('/img/:image', function(req, res) {

	    	// create pipeline instance
	    	var pl = app.plugins.pipelines.static();

	    	// give it a helpful name (this is good practice for logging)
	    	pl.name += ': ' + req.urlParsed.path;

	    	// execute it!
	    	pl.execute({ path: req.urlParsed.pathname.replace('/img', ''), res: res, locations: ['./img'] });
	    });

	    // style sheets files
	    router.get('/favicon.ico', function(req, res) {

	    	// create pipeline instance
	    	var pl = app.plugins.pipelines.static();

	    	// give it a helpful name (this is good practice for logging)
	    	pl.name += ': ' + req.urlParsed.path;

	    	// execute it!
	    	pl.execute({ path: req.urlParsed.pathname, res: res, locations: ['./img'] });
	    });

	    return router;
	};


};

module.exports = HelloRouter;