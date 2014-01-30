/*global TodoMVC */
'use strict';

TanTan.module('Granjas', function (Granjas, App, Backbone, Marionette, $, _) {

    Granjas.AllDocs = Backbone.Collection.extend({
        url: "/documentos",
        db: {
            view: "_all_docs",
            include_docs: true
        }
    });

    Granjas.Rutas = Marionette.AppRouter.extend({
        appRoutes: {
            "": "goHome",
            "home": "goHome",
            "granjas(/:gid)": "goHome",
            "granjas/:gid/estanques(/:eid)": "goHome"
        },
        initialize: function () {
            //this.listenTo(App.vent, 'go:home', this.navigateHome);
        },
        navigateHome: function (gid, eid) {
            if ((gid) && (eid)) {
                this.navigate('granjas/'+gid+'/estanques/'+eid, {trigger: true});
            } else if (gid) {
                this.navigate('granjas/'+gid, {trigger: true});
            } else {
                this.navigate('granjas', {trigger: true});
            }
        }
    });

    Granjas.Control = Marionette.Controller.extend({
        initialize: function () {
            this.gcol = undefined;
        },
        showLoggedIn: function (user) {
            console.log('user is ADMIN?', user.is_admin());
            App.nav.show(new Granjas.NavBar({model: user}));
        },
        showLoggedOut: function () {
            this.gcol = undefined;
            App.nav.show(new Granjas.NavBar());
            App.side.close();
            App.tools.close();
            App.header.close();
            App.subnav.close();
            App.main.close();
        },
        initApp: function (opts) {
            var controller = this;
            function showApp (resp) {
                var userCtx = resp.userCtx;
                var usr = new Granjas.UserDoc(userCtx);
                if (userCtx.name) {
                    controller.showLoggedIn(usr);
                    if ((opts) && (opts.success)) {
                        var _opts = opts.session_options || {};
                        _opts.user = usr;
                        opts.success(_opts);
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
        getGranjas: function (gid) {
            var controller = this;
            var gcol;
            if (gid) {
                gcol = new Granjas.AllDocs();
                gcol.fetch({key: gid});
            } else {
                gcol = new Granjas.GranjaCol();
                gcol.fetch();
            }
            return gcol;
        },
        goHome: function (gid, eid) {
            var controller = this;
            var opts = {};
            var granjas = controller.gcol;
            controller.listenTo(App.vent, 'granjas:loaded', function (collection) {
                console.log('granjas cargadas. (gid,eid)', gid, eid);
                console.log('granjas', collection);
                if ((gid) && (collection.get(gid))) {
                    var mod = collection.get(gid);
                    console.log('model', mod);
                    var gdocview = new Granjas.GranjaDocView({model: mod});
                    App.main.show(gdocview);
                } else {
                    App.main.close();
                }
            });
            if (_.isUndefined(granjas)) {
                granjas = controller.getGranjas();
            }
            function showMain (options) {
                var user = options.user;
                console.log('goHome showMain', gid, user);
                if (user.is_admin()) {
                    console.log('goHome has ADMIN');
                } else {
                    console.log('goHome has USER');
                }
                var glist = new Granjas.GranjasListView({collection: granjas});
                App.side.show(glist);
                App.header.close();
                App.subnav.close();
                App.tools.close();
                //if ((gid) && (granjas.get(gid))) {
                //    var mod = granjas.get(gid);
                //    console.log('model', mod);
                //    var gdocview = new Granjas.GranjaDocView({model: mod});
                //    controller.listenTo(gdocview, 'render', function () {
                //        var subnav = gdocview.subnav.currentView;
                //        console.log('subnav view', subnav);
                //        //console.log('subnav col', subnav.collection.toJSON());
                //        console.log('eid', eid);
                //        //if ((eid) && (subnav.collection.get(eid))) {
                //        //    console.log('estk', subnav.collection.get(eid));
                //        //}
                //    });
                //    App.main.show(gdocview);
                //    //App.header.show(new Granjas.GranjaMain({model: mod}));
                //    ////App.main.close();
                //    //App.subnav.show(new Granjas.EstanquesNavPills({collection: controller.getEstanques(gid)}));
                //    ////App.subnav.show(new Granjas.EstanquesNavPills({collection: estx.get(gid)}));
                //    //App.tools.show(new Granjas.GranjaTools({model: mod}));
                //    //if ((eid) && (estx.get(eid))) {
                //    //    console.log('estk', estx.get(eid));
                //    //    var eview = new Granjas.EstanqueView({model: estx.get(eid)});
                //    //    controller.listenTo(eview, "borrar:estanque", function (args) {
                //    //        console.log("borrando estanque", args.model.toJSON());
                //    //        args.model.destroy();
                //    //        App.vent.trigger('go:home', gid);
                //    //    });
                //    //    App.main.show(eview);
                //    //    //App.main.currentView.granja_id = gid;
                //    //} else {
                //    //    App.main.show(new Granjas.GranjaInfo({model: granjas.get(gid)}));
                //    //}
                //} else {
                //    App.main.close();
                //}
            }
            opts.success = showMain;
            this.initApp(opts);
        }
    });

});
