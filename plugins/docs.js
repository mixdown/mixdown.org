var _ = require('lodash'),
    cradle = require('cradle');

var EventsPlugin = function() {}

EventsPlugin.prototype.attach = function(options) {
    var app = options.app,
        connection = new(cradle.Connection)('https://' + options.host, 443, {
                    cache: false,
                    raw: false,
                    auth: options.auth
            }),
            db = connection.database(options.database);

    this.g2pEvents = {
        
        // assign the couch providers to the api object.
        db: db,
        connection: connection,

        // get by id.
        get: function(id, callback) {
            db.get(id, function(err, doc) {
                if (err) {
                    logger.error("Database error: " + err);
                    callback(err, null);
                    return;
                }
                
                callback(null, doc);
            });
        },

        /** Use this to update seats sold. **/
        update: function(id, fields, callback) {
            db.get(id, function(err, doc) {
                _.extend(fields || {}, { _rev: doc._rev });
                db.merge(id, fields, callback);
            });
        }
    };
};

module.exports = EventsPlugin;