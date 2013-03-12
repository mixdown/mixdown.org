var PipelineFactory = require('mixdown-pipelines'),
    Pipeline = require('node-pipeline');

var HelloPipelines = function() {};

HelloPipelines.prototype.attach = function(options) {
    PipelineFactory.prototype.attach.call(this, options);

    var app = options.app,
        that = this;

    // Add your app specific pipelines here
    // this.pipelines.mypipeline = function() {
    //     var pl = Pipeline.create();

    //     // Add steps.
    //     return pl;
    // }
}

module.exports = HelloPipelines;