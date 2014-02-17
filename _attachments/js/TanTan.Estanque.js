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
        templateHelpers: {
            hasInfo: function () {
                return ((this.forma > 0) || (this.dimensiones > 0) || (this.volumen.length > 0) || (this.material > 0));
            },
            isAdmin: function () {
                return App.request('isAdmin');
            }
        },
        getDateKeys: function (date) {
            var t = date || new Date();
            var today = [t.getFullYear(), t.getMonth()+1, t.getDate()];
            var yesterday = [t.getFullYear(), t.getMonth()+1, t.getDate()-1];
            return {today: today, yesterday: yesterday};
        },
        getOperacionesFecha: function (options) {
            var operaciones = new App.Docs.OperacionesFecha();
            operaciones.fetch({
                keys: [today, yesterday],
                success: options.success
            });
        },
        getOperacionesTipo: function (options) {
            var operaciones = new App.Docs.OperacionesTipo();
            operaciones.fetch(options);
        },
        showOperacion: function (oper_name, oper_region, doc) {
            var dates = this.getDateKeys(new Date());
            var controller = this;
            var view;
            switch (oper_name) {
                case 'alimentacion':
                    view = new Vistas.AlimentacionView({model: doc});
                    break;
                case 'calidad':
                    view = new Vistas.CalidadView({model: doc});
                    break;
                case 'biometria':
                    view = new Vistas.BiometriaView({model: doc});
                    break;
            }
            view.on('save:form', function (args) {
                console.log('save form ARGS', args);
                var data = args.view.ui.form.serializeJSON();
                if (args.model.id) {
                    data.modified_at = new Date().toISOString();
                } else {
                    data.created_at = new Date().toISOString();
                    data.created_date = dates.today;
                }
                args.model.set(data);
                console.log('saving '+oper_name+' model', JSON.stringify(args.model.toJSON()));
                args.model.save({
                    success: function (m, r, o) {
                        controller.showOperacion(oper_name, oper_region, m);
                    }
                });
            });
            oper_region.show(view);
        },
        onRender: function () {
            var eid = this.model.id;
            var controller = this;
            console.log("estank view id", eid);
            var dates = this.getDateKeys(new Date());
            var today = dates.today;
            var yesterday = dates.yesterday;
            console.log('eid, today & yesterday', this.model.id, today, yesterday);

            var tkey = _.clone(dates.today);
            var ykey = _.clone(dates.yesterday);
            var talimkey = [eid, "alimentacion", tkey[0], tkey[1], tkey[2]];
            var tmueskey = [eid, "calidad", tkey[0], tkey[1], tkey[2]];
            var yalimkey = [eid, "alimentacion", ykey[0], ykey[1], ykey[2]];
            var ymueskey = [eid, "calidad", ykey[0], ykey[1], ykey[2]];
            var ubiomkey = [eid, "biometria", ykey[0], ykey[1], ykey[2]];

            //Alimentacion
            controller.getOperacionesTipo({
                keys: [talimkey, tmueskey, yalimkey],
                success: function (col,r,o) {
                    console.log('alim docs', JSON.stringify(col.toJSON()));
                    var hoyalim = col.filter(function (oper) {
                        var hoy = _.isEqual(oper.get('created_date'), dates.today);
                        var alim = _.isEqual(oper.get('tipo'), 'alimentacion');
                        return hoy && alim;
                    });
                    var doc = new App.Docs.AlimentacionDoc();
                    doc.set('estanque_id', eid);
                    if (hoyalim.length > 0) {
                        doc.set('_id', hoyalim[0].id);
                        doc.set('estanque_id', eid);
                        doc.fetch({
                            success: function (m,r,o) {
                                console.log('alim doc SAVED', m);
                                controller.showOperacion('alimentacion', controller.alimentacion, m);
                            }
                        });
                    }
                    controller.showOperacion('alimentacion', controller.alimentacion, doc);
                }
            });

            //Calidad
            controller.getOperacionesTipo({
                keys: [talimkey, tmueskey, ymueskey],
                success: function (col,r,o) {
                    console.log('calidad docs', JSON.stringify(col.toJSON()));
                    var hoyalim = col.filter(function (oper) {
                        var hoy = _.isEqual(oper.get('created_date'), dates.today);
                        var alim = _.isEqual(oper.get('tipo'), 'calidad');
                        return hoy && alim;
                    });
                    var doc = new App.Docs.CalidadDoc();
                    doc.set('estanque_id', eid);
                    if (hoyalim.length > 0) {
                        doc.set('_id', hoyalim[0].id);
                        doc.fetch({
                            success: function (m,r,o) {
                                controller.showOperacion('calidad', controller.calidad, m);
                            }
                        });
                    } else {
                        controller.showOperacion('calidad', controller.calidad, doc);
                    }
                }
            });

            //Biometria
            controller.getOperacionesTipo({
                keys: [talimkey, tmueskey, ymueskey],
                success: function (col,r,o) {
                    console.log('biometria docs', JSON.stringify(col.toJSON()));
                    var hoyalim = col.filter(function (oper) {
                        var hoy = _.isEqual(oper.get('created_date'), dates.today);
                        var alim = _.isEqual(oper.get('tipo'), 'biometria');
                        return hoy && alim;
                    });
                    var doc = new App.Docs.CalidadDoc();
                    doc.set('estanque_id', eid);
                    if (hoyalim.length > 0) {
                        doc.set('_id', hoyalim[0].id);
                        doc.fetch({
                            success: function (m,r,o) {
                                controller.showOperacion('biometria', controller.biometria, m);
                            }
                        });
                    } else {
                        controller.showOperacion('biometria', controller.biometria, doc);
                    }
                }
            });
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
