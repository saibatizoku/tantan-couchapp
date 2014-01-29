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
        tagName: "a",
        className: "list-group-item",
        model: Granjas.GranjaDoc,
        initialize: function () {
            this.$el.attr('href', '#granjas/'+this.model.id);
        },
        events: {
            "click": "granjaClick"
        },
        granjaClick: function (e) {
            var args = {
                view: this,
                model: this.model
            };
            App.vent.trigger("granja:click", args);
        }
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
        initialize: function () {
            this.ecol = this.getEstanques();
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
            this.subnav.show(new Granjas.EstanquesNavPills({collection: this.ecol}));
            this.tools.show(new Granjas.GranjaTools({model: model}));
            //this.content.show(new Granjas.GranjaInfo({model: model}));
        },
        getEstanques: function () {
            var gid = this.model.id;
            var ecol = new Granjas.EstanquesCol();
            //var ecol = new Granjas.EstnxCol();
            ecol.on('add', function (model, collection, options) {
                var alim = new Granjas.OperacionesCol();
                var cali = new Granjas.OperacionesCol();
                var biom = new Granjas.OperacionesCol();
                var eid = model.id;
                alim.fetch({
                    startkey: [eid,"alimentacion"],
                    endkey: [eid,"alimentacion0"],
                    limit: 10
                });
                model.alimentacion = alim;
                cali.fetch({
                    startkey: [eid,"muestra"],
                    endkey: [eid,"muestra0"],
                    limit: 10
                });
                biom.fetch({
                    startkey: [eid,"biometria"],
                    endkey: [eid,"biometria0"],
                    limit: 10
                });
                model.biometria = biom;
            });
            ecol.fetch({key: [gid,1]});
            //ecol.db.gid = gid;
            //console.log("ECOL.DB", ecol.db);
            //ecol.fetch({gid: gid});
            return ecol;
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
        itemViewContainer: "#listado",
        initialize: function () {
            this.listenTo(App.vent, "granja:click", this.granjaClicked);
            this.listenTo(this.collection, 'sync', function (collection, resp, options) {
                console.log('granjas synced', options);
                App.vent.trigger('granjas:loaded', collection);
            });
        },
        granjaClicked: function (args) {
            this.$(".list-group-item").removeClass('active');
            args.view.$el.addClass('active');
        }
    });

});
