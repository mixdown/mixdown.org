var path = require('path'),
	Router = require('pipeline-router');

var HelloRouter = function() {};

/**
* Attaches a router plugin to an application.
*
**/ 
HelloRouter.prototype.attach = function (options) {
	var app = options.app
		,routeTable = options.routeTable;

	this.getUrl = function(route, params) {
		var path = '';

		if (route === 'docs') {
			var docid = _.isObject(params) ? params.docid : params;
			path = routeTable[route].replace(':docid', docid);
		}
		else {
			path = routeTable[route];
		}

		return path;
	};

	/**
	* Initializes the routes for this application
	*
	**/
	this.router = function() {
    var router = new Router();

    router.param('css', /(.*)\.css/);
    router.param('image', /.*\.jpeg|jpg|gif|png|ico|icns?/);

    router.get(routeTable.home, function(req, res) {

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

    router.get(/.*/, function(req, res) {
    	app.plugins.error.notfound(new Error('This page is not found.'), res);
    });

    return router;
	};


};

module.exports = HelloRouter;