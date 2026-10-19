window.initPage = function () {
  setupUpload('#form-video', '#video-progress', 'Vídeo', () => loadMedia('video', '#grid-videos'));
  loadMedia('video', '#grid-videos');
};
