$(function () {
    TanTan.addInitializer(function () {
        var api = TanTan.AutoBahn;
        var wsprot = "wss://";
        //var wsprot = "ws://";
        //if (window.location.protocol == 'https:') {
        //    wsprot = "wss://";
        //}
        var wsuri = wsprot + window.location.hostname + ":8080/ws_couch";
        api.wsuri = wsuri;
        api.connect();

        TanTan.granjas = new TanTan.Granjas.GranjaCol();
        TanTan.user = new TanTan.Granjas.UserDoc();
        TanTan.granjas.fetch();

        var control = new TanTan.Granjas.Control();
        TanTan.control = control;
        var control_editar = new TanTan.Granjas.ControlEditar();
        TanTan.control_editar = control_editar;
        TanTan.rutas = {home: new TanTan.Granjas.Rutas({controller: control})};
        TanTan.rutas.editar = new TanTan.Granjas.RutasEditar({controller: control_editar});
        TanTan.vent.on('wamp:success', function (sess) {
            ab.log('WAMP session SUCCESS');

            sess.prefix("db", "http://www.tantan.org/api/datos/info#");
            sess.prefix("zb", "http://www.tantan.org/api/sensores#");
            sess.prefix("zbn", "http://www.tantan.org/api/sensores/nodos#");
            log_line = "Event PubSub ready";
            ab.log(log_line);

            sess.prefix("rpc", "http://www.tantan.org/api/datos#");
            sess.prefix("zbrpc", "http://www.tantan.org/api/sensores-control#");
            log_line = "RPC ready"
            ab.log(log_line);

        ab.log('WAMP session OK');

        //sess.subscribe("zb:zb-nd", onND);
        //sess.subscribe("zbn", onSensor);

        //api.login(['granja-admin', 'nimda']);
        });

        TanTan.vent.on('granjas:login', function (info) {
            ab.log('WAMP Logging in');
            api.login(info.creds);
        });

        TanTan.vent.on('granjas:logout', function () {
            ab.log('WAMP Logging out');
            api.logout();
        });

        TanTan.vent.on('granjas:loggedIn', function (user) {
            ab.log('loggedIn', user);
            api.get_granjas();
            //controller_tantan.user = user;
            //controller_tantan.goHome();
        });

        TanTan.vent.on('granjas:loggedOut', function () {
            ab.log('loggedOut');
            //delete controller_tantan.user;
            //controller_tantan.goHome();
        });

        TanTan.vent.on('login:good', function (resp) {
            console.log('APP.VENT.login:good', resp);
            TanTan.rutas.home.navigate('home', {trigger: true});
        });

        TanTan.vent.on('login:failed', function (s, e, r) {
            console.log('APP.VENT.login:failed');
            TanTan.rutas.home.navigate('', {trigger: true});
        });

        TanTan.vent.on('logout', function () {
            TanTan.control.showLoggedOut();
            console.log('APP.VENT.logout');
            //TanTan.rutas.navigate('', {trigger: true, replace: true});
            TanTan.rutas.home.navigate('', {replace: true});
        });
    });
    TanTan.start();
});
