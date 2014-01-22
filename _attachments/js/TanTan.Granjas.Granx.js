/*global TodoMVC */
'use strict';

TanTan.module('Granjas', function (Granjas, App, Backbone, Marionette, $, _) {

    Granjas.GranjaDoc = Backbone.Model.extend({
        defaults: {
            tipo: 'granja',
            nombre: '',
            razonsocial: '',
            contacto: '',
            direccion: '',
            localidad: '',
            municipio: '',
            estado: ''
        }
    });

    Granjas.GranjaCol = Backbone.Collection.extend({
        url: "/granjas",
        db: {
            view: "granjas"
        },
        model: Granjas.GranjaDoc
    });

    Granjas.GranjaInfo = Marionette.ItemView.extend({
        template: "#template-granja-info",
        className: "col-md-12"
    });

    Granjas.GranjaMain = Marionette.ItemView.extend({
        template: "#template-granja-main",
        className: "col-md-12"
    });

    Granjas.GranjaTools = Marionette.ItemView.extend({
        template: "#template-granja-tools",
        className: "col-md-12",
        model: Granjas.GranjaDoc,
        ui: {
            "editar": ".btn-editar",
            "nuevo": ".btn-nuevo"
        //},
        //triggers: {
        //    "click @ui.editar": "edit:granja",
        //    "click @ui.nuevo": "nuevo:estanque"
        //},
        //editGranja: function (e) {
        //},
        //nuevoEstanque: function (e) {
        }
    });

    Granjas.GranjaView = Marionette.ItemView.extend({
        template: "#template-granja-link",
        className: "thumbnail",
        model: Granjas.GranjaDoc
    });

    Granjas.GranjaDocView = Marionette.Layout.extend({
        template: "#template-granja-doc",
        //className: "thumbnail",
        regions: {
            header: "#granja-header",
            tools: "#granja-tools",
            subnav: "#granja-subnav",
            content: "#granja-content"
        },
        onRender: function () {
            if (_.isUndefined(this.model)) {
                console.log("error, no granja model on granjadocview");
            } else {
                this.showDoc(this.model);
            }
        },
        editDoc: function (model) {
            this.header.show(new Granjas.GranjaMain({model: model}));
            this.subnav.close();
            this.tools.show(new Granjas.GranjaTools({model: model}));
            this.content.show(new Granjas.GranjaEdit({model: model}));
        },
        showDoc: function (model) {
            this.header.show(new Granjas.GranjaMain({model: model}));
            this.subnav.show(new Granjas.EstanquesNavPills({collection: model.nodos}));
            this.tools.show(new Granjas.GranjaTools({model: model}));
            this.content.show(new Granjas.GranjaInfo({model: model}));
        }
    });

    Granjas.GranjaEditForm = Marionette.ItemView.extend({
        template: "#template-granja-edit",
        tagName: "form",
        className: "form-horizontal col-md-12",
        //model: Granjas.GranjaDoc,
        ui: {
            "save": "button[type=submit]",
            "reset": "button[type=reset]"
        },
        triggers: {
            "click @ui.save": "save:form",
            "click @ui.reset": "reset:form"
        },
        initialize: function () {
            this.on("save:form", function (args) {
                console.log('saving granja ARGS', args);
                var form_data = this.$el.serializeJSON();
                console.log('saving granja FORM DATA', form_data);
                if (args.model) {
                    var mod = args.model;
                    mod.set(form_data);
                    if (mod.isNew()) {
                        App.granjas.add(mod);
                    }
                    mod.save();
                }
            });
        }
    });

    Granjas.GranjasList = Marionette.CompositeView.extend({
        template: "#template-granjas-list",
        className: "thumbnail",
        itemView: Granjas.GranjaView,
        itemViewContainer: "#listado"
    });

});
