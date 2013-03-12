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
	mixdown = require('mixdown-server'),
	serverConfig = new mixdown.Config(require( './server.json')),
	envConfig = null;


if(argv.help) {
	opt.showHelp();
	return;
}

if(argv.version) {
	console.log(packageJSON.version);
	return;
}

// wire up error event listeners before initializing config.
serverConfig.on('error', function(err) {
	console.info(err);
});

// load env config and apply it
try {
	serverConfig.env( require('./server-' + process.env.MIXDOWN_ENV + '.json') );
}
catch (e) {}

// Create main entry point
var main = mixdown.MainFactory.create({
	packageJSON: require('./package.json'),
	serverConfig: serverConfig
});

// run init on server config.  This calls init on broadway plugins.
serverConfig.init();


// Start the server.
main.start(function(err, main) {

	if (err) {
		if (logger) {
			logger.error('Server did not start');
		}
		else {
			console.log('Server did not start');
		}

		process.exit();
	}
});

// http://nodejs.org/api/http.html#http_http_globalagent
var ga = require("http").globalAgent;
ga.maxSockets = 500;
logger.info('globalAgent.maxSockets: ' + ga.maxSockets);

module.exports = {
	main: main,
	mixdownConfig: serverConfig
};