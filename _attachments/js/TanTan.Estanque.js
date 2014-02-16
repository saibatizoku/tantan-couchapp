/*global TodoMVC */
'use strict';

TanTan.module('Vistas', function (Vistas, App, Backbone, Marionette, $, _) {

    Vistas.EstanqueView = Marionette.Layout.extend({
        template: "#template-estanque-view",
        className: "panel-group",
        model: App.Docs.EstanqueDoc,
        regions: {
            alimentacion: "#nav-alimentacion",
            calidad: "#nav-calidad",
            biometria: "#nav-biometria"
        },
        ui: {
            "borrar": ".boton-borrar",
            "editar": ".boton-editar"
        },
        triggers: {
            "click @ui.borrar": "borrar:estanque",
            "click @ui.editar": "editar:estanque"
        },
        onRender: function () {
            var eid = this.model.id;
            console.log("estank view id", eid, this.model.alimentacion);
            this.alimentacion.show(new Vistas.AlimentacionView({model: this.model.alimentacion}));
            this.calidad.show(new Vistas.CalidadView({model: this.model.calidad}));
            this.biometria.show(new Vistas.BiometriaView({model: this.model.biometria}));
        }
    });

    Vistas.EstanqueEditForm = Marionette.ItemView.extend({
        template: "#template-estx-edit",
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
        }
    });

    Vistas.AlimentacionView = Marionette.Layout.extend({
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
        },
        ui: {
            "form": "form",
            "save": "button[type=submit]"
        },
        triggers: {
            "click @ui.save": "save:form"
        }
    });

    Vistas.CalidadView = Vistas.AlimentacionView.extend({
        template: "#template-estx-calidad"
    });

    Vistas.BiometriaView = Vistas.AlimentacionView.extend({
        template: "#template-estx-biometria",
        ui: {
            form: "form",
            save: "button[type=submit]",
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
    });

    Vistas.EstanqueEdit = Marionette.ItemView.extend({
        template: "#template-estanque-editar",
        className: "modal fade",
        attributes: {
            id: 'modal-form',
            tabindex: '-1',
            role: 'dialog',
            'aria-labelledby': 'modal-formLabel',
            'aria-hidden': 'true'
        },
        onRender: function () {
            var view = this;
            this.$el.modal('show');
            this.$el.on('hidden.bs.modal', function (e) {
                view.trigger('cerrar:editar');
            });
        }
    });

});
