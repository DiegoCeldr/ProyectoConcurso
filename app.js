document.addEventListener('DOMContentLoaded', function () {
  var select = document.getElementById('videoSelect');
  var player = document.getElementById('videoPlayer');
  if (!select || !player) return;
  var sources = {
    Clairen: 'videos/clairen.mp4',
    Loxodont: 'videos/loxodont.mp4',
    Zetterburn: 'videos/zetterburn.mp4',
    Absa: 'videos/absa.mp4',
    Galvan: 'videos/galvan.mp4',
    Ranno: 'videos/ranno.mp4',
    Wrastor: 'videos/wrastor.mp4',
    Etalus: 'videos/etalus.mp4',
  };
  select.addEventListener('change', function () {
    var value = select.value;
    var src = sources[value];
    if (src) {
      player.src = src;
      player.style.display = 'block';
      player.load();
    } else {
      player.pause();
      player.removeAttribute('src');
      player.style.display = 'none';
    }
  });
});