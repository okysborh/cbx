window.initPage = function () {
  setupUpload('#form-photo', '#photo-progress', 'Foto', () => loadMedia('photo', '#grid-photos'));
  loadMedia('photo', '#grid-photos');
};
