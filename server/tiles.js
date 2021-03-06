// GET endpoint for TMS tile image requests. Uses `tilelive.js` Tile API.
//
// - `:id` String, project model id.
// - `:z` Number, zoom level of the tile requested.
// - `:x` Number, x coordinate of the tile requested.
// - `:y` Number, y coordinate of the tile requested.
// - `*` String, file format of the tile requested, e.g. `png`, `jpeg`.
var _ = require('underscore'),
    url = require('url'),
    path = require('path'),
    Tile = require('tilelive').Tile,
    models = require('models-server');

module.exports = function(app, settings) {
    // Route middleware. Load a project model.
    var loadProject = function(req, res, next) {
        var model = models.cache.get('Project', req.param('id'));
        model.fetch({
            success: function(model, resp) {
                res.project = model;
                next();
            },
            error: function(model, resp) {
                next(new Error('Invalid model'));
            }
        });
    };

    app.get('/1.0.0/:id/:z/:x/:y.*', loadProject, function(req, res, next) {
        try {
            var options = {
                scheme: 'tms',
                mapfile: res.project.mapfile_64(req),
                xyz: [req.param('x'), req.param('y'), req.param('z')],
                format: req.params[0],
                mapfile_dir: path.join(settings.mapfile_dir)
            };
            var tile = new Tile(options);
        } catch (err) {
            res.send('Tile invalid: ' + err.message);
        }

        tile.render(function(err, data) {
            if (!err) {
                // Using `apply()` here allows the tile rendering function to
                // send custom headers without access to the request object.
                data[1] = _.extend(settings.header_defaults, data[1]);
                res.send.apply(res, data);
            } else if (typeof err === 'object' && err.length) {
                err = _.pluck(err, 'message').join("\n");
                res.send('Error rendering image:\n' + err, 500);
            } else {
                res.send('Error rendering image:\n' + err, 500);
            }
        });
    });
};
