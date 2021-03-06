// ReferenceView
// -------------
// MSS syntax reference display in a drawer.
var ReferenceView = DrawerView.extend({
    events: _.extend({
        'click .reference-links a': 'show'
    }, DrawerView.prototype.events),
    initialize: function (options) {
        _.bindAll(this, 'show');
        var symbolizers = _.map(
            window.app.reference.toJSON().symbolizers,
            function(properties, symbolizer) {
                return {
                    properties: _.map(
                        properties,
                        function(property, name) {
                            return _.extend({
                                type: _.isArray(property.type)
                                    ? property.type.join(', ')
                                    : property.type
                            }, property);
                        }
                    ),
                    symbolizer: symbolizer
                };
            }
        );
        this.options = {
            title: 'Reference',
            content: ich.ReferenceView({ symbolizers: symbolizers }, true)
        };
        DrawerView.prototype.initialize.call(this, options);
    },
    show: function(event) {
        var link = $(event.target);
        var section = link.attr('href').split('#').pop();
        this.$('.reference-links a.active').removeClass('active');
        this.$('.reference-section.active').removeClass('active');
        link.addClass('active');
        this.$('#' + section).addClass('active');
        return false;
    }
});
