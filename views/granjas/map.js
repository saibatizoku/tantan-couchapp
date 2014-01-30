function(doc) {
  if (doc.tipo == "granja") {
      emit(doc._id, doc);
  }
};
