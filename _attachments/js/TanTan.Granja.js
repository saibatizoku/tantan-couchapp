/*global TodoMVC */
'use strict';

TanTan.module('Vistas', function (Vistas, App, Backbone, Marionette, $, _) {

    Vistas.GranjaPill = Marionette.ItemView.extend({
        template: "#template-granja-pill",
        tagName: 'li',
        ui: {
            'link': '>a'
        },
        triggers: {
            'click >a': 'pill:click'
        }
    });

    Vistas.GranjaContent = Marionette.CompositeView.extend({
        template: "#template-granja-content",
        className: 'panel-group',
        itemView: Vistas.GranjaPill,
        itemViewContainer: "#listado-estanques",
        onRender: function () {

        }
    });

    Vistas.GranjaMain = Marionette.Layout.extend({
        template: "#template-granja-main",
        className: 'row',
        regions: {
            side: "#side",
            content: "#content"
        }
    });

});
