/*global TodoMVC */
'use strict';

TanTan.module('Granjas', function (Granjas, App, Backbone, Marionette, $, _) {

    Granjas.UserDoc = Backbone.Model.extend({
        defaults: {
            name: '',
            roles: []
        },
        type: 'user',
        is_admin: function () {
            return (this.get('roles').indexOf('_admin') != -1);
        }
    });

    Granjas.UserDocs = Backbone.Collection.extend({
        url: "/usuarios",
        model: Granjas.UserDoc
    });

    Granjas.UsersManageView = Marionette.Layout.extend({
        template: '#template-admin-users',
        className: 'panel-group',
        regions: {
            granjas: '#panel-granjas',
            users: '#lista-usuarios'
        },
        ui: {
            "listagranjas": "#lista-granjas",
            "listausuarios": "#lista-usuarios",
            "usuarios": "#lista-usuarios li"
        },
        initialize: function() {
            this.getUsers();
        },
        getUsers: function (uid) {
            var controller = this;
            $.couch.userDb(function (db) {
                db.allDocs({
                    include_docs: true,
                    startkey: "org.couchdb.user:",
                    success: function (r) {
                        console.log('allusers', JSON.stringify(r));
                        App.vent.trigger('get:users', r);
                        var UserS = _.map(r.rows, function (row) {
                            console.log('allusers row', JSON.stringify(row));
                            var usr = new Granjas.UserDoc(row.doc);
                            var li_sel = "<li class='list-group-item'>"+row.doc.name+"</li>";
                            var li = $(li_sel).data('doc', row.doc);
                            li.draggable({revert: true});
                            controller.ui.listausuarios.append(li);
                            return usr;
                        });
                        controller.ui.listagranjas.droppable();
                        controller.UserS = UserS;
                    }
                });
            });
        }
    });

    Granjas.Rutas = Marionette.AppRouter.extend({
        appRoutes: {
            "": "goHome",
            "home": "goHome",
            "granjas(/:gid)": "goHome",
            "editar/granjas/:gid/estanques(/:eid)": "goEditEstanxs",
            "editar/granjas(/:gid)": "goEditGranjas",
            "granjas/:gid/estanques(/:eid)": "goHome",
            //"borrar/granjas/:gid/estanques/:eid": "goDeleteEstanxs",
            "usuarios(/:uid)": "goUsers"
        },
        initialize: function () {
            this.listenTo(App.vent, 'go:home', function (gid, eid) {
                if ((gid) && (eid)) {
                    this.navigate('granjas/'+gid+'/estanques/'+eid, {trigger: true});
                } else if (gid) {
                    this.navigate('granjas/'+gid, {trigger: true});
                } else {
                    this.navigate('granjas', {trigger: true});
                }
            });
        }
    });

    Granjas.Control = Marionette.Controller.extend({
        initialize: function () {
            var controller = this;
            var gcol = new Granjas.GranjaCol();
            gcol.on('add', function (model, collection, options) {
                console.log('loading granja', model, collection, options);
                model.nodos = controller.getEstanques(model.id);
            });
            this.gcol = gcol;
            gcol.fetch();
        },
        initApp: function (opts) {
            var controller = this;
            function showApp (r) {
                var userCtx = r.userCtx;
                var user = new Granjas.UserDoc(userCtx);
                if (userCtx.name) {
                    controller.showLoggedIn(user);
                    if ((opts) && (opts.success)) {
                        opts.success(user);
                    }
                } else {
                    controller.showLoggedOut();
                }
            }
            console.log('initApp');
            $.couch.session({
                success: showApp,
                error: controller.showLoggedOut
            });
        },
        getEstanques: function (gid) {
            var ecol = new Granjas.EstanquesCol();
            ecol.on('add', function (model, collection, options) {
                var alim = new Granjas.OperacionesCol();
                var cali = new Granjas.OperacionesCol();
                var biom = new Granjas.OperacionesCol();
                var eid = model.id;
                alim.fetch({
                    startkey: [eid,"alimentacion"],
                    endkey: [eid,"alimentacion0"]
                });
                model.alimentacion = alim;
                cali.fetch({
                    startkey: [eid,"muestra"],
                    endkey: [eid,"muestra0"]
                });
                biom.fetch({
                    startkey: [eid,"biometria"],
                    endkey: [eid,"biometria0"]
                });
                model.biometria = biom;
            });
            ecol.fetch({key: [gid,1]});
            return ecol;
        },
        showLoggedOut: function () {
            App.nav.show(new Granjas.NavBar());
            App.side.close();
            App.tools.close();
            App.header.close();
            App.subnav.close();
            App.main.close();
        },
        saveGranjaEvents: function (view) {
            this.listenTo(view, "save:form", function (args) {
                console.log('controller Saving Granja', args);
                if (args.model.isNew()) {
                    this.goEditGranjas();
                } else {
                    this.gcol.add(args.model);
                    this.goEditGranjas(args.model.id);
                }
            });
            this.listenTo(view, "reset:form", function (args) {
                console.log('controller Cancelling GranjaEdit', args);
                if (args.model.isNew()) {
                    this.goHome();
                } else {
                    this.goHome(args.model.id);
                }
            });
        },
        goEditGranjas: function (gid) {
            var controller = this;
            var opts = {};
            function showMain (user) {
                console.log('goEditGranjas showMain', gid, user);
                if (user.is_admin()) {
                    console.log('goEdit has ADMIN');
                    var granjas = controller.gcol;
                    App.side.show(new Granjas.GranjasList({collection: granjas}));
                    if (gid) {
                        if (granjas.get(gid)) {
                            var mod = granjas.get(gid);
                            console.log('model', mod);
                            var estx = mod.nodos;
                            console.log('estx', estx);
                            //var docvw = new Granjas.GranjaDocView({model: mod});
                            //docvw.render();
                            //App.main.show(docvw);
                            App.header.show(new Granjas.GranjaMain({model: mod}));
                            App.subnav.close();
                            App.tools.show(new Granjas.GranjaTools({model: mod}));
                            App.main.show(new Granjas.GranjaEditForm({model: mod}));
                            controller.saveGranjaEvents(App.main.currentView);
                        }
                    } else {
                        console.log('granja nueva');
                        App.header.close();
                        App.subnav.close();
                        App.tools.close();
                        App.main.show(new Granjas.GranjaEditForm({model: new Granjas.GranjaDoc()}));
                        controller.saveGranjaEvents(App.main.currentView);
                    }
                }
            }
            opts.success = showMain;
            this.initApp(opts);
        },
        goDeleteEstanxs: function (gid, eid) {
            var controller = this;
            var opts = {};
            function showMain (user) {
                console.log('goDeleteEstanxs showMain', gid, user);
                if (user.is_admin()) {
                    console.log('goDeleteEstanxs has ADMIN');
                    var granjas = controller.gcol;
                    if ((gid) && (granjas.get(gid))) {
                        App.side.show(new Granjas.GranjasList({collection: granjas}));
                        var mod = granjas.get(gid);
                        console.log('model', mod);
                        var estx = mod.nodos;
                        console.log('estx', estx);
                        App.header.show(new Granjas.GranjaMain({model: mod}));
                        App.subnav.close();
                        App.tools.show(new Granjas.GranjaTools({model: mod}));
                        var emod = new Granjas.EstanqueDoc();
                        if ((eid) && (estx.get(eid))) {
                            console.log('estk', estx.get(eid));
                            emod = estx.get(eid);
                        }
                        var gef = new Granjas.EstanqueEditForm({
                            model: emod
                        });
                        controller.listenTo(gef, "save:form", function (args) {
                            console.log('controller Saving Estanque', args);
                            console.log('controller Saving Estanque GRANJA', mod);
                            var form_data = args.view.$el.serializeJSON();
                            args.model.set(form_data);
                            estx.add(args.model, {merge: true});
                            console.log('controller Saving ESTANQUEX', args.model.toJSON());
                            if (args.model.isNew()) {
                                args.model.set('granja_id', gid);
                                args.model.save();
                                estx.fetch({key: [gid,1]});
                                granjas.fetch();
                                App.vent.trigger('go:home', gid);
                            } else {
                                args.model.save();
                                App.vent.trigger('go:home', gid, args.model.id);
                            }
                            //controller.goEditEstanxs(gid, args.model.id);
                            //controller.goHome(gid, args.model.id);
                        });
                        controller.listenTo(gef, "reset:form", function (args) {
                            console.log('controller Cancelling EstanqueEdit', args);
                            if (args.model.isNew()) {
                                controller.goHome(gid);
                                App.vent.trigger('go:home', gid);
                            } else {
                                controller.goHome(gid, args.model.id);
                                App.vent.trigger('go:home', gid, args.model.id);
                            }
                        });
                        App.main.show(gef);
                    } else {
                        console.log('granja nueva');
                    }
                }
            }
            opts.success = showMain;
            this.initApp(opts);
        },
        goEditEstanxs: function (gid, eid) {
            var controller = this;
            var opts = {};
            function showMain (user) {
                console.log('goEditEstanxs showMain', gid, user);
                if (user.is_admin()) {
                    console.log('goEditEstanxs has ADMIN');
                    var granjas = controller.gcol;
                    if ((gid) && (granjas.get(gid))) {
                        App.side.show(new Granjas.GranjasList({collection: granjas}));
                        var mod = granjas.get(gid);
                        console.log('model', mod);
                        var estx = mod.nodos;
                        console.log('estx', estx);
                        App.header.show(new Granjas.GranjaMain({model: mod}));
                        App.subnav.close();
                        App.tools.show(new Granjas.GranjaTools({model: mod}));
                        var emod = new Granjas.EstanqueDoc();
                        if ((eid) && (estx.get(eid))) {
                            console.log('estk', estx.get(eid));
                            emod = estx.get(eid);
                        }
                        var gef = new Granjas.EstanqueEditForm({
                            model: emod
                        });
                        controller.listenTo(gef, "save:form", function (args) {
                            console.log('controller Saving Estanque', args);
                            console.log('controller Saving Estanque GRANJA', mod);
                            var form_data = args.view.$el.serializeJSON();
                            args.model.set(form_data);
                            args.model.set('granja_id', gid);
                            var eX = new Granjas.EstanquesCol();
                            console.log('controller Saving ESTANQUEX', args.model.toJSON());
                            if (args.model.isNew()) {
                                eX.create(args.model);
                                //args.model.save();
                                //estx.fetch({key: [gid,1]});
                                App.vent.trigger('go:home', gid);
                                //granjas.fetch();
                            } else {
                                args.model.save();
                                App.vent.trigger('go:home', gid, args.model.id);
                            }
                            //controller.goEditEstanxs(gid, args.model.id);
                            //controller.goHome(gid, args.model.id);
                        });
                        controller.listenTo(gef, "reset:form", function (args) {
                            console.log('controller Cancelling EstanqueEdit', args);
                            if (args.model.isNew()) {
                                controller.goHome(gid);
                                App.vent.trigger('go:home', gid);
                            } else {
                                controller.goHome(gid, args.model.id);
                                App.vent.trigger('go:home', gid, args.model.id);
                            }
                        });
                        App.main.show(gef);
                    } else {
                        console.log('granja nueva');
                    }
                }
            }
            opts.success = showMain;
            this.initApp(opts);
        },
        goHome: function (gid, eid) {
            var controller = this;
            var opts = {};
            function showMain (user) {
                console.log('goHome showMain', gid, user);
                if (user.is_admin()) {
                    console.log('goHome has ADMIN');
                }
                var granjas = controller.gcol;
                console.log('goHome has USER');
                App.side.show(new Granjas.GranjasList({collection: granjas}));
                if ((gid) && (granjas.get(gid))) {
                    var mod = granjas.get(gid);
                    console.log('model', mod);
                    var estx = mod.nodos;
                    console.log('estx', estx);
                    App.header.show(new Granjas.GranjaMain({model: mod}));
                    App.main.close();
                    App.subnav.show(new Granjas.EstanquesNavPills({collection: controller.getEstanques(gid)}));
                    App.tools.show(new Granjas.GranjaTools({model: mod}));
                    if ((eid) && (estx.get(eid))) {
                        console.log('estk', estx.get(eid));
                        var eview = new Granjas.EstanqueView({model: estx.get(eid)});
                        controller.listenTo(eview, "borrar:estanque", function (args) {
                            console.log("borrando estanque", args.model.toJSON());
                            args.model.destroy();
                            App.vent.trigger('go:home', gid);
                        });
                        App.main.show(eview);
                        //App.main.currentView.granja_id = gid;
                    } else {
                        App.main.show(new Granjas.GranjaInfo({model: granjas.get(gid)}));
                    }
                } else {
                    App.header.close();
                    App.subnav.close();
                    App.tools.close();
                    App.main.close();
                }
            }
            opts.success = showMain;
            this.initApp(opts);
        },
        getUsers: function (uid) {
            var users;
            $.couch.userDb(function (db) {
                App.userDB = db;
                db.allDocs({
                    success: function (resp) {
                        if (resp.rows) {
                            console.log('rows', resp.rows.length);
                            App.users = users = _.map(resp.rows, function (item) {
                                return item.doc;
                            });
                            console.log('userDb', App.users);
                        }
                    },
                    include_docs: true,
                    startkey: "org.couchdb.user:",
                    descending: false
                });
            });
        },
        goUsers: function (uid) {
            var controller = this;
            var opts = {};
            function showMain (user) {
                console.log('goUsers showMain', uid, user);
                var granjas = controller.gcol;
                console.log('goUsers has USER');
                App.side.show(new Granjas.GranjasList({collection: granjas}));
                if (uid) {
                    var mod = granjas.get(uid);
                    console.log('model', mod);
                    App.header.show(new Granjas.GranjaMain({model: granjas.get(uid)}));
                    App.subnav.close();
                    App.main.close();
                    App.subnav.show(new Granjas.EstanquesNavPills({collection: mod.nodos}));
                    App.tools.show(new Granjas.GranjaTools({model: granjas.get(uid)}));
                    //App.main.show(new Granjas.UsersManageView({model: granjas.get(gid)}));
                } else {
                    App.header.close();
                    App.subnav.close();
                    App.tools.close();
                    App.main.show(new Granjas.UsersManageView());
                }
            }
            opts.success = showMain;
            this.initApp(opts);
        },
        showLoggedIn: function (user) {
            console.log('user is ADMIN?', user.is_admin());
            App.nav.show(new Granjas.NavBar({model: user}));
        },
        navEvents: function (view) {
            var controller = this;
            controller.listenTo(view, 'nav:click', function (args) {
            });
        }
    });

});
