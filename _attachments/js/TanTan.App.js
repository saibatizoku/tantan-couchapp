$(function () {
    TanTan.addInitializer(function () {
        var control = new TanTan.Control.Granjas();
        var rutas = new TanTan.Control.Rutas({controller: control});

        TanTan.reqres.setHandler("isAdmin", function() {
            return control.getCurrentUser().is_admin();
        });

    });
    TanTan.start();
});
