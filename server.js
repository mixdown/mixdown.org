var opt = require('optimist'),
	packageJSON = require('./package.json'),
	argv = opt
		.alias('h', 'help')
		.alias('?', 'help')
		.describe('help', 'Display help')
		.usage('Starts ' + packageJSON.name + ' framework for serving multiple sites.\n\nVersion: ' + packageJSON.version + '\nAuthor: ' + packageJSON.author)
		.alias('v', 'version')
		.describe('version', 'Display Mixdown Boilerplate version.')
		.argv,
	// Logger = require("logger.js"),
	mixdown = require('mixdown-server'),
    serverConfig = new mixdown.Config();

if(argv.help) {
	opt.showHelp();
	return;
}

if(argv.version) {
	console.log(packageJSON.version);
	return;
}

global.logger = {
	critical: console.error,
	info: console.info,
	error: console.error,
	debug: console.info
}

serverConfig.on('error', function(err) {
	logger.error(err);
})

serverConfig.init(require("./server.json"));

var createServer = function() {
	// start server.  Sets up server, port, and starts the app.
	var server = new mixdown.Server(serverConfig);

	server.start(function(err) {
		if (err) {
			logger.critical("Could not start server.  Stopping process.", err);
			process.exit();
		}
		else {
			logger.info("Server started successfully.", serverConfig);
		}
	});
};

// Start cluster.

var children = {};

if(serverConfig.cluster && serverConfig.cluster.on){
	logger.debug("Using cluster");
	
	var numCPUs = serverConfig.cluster.workers || require('os').cpus().length,
		cluster	= require('cluster');
	
	if(cluster.isMaster){
		logger.debug("Starting master with " + numCPUs + " CPUs");

		// spawn n workers
		for (var i = 0; i < numCPUs; i++) {
			var child = cluster.fork();
			children[child.process.pid] = child;
		}

		// Add application kill signals.
		var signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
		_.each(signals, function(sig) {

			process.on(sig, function() {

				_.each(children, function(child) {
					child.destroy();  // send suicide signal
				});

				// create function to check that all workers are dead.
				var checkExit = function() {
					if (_.keys(children).length == 0) {
						process.exit();
					}
					else {
						process.nextTick(checkExit);   // keep polling for safe shutdown.
					}
				};

				// poll the master and exit when children are all gone.
				process.nextTick(checkExit);
				
			});

		});

		cluster.on('exit', function(worker) {
			logger.error('Worker exited unexpectedly. Spawning new worker', worker);

			// remove the child from the tracked running list..
			delete children[worker.process.pid];

			// if it purposely destroyed itself, then do no re-spawn.  
			// Otherwise, it was killed for some external reason and should create a new child in the pool.
			if (!worker.suicide) {

				// spawn new child
				var child = cluster.fork();
				children[child.process.pid] = child;
			}
			 
		});

	} else {
		logger.debug("Worker ID", process.env.NODE_WORKER_ID);
		server = createServer();
	}
	
} 
else {
	server = createServer();
}


