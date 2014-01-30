Backbone.couch_connector.config.db_name = "tantan";
Backbone.couch_connector.config.ddoc_name = "japp";

// If set to true, the connector will listen to the changes feed
// and will provide your models with real time remote updates.
Backbone.couch_connector.config.global_changes = false;

var TanTan = new Backbone.Marionette.Application();

TanTan.addRegions({
    nav: "#nav",
    side: "#side",
    header: "#header",
    subnav: "#subnav",
    tools: "#tools",
    main: "#main"
});

TanTan.on('initialize:after', function() {
    Backbone.history.start();

    //TanTan.commands.setHandler("login", function (creds) {
    //    var user = creds.user;
    //    var pwd = creds.pwd;
    //    $.couch.login({
    //        name: user.val(),
    //        password: pwd.val(),
    //        success: function (resp) {
    //            console.log('login successful');
    //            TanTan.vent.trigger('login:good', resp);
    //        },
    //        error: function (rstatus, error, reason) {
    //            console.log('login FAILED');
    //            form.trigger('reset');
    //            user.trigger('focus');
    //            TanTan.vent.trigger('login:failed', rstatus, error, reason);
    //        }
    //    });
    //});
});
