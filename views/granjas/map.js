function(doc) {
  if (doc.tipo == "granja") {
      emit(doc.tipo, doc);
  }
};
