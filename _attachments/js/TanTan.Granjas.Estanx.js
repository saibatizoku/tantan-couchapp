/*global TodoMVC */
'use strict';

TanTan.module('Granjas', function (Granjas, App, Backbone, Marionette, $, _) {

    Granjas.EstanqueDoc = Backbone.Model.extend({
        defaults: {
            tipo: "estanque",
            nombre: '',
            material: '',
            forma: '',
            dimensiones: '',
            volumen: ''
        }

    });

    Granjas.EstanquesCol = Backbone.Collection.extend({
        url: "/estanques",
        db: {
            view: "estanques"
        },
        model: Granjas.EstanqueDoc
    });

    Granjas.OperacionDoc = Backbone.Model.extend({
    });

    Granjas.OperacionesCol = Backbone.Collection.extend({
        url: "/operaciones",
        db: {
            view: "vista-estanque-tipo"
        },
        model: Granjas.OperacionDoc
    });

    Granjas.EstanqueView = Marionette.Layout.extend({
        template: "#template-estx-doc",
        model: Granjas.EstanqueDoc,
        regions: {
            alimentacion: "#nav-alimentacion",
            calidad: "#nav-calidad",
            biometria: "#nav-biometria"
        },
        ui: {
            "borrar": ".boton-borrar"
        },
        triggers: {
            "click @ui.borrar": "borrar:estanque"
        },
        onRender: function () {
            var eid = this.model.id;
            console.log("estank view id", eid, this.model.alimentacion);
            this.alimentacion.show(new Granjas.AlimentacionView({model: this.model.alimentacion}));
            this.calidad.show(new Granjas.CalidadView({model: this.model.calidad}));
            this.biometria.show(new Granjas.BiometriaView({model: this.model.biometria}));
        }
    });

    Granjas.AlimentacionView = Marionette.Layout.extend({
        template: "#template-estx-alimentacion",
        className: "panel-group",
        regions: {
            reportes: "#alim-reportes",
            accion: "#alim-accion"
        },
        initialize: function () {
            var mod;
            if (!_.isUndefined(this.model)) {
                mod = this.model;
            }
        }
    });

    Granjas.CalidadView = Granjas.AlimentacionView.extend({
        template: "#template-estx-calidad"
    });

    Granjas.BiometriaView = Granjas.AlimentacionView.extend({
        template: "#template-estx-biometria"
    });

    Granjas.EstanquePill = Marionette.ItemView.extend({
        template: "#template-estx-pill",
        tagName: "li",
        model: Granjas.EstanqueDoc,
        events: {
            "click a": "estnxClick"
        },
        estnxClick: function (e) {
            //e.preventDefault();
            console.log("estnxClick", e);
        }
    });

    Granjas.EstanquesNavPills = Marionette.CollectionView.extend({
        template: "#template-granja-subnav",
        tagName: "ul",
        className: "nav nav-pills",
        itemView: Granjas.EstanquePill,
        itemViewContainer: "#estxs"
    });

    Granjas.EstanqueEditForm = Granjas.GranjaEditForm.extend({
        template: "#template-estx-edit",
        initialize: function () {
        }
    });
});
