/*global TodoMVC */
'use strict';

TanTan.module('Granjas', function (Granjas, App, Backbone, Marionette, $, _) {

    Granjas.Base = Backbone.Model.extend({
        defaults: {
            created_at: null,
            modified_at: null,
            author: null
        },
        initialize: function () {
            if (this.isNew()) {
                var now = new Date();
                this.set('created_at', now.toISOString());
                this.set('modified_at', now.toISOString());
            }
        }
    });

    Granjas.Documento= Granjas.Base.extend({
        defaults: {
            tipo: 'documento',
            title: '',
            description: ''
        },
        modelAdded: function (model) {
            console.log('model added');
        },
        modelChanged: function (model, value) {
        },
        validate: function (attribs) {
            //if (!attr.nombre) {
            //    return 'Name needed'
            //}
        }
    });

    Granjas.Documentos = Backbone.Collection.extend({
        model: Granjas.Documento,
        url: 'documentos-info'
    });

    Granjas.Nodo = Granjas.Base.extend({
        initialize: function () {
            this.setNodes();
        },
        nodeCollection: function (nodes) {
            return new Granjas.Nodos(nodes);
        },
        setNodes: function () {
            var nodes = this.get('nodos');
            if (nodes) {
                this.nodos = this.nodeCollection(nodes);
                this.unset('nodos');
            }
        }
    });

    Granjas.ArbolGranjas = Granjas.Nodo.extend({
        nodeCollection: function (nodes) {
            return new Granjas.Granjas(nodes);
        }
    });

    Granjas.ArbolUsuarios = Granjas.Nodo.extend({
        nodeCollection: function (nodes) {
            return new Granjas.UserDocs(nodes);
        }
    });

    Granjas.NavBar = Marionette.Layout.extend({
        template: '#template-navbar',
        className: 'navbar navbar-default',
        regions: {
            menu: '#nav-menu',
            user: '#nav-user',
            actions: '#nav-actions'
        },
        onShowCalled: function () {
            var controller = this;
            if (_.isUndefined(this.model)) {
                this.menu.close();
                this.user.close();
                var actionsview = new Granjas.LoggedOut();
                this.actions.show(actionsview);
                this.listenTo(actionsview, 'app:login', function (args) {
                    console.log('logging in app:login', args);
                    var form = args.view.$el;
                    var user = args.view.ui.user;
                    var pwd = args.view.ui.pwd;
                    function success_callback (resp) {
                        console.log('login successful');
                        App.vent.trigger('login:good', resp);
                        App.vent.trigger('granjas:login', {creds: [user.val(), pwd.val()]});
                    }
                    function error_callback (rstatus, error, reason) {
                        console.log('login FAILED');
                        form.trigger('reset');
                        user.trigger('focus');
                        App.vent.trigger('login:failed', rstatus, error, reason);
                    }
                    if (user.val() && pwd.val()) {
                        console.log("login", user.val(), pwd.val());
                        $.couch.login({
                            name: user.val(),
                            password: pwd.val(),
                            success: success_callback,
                            error: error_callback
                        });
                    } else {
                        error_callback();
                    }
                });
            } else {
                var user = this.model;
                var menuview = new Granjas.NavMenu({model: user});
                this.menu.show(menuview);
                this.user.close();
                var actionsview = new Granjas.LoggedIn({model: user});
                this.actions.show(actionsview);
                this.listenTo(actionsview, 'app:logout', function (args) {
                    console.log('logging out app:logout', args);
                    App.vent.trigger('logout');
                    function success_callback (resp) {
                        console.log('logout successful');
                        //controller.render();
                    };
                    function error_callback (rstatus, error, reason) {
                        console.log('logout FAILED');
                        App.vent.trigger('logout:failed', rstatus, error, reason);
                    }
                    $.couch.logout({
                        success: success_callback,
                        error: error_callback
                    });
                });
            }
        }
    });

    Granjas.NavActions  = Marionette.ItemView.extend({
        template: '#navactions',
        tagName: 'form',
        className: 'navbar-form navbar-right',
        ui: {
            input: '#login',
            user: '#usuario',
            password: 'input[name=contra]'
        },

        events: {
            'click #login': 'doLogin'
        },

        doLogin: function (e) {
            e.preventDefault();
            var r = [ this.ui.user.val(), this.ui.password.val()];
            App.vent.trigger('granjas:login', { creds: r, event: e});
        }
    });

    Granjas.NavMenu= Marionette.ItemView.extend({
        tagName: "ul",
        className: "nav navbar-nav",
        getTemplate: function () {
            if (this.model.is_admin()) {
                return "#account-admin-menu";
            } else {
                return "#account-menu";
            }
        }
    });

    Granjas.LoggedIn = Marionette.ItemView.extend({
        tagName: "form",
        className: "navbar-form navbar-right",
        getTemplate: function () {
            if (this.model.is_admin()) {
                return "#account-admin-logged-in";
            } else {
                return "#account-logged-in";
            }
        },
        ui: {
            nuevagranja: ".boton-agregar",
            submit: "button[type=submit]"
        },
        triggers: {
            //"click @ui.nuevagranja": "create:granja",
            "click @ui.submit": "app:logout"
        },
        createGranja: function () {
            App.vent.trigger('createGranja');
            console.log('view AdminLoggedIn');
            var form = this.$el;
            function success_callback (resp) {
                console.log('createGranja successful');
                App.vent.trigger('create:granja:good', resp);
            };
            function error_callback (rstatus, error, reason) {
                console.log('createGranja FAILED');
                App.vent.trigger('create:granja:failed', rstatus, error, reason);
            }
            console.log("createGranja clicked");
        }
    });

    Granjas.LoggedOut = Marionette.ItemView.extend({
        template: "#account-logged-out",
        tagName: "form",
        className: "navbar-form navbar-right",
        ui: {
            user: "input[type=text]",
            pwd: "input[type=password]",
            submit: "button[type=submit]"
        },
        triggers: {
            "click @ui.submit": "app:login"
        }
    });

    Granjas.HojaView = Marionette.ItemView.extend({
        template: '#template-hoja',
        tagName: 'li',
        className: 'thumbnail nodo hoja',
        ui: {
            'lnk': '> a'
        },
        triggers: {
            'click @ui.lnk': 'tree:nav:click'
        },
        isActive: function () {
            return this.$el.hasClass('active');
        },
        toggleSelect: function () {
            if (!this.isActive()) {
                this.toggleActive();
                //this.$el.siblings().find('.in').collapse('toggle');
            }
        },
        toggleActive: function () {
            this.$el.siblings().find('.active').removeClass('active');
            this.$el.siblings().removeClass('active');
            this.$el.toggleClass('active');
        }
    });

    Granjas.ArbolView = Marionette.CompositeView.extend({
        template: '#template-rama',
        tagName: 'li',
        itemViewContainer: '.raiz-listado',
        className: 'thumbnail nodo',
        ui: {
            'lnk': '> a'
        },
        triggers: {
            'click @ui.lnk': 'tree:nav:click'
        },
        initialize: function () {
            var nodes = this.model.nodos;
            this.collection = nodes;
        },
        onDomRefreshed: function () {
            if (this.isBranch()) {
                this.$itemViewContainer.collapse();
                this.$itemViewContainer.collapse('toggle');
            }
        },
        onRender: function () {
            if (this.isBranch()) {
                this.$el.addClass('rama');
            } else {
                this.$el.addClass('hoja');
            }
            //var url = this.model.url();
            //if (url) {
            //    this.ui.lnk.attr('href', '#'+url);
            //}
        },
        isBranch: function () {
            if ((this.collection) && (this.collection.length > 0)) {
                return true;
            } else {
                return false;
            }
        },
        //appendHtml: function (collectionView, itemView) {
        buildItemView: function (item, ItemViewType, itemViewOptions) {
            // build the final list of options for the item view type
            var options = _.extend({model: item}, itemViewOptions);
            // create the item view instance
            if (!this.isBranch()) {
                ItemViewType = Granjas.HojaView;
            }
            var view = new ItemViewType(options);
            //this.on('itemview:tree:nav:click', function (args) {
            this.listenTo(view, 'tree:nav:click itemview:nav:click', function (args) {
                //ab.log('ITEMVIEW NAV CLICK', args.model.toJSON()); //, this, args);
                App.vent.trigger('nav:click', args);
            });
            return view;
        },
        isActive: function () {
            return this.$el.hasClass('active');
        },
        toggleSelect: function () {
            if (this.isBranch()) {
                this.toggleActive();
                this.toggleCollapse();
            } else {
                if (!this.isActive()) {
                    this.toggleActive();
                }
            }
        },
        toggleActive: function () {
            this.$el.siblings().find('.active').removeClass('active');
            this.$el.siblings().removeClass('active');
            this.$el.toggleClass('active');
        },
        toggleCollapse: function () {
            this.$el.siblings().find('.in').collapse('toggle');
            this.$itemViewContainer.find('.in').collapse('toggle');
            this.$itemViewContainer.find('.active').removeClass('active');
            this.$itemViewContainer.collapse('toggle');
        }
    });

    Granjas.RaizView = Marionette.CompositeView.extend({
        template: '#template-nav-root',
        className: 'col-sm-3 node-tree',
        itemView: Granjas.ArbolView,
        itemViewContainer: '#raiz-listado',
        initialize: function () {
            this.on('itemview:tree:nav:click', function (args) {
                //ab.log('RAIZ itemview:tree:nav:click', args.model.toJSON());
                //args.toggleCollapse();
                App.vent.trigger('nav:click', {view: args, model: args.model, collection: args.collection});
                //this.toggleCollapse();
            });
        },
        treeUpdate: function (tree_info) {
            //ab.log('TREE INFO CALL', tree_info);
            this.collection.reset(tree_info);
        }
    });

});
