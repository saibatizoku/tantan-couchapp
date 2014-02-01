/*global TodoMVC */
'use strict';

TanTan.module('UsersAPI', function (UsersAPI, App, Backbone, Marionette, $, _) {
    UsersAPI.create = function (model, options) {
        console.log('UsersAPI.create', model);
        return $.couch.userDb(function (db) {
            db.saveDoc(model, {
                success: function (data) {
                    console.log('model saved', JSON.stringify(data));
                    if (data.ok) {
                        model.set('_id', data.id);
                        model.set('_rev', data.rev);
                    }
                }
            });
        });
    };

    UsersAPI.update = function (model, options) {
        console.log('UsersAPI.update->create');
        UsersAPI.create(model, success, error);
    };

    UsersAPI.destroy = function (model, options) {
        console.log('UsersAPI.delete');
    };

    UsersAPI.find = function (model, options) {
        console.log('UsersAPI.find');
        if (!model.id) {
            throw new Error("The model has no id property, so it can't get fetched from the database");
        }
        return $.couch.userDb(function (db) {
            db.openDoc(model.id, {
                success: function (doc) {
                    options.success(doc);
                    return options.complete();
                },
                error: function(status, error, reason) {
                    var res;
                    res = {
                        status: status,
                        error: error,
                        reason: reason
                    };
                    options.error(res);
                    return options.complete(res);
                }
            });
        });
    };

    UsersAPI.findAll = function (model, options) {
        console.log('UsersAPI.findAll');
        var UserS;
        $.couch.userDb(function (db) {
            function current_user (doc) {
                console.log('current user DATA', JSON.stringify(doc));
                options.success([doc]);
                return options.complete();
            }
            function all_users (data) {
                //console.log('allusers DATA', JSON.stringify(data));
                UserS = _.map(data.rows, function (doc) {
                    return doc.doc;
                });
                //console.log('GOT ALLUSERS', JSON.stringify(UserS));
                UsersAPI.trigger('got:users', UserS);
                options.success(UserS);
                return options.complete();
            }
            var _opts = {
                include_docs: true,
                startkey: "org.couchdb.user:",
                success: all_users
            };
            if (options.key) {
                delete _opts.startkey;
                _opts.success = current_user;
                db.openDoc(options.key, _opts);
            } else {
                db.allDocs(_opts);
            }
        });
        return UserS;
    };

    UsersAPI.sync = function (method, model, options) {
        var _ref, _ref1, _ref2;
        if ((_ref = options.success) == null) {
            options.success = function() {};
        }
        if ((_ref1 = options.error) == null) {
            options.error = function() {};
        }
        if ((_ref2 = options.complete) == null) {
            options.complete = function() {};
        }
        switch (method) {
            case 'create':
                return UsersAPI.create(model, options);
            case 'update':
                return UsersAPI.create(model, options);
            case 'delete':
                return UsersAPI.destroy(model, options);
            case 'read':
                if (model.models) {
                    return UsersAPI.findAll(model, options);
                } else {
                    return UsersAPI.find(model, options);
                }
        }
    }
});

TanTan.module('Granjas', function (Granjas, App, Backbone, Marionette, $, _) {

    var security = true;

    Granjas.UserDoc = Backbone.Model.extend({
        urlRoot: '/user',
        defaults: {
            name: '',
            roles: [],
            tantan: {
                nombre: '',
                descripcion: ''
            },
            type: 'user'
        },
        initialize: function (options) {
            console.log('userdoc initialized', this.toJSON());
            if ((!this.get(this.idAttribute)) && (this.get('name').length > 0)) {
                var thisid = 'org.couchdb.user:' + this.get('name');
                this.set(this.idAttribute, thisid);
            }
        },
        is_admin: function () {
            return false;
        },
        is_manager: function () {
            return (this.get('roles').indexOf('granja-admin') != -1);
        },
        is_user: function () {
            return (this.get('roles').indexOf('granja-user') != -1);
        },
        sync: App.UsersAPI.sync
    });

    Granjas.UserDocs= Backbone.Collection.extend({
        url: "/usuarios",
        model: Granjas.UserDoc,
        sync: App.UsersAPI.sync
    });

    Granjas.UserItemView = Marionette.CompositeView.extend({
        template: "#template-admin-user-item",
        tagName: "a",
        className: "list-group-item",
        itemView: Granjas.GranjaPillView,
        itemViewContainer: ".nav-pills",
        initialize: function () {
            this.$el.val('href', '#');
        },
        onRender: function () {
            console.log('rendering', this.model.get('tantan').nombre);
            this.ui.nombre.val(this.model.get('tantan').nombre);
            var gid = this.model.get('granja_id');
            if ((gid) && (this.collection.get(gid))) {
                var v = this.children.findByModel(this.collection.get(gid));
                console.log('pertenece a granja', v);
                v.$el.addClass('active');
            }
        },
        ui: {
            "submit": "button[type=submit]",
            "nombre": ".tantan-nombre"
        },
        triggers: {
            "click @ui.submit": "save:user"
        }
    });

    Granjas.UsersManageView = Marionette.CompositeView.extend({
        template: '#template-admin-users',
        className: 'panel-group',
        itemView: Granjas.UserItemView,
        itemViewContainer: "#lista-usuarios",
        ui: {
            "listagranjas": "#lista-granjas",
            "listausuarios": "#lista-usuarios"
        }
    });

    Granjas.RutasUsuarios = Marionette.AppRouter.extend({
        appRoutes: {
            "usuarios(/:gid)": "goUsers"
        }
    });

    Granjas.ControlUsuarios = Granjas.Control.extend({
        goUsers: function (gid) {
            var controller = this;
            var opts = {};
            function showMain (user) {
                console.log('goUsers showMain', gid, user);
                var granjas = new Granjas.GranjaCol();
                granjas.fetch();
                console.log('goUsers has USER');
                var granjas_list = new Granjas.GranjaListView({collection: granjas});
                granjas_list.on('itemview:render', function (view) {
                    view.$el.attr('href', '#usuarios/'+view.model.id);
                    if ((gid) && (gid == view.model.id)) {
                        view.$el.addClass('active');
                    }
                    console.log('granja link view rendered', view);
                    view.on('link:click', function (args) {
                        var  link = args.view.$el;
                        console.log('link clicked args', args);
                        console.log('link clicked', args.view.model.get('_id'), args.view.model.get('name'), !link.hasClass('active'));
                        var gid = args.view.model.get('_id');
                        link.siblings().removeClass('active');
                        link.toggleClass('active');
                        var lnkname = link.text().trim();
                        $("#lista-usuarios .list-group-item").removeClass('hide');
                        if (!link.hasClass('active')) {
                            console.log('link about was DEactivated', lnkname);
                        } else {
                            console.log('link about was Activated', lnkname);
                            var lnkdusers = $("#lista-usuarios .list-group-item").filter(function (idx, el) {
                                var thisel = $(el);
                                var thislnk =  $(thisel.find(".nav-pills .active"));
                                console.log('thisel has thislnk', thislnk.text().trim());
                                return thislnk.text().trim() != lnkname;
                            });
                            console.log('linked users', $(lnkdusers));
                            $(lnkdusers).addClass('hide');
                        }
                    });
                });
                App.side.show(granjas_list);
                App.header.close();
                App.subnav.close();
                App.tools.close();

                var userdocs = new Granjas.UserDocs();
                userdocs.fetch();
                var usersview = new Granjas.UsersManageView({collection: userdocs});
                usersview.on('itemview:before:render', function (view) {
                    view.collection = granjas;

                });
                usersview.on('itemview:render', function (view) {
                    console.log('user view rendered', view);
                    if ((gid) && (gid != view.model.get('granja_id'))) {
                        view.$el.addClass('hide');
                    }
                    view.on('itemview:pill:click', function (v) {
                        var pill = v.$('a');
                        console.log('pill clicked', v.model.get('_id'), view.model.get('name'), !pill.parent().hasClass('active'));
                        var gid = v.model.get('_id');
                        if (pill.parent().hasClass('active')) {
                            view.model.unset('granja_id');
                        } else {
                            view.model.set('granja_id', gid);
                        }
                        pill.parent().siblings().removeClass('active');
                        pill.parent().toggleClass('active');
                    });
                    view.on('save:user', function (args) {
                        console.log('saving user', args);
                        var uform = args.view.$('form');
                        var data = uform.serializeJSON();
                        //var attach = args.view.$(':file');
                        //console.log('field,value', attach[0].name, attach[0].value);
                        //data[attach[0].name] = attach[0].value;
                        console.log('serialized form', uform.serializeJSON());
                        console.log('serialized data', JSON.stringify(data));
                        var model = args.model;
                        model.set(data);
                        model.save();
                        console.log('saved model', model.toJSON());

                        usersview.collection.fetch();
                        usersview.render();
                        granjas_list.render();
                    });
                });
                App.main.show(usersview);
            }
            opts.success = showMain;
            this.initApp(opts);
        }
    });

});
