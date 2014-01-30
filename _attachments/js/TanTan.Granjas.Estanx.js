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

    Granjas.AlimentacionDoc = Granjas.OperacionDoc.extend({
        urlRoot: "/alimentacion",
        defaults: {
            tipo: "alimentacion",
            racion: [0, 0, 0],
            proteina: [0, 0, 0]
        }
    });

    Granjas.CalidadDoc = Granjas.OperacionDoc.extend({
        defaults: {
            tipo: "muestra",
            pH: 0.0,
            od: 0.0,
            amonio: 0.0,
            tss: 0.0,
            recambio: 0,
            mortandad: 0
        }
    });

    Granjas.BiometriaDoc = Granjas.OperacionDoc.extend({
        defaults: {
            tipo: "biometria",
            talla: [0, 0, 0],
            cantidad: [0, 0, 0],
            peso: [0, 0, 0]
        }
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
        className: "col-sm-12",
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
        ui: {
            mas: ".boton-mas",
            menos: ".boton-menos",
            tanto1: "input[name=tanto-0]",
            tanto2: "input[name=tanto-1]",
            tanto3: "input[name=tanto-2]"
        },
        events: {
            "click @ui.mas": function (e) {
                e.preventDefault();
                var thisel = $(e.currentTarget);
                var thisinput = thisel.parent().siblings('.input-group').find('input');
                var thistanto = thisel.parent().siblings('.talla-tanto').find('input');
                var tanto = thistanto.attr('name');
                var sel = 'input[name='+tanto+']:checked';
                var cantidad = parseInt(thisinput.val());
                var tanto = parseInt(this.$(sel).val());
                console.log('clicking TANTO', tanto);
                console.log('changing CANTIDAD', cantidad);
                cantidad += tanto;
                console.log('nueva CANTIDAD', cantidad);
                thisinput.val(cantidad);
            },
            "click @ui.menos": function (e) {
                e.preventDefault();
                var thisel = $(e.currentTarget);
                var thisinput = thisel.parent().siblings('.input-group').find('input');
                var thistanto = thisel.parent().siblings('.talla-tanto').find('input');
                var tanto;
                var cantidad;
                var sel = 'input[name='+thistanto.attr('name')+']:checked';
                cantidad = thisinput.val();
                tanto = this.$(sel).val();
                //cantidad = parseInt(thisinput.val());
                //tanto = parseInt(this.$(sel).val());
                console.log('clicking TANTO', tanto);
                console.log('changing CANTIDAD', cantidad);
                cantidad -= tanto;
                if (cantidad < 0) {
                    cantidad = 0;
                }
                console.log('nueva CANTIDAD', cantidad);
                thisinput.val(cantidad);
            }
        },
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
        tagName: "ul",
        className: "nav nav-pills",
        itemView: Granjas.EstanquePill,
        itemViewContainer: "#estxs",
        initialize: function () {
            this.listenTo(this.collection, 'sync', function (a,b,c) {
                console.log('pills synced', a, b, c);
            });
        }
    });

    Granjas.EstanqueEditForm = Granjas.GranjaEditForm.extend({
        template: "#template-estx-edit",
        initialize: function () {
        }
    });
});
