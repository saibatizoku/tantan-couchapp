/*global TodoMVC */
'use strict';

TanTan.module('Docs', function (Docs, App, Backbone, Marionette, $, _) {

    Docs.UserDoc = Backbone.Model.extend({
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
            this.setIdFromName(this.get('name'));
        },
        setIdFromName: function (name) {
            if (_.isString(name) && (name.length > 0)) {
                this.set(this.idAttribute, 'org.couchdb.user:' + name);
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
        sync: App.Sync.sync
    });

    Docs.UserDocs= Backbone.Collection.extend({
        url: "/usuarios",
        model: Docs.UserDoc,
        sync: App.Sync.sync
    });

    Docs.GranjaDoc = Backbone.Model.extend({
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

    Docs.GranjaDocs = Backbone.Collection.extend({
        url: "/granjas",
        db: {
            view: "granjas"
        },
        model: Docs.GranjaDoc
    });

    Docs.EstanqueDoc = Backbone.Model.extend({
        defaults: {
            tipo: "estanque",
            nombre: '',
            material: '',
            forma: '',
            dimensiones: '',
            volumen: ''
        }

    });

    Docs.EstanquesDocs = Backbone.Collection.extend({
        url: "/estanques",
        db: {
            view: "estanques"
        },
        model: Docs.EstanqueDoc
    });

});