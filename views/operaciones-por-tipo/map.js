function(doc) {
  
  if (doc.created_date) {
      if ((doc.tipo == "biometria") || (doc.tipo =="muestra") || (doc.tipo =="alimentacion")) {
        var key = [doc.estanque_id, doc.tipo];
        doc.created_date.map(function(d) { key.push(d);});
        emit(key, doc);
      }
  }
};
