document.addEventListener('DOMContentLoaded', function () {
  var select = document.getElementById('videoSelect');
  var player = document.getElementById('videoPlayer');
  var navToggle = document.getElementById('navToggle');
  var nav = document.querySelector('.Nav');
  var sources = {
    Clairen: 'videos/clairen.mp4',
    Loxodont: 'videos/loxodont.mp4',
    Zetterburn: 'videos/zetterburn.mp4',
    Absa: 'videos/absa.mp4',
    Galvan: 'videos/galvan.mp4',
    Ranno: 'videos/ranno.mp4',
    Wrastor: 'videos/wrastor.mp4',
    Etalus: 'videos/etalus.mp4'
  };

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  if (select && player) {
    var saved = localStorage.getItem('videoSeleccionado') || '';
    if (saved && sources[saved]) {
      select.value = saved;
      player.src = sources[saved];
      player.style.display = 'block';
      player.load();
    }
    select.addEventListener('change', function () {
      var value = select.value;
      var src = sources[value];
      if (src) {
        localStorage.setItem('videoSeleccionado', value);
        player.src = src;
        player.style.display = 'block';
        player.load();
      } else {
        localStorage.removeItem('videoSeleccionado');
        player.pause();
        player.removeAttribute('src');
        player.style.display = 'none';
      }
    });
  }

  function openDB() {
    return new Promise(function (resolve, reject) {
      var request = indexedDB.open('roa2', 1);
      request.onupgradeneeded = function (e) {
        var db = e.target.result;
        var store = db.createObjectStore('comentarios', { keyPath: 'id', autoIncrement: true });
        store.createIndex('personaje', 'personaje', { unique: false });
        store.createIndex('fecha', 'fecha', { unique: false });
      };
      request.onsuccess = function (e) {
        resolve(e.target.result);
      };
      request.onerror = function () {
        reject(new Error('No se pudo abrir IndexedDB'));
      };
    });
  }

  function addComentario(personaje, nombre, texto) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('comentarios', 'readwrite');
        var store = tx.objectStore('comentarios');
        var fecha = Date.now();
        var data = { personaje: personaje, nombre: nombre, texto: texto, fecha: fecha };
        var req = store.add(data);
        req.onsuccess = function () {
          resolve(data);
        };
        req.onerror = function () {
          reject(new Error('No se pudo guardar'));
        };
        tx.oncomplete = function () {
          db.close();
        };
      });
    });
  }

  function getComentarios(personaje) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('comentarios', 'readonly');
        var store = tx.objectStore('comentarios');
        var idx = store.index('personaje');
        var req = idx.getAll(personaje);
        req.onsuccess = function (e) {
          var rows = e.target.result || [];
          rows.sort(function (a, b) { return b.fecha - a.fecha; });
          resolve(rows);
        };
        req.onerror = function () {
          reject(new Error('No se pudo leer'));
        };
        tx.oncomplete = function () {
          db.close();
        };
      });
    });
  }

  function renderComentarios(container) {
    var personaje = container.getAttribute('data-personaje');
    var lista = container.querySelector('.ComentariosLista');
    getComentarios(personaje).then(function (rows) {
      lista.innerHTML = '';
      rows.forEach(function (c) {
        var li = document.createElement('li');
        var fecha = new Date(c.fecha);
        li.textContent = c.nombre + ' • ' + fecha.toLocaleString() + ' — ' + c.texto;
        lista.appendChild(li);
      });
    }).catch(function () {
      lista.innerHTML = '<li>Sin datos</li>';
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('.Comentarios'), function (container) {
    var form = container.querySelector('.ComentariosForm');
    renderComentarios(container);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var personaje = container.getAttribute('data-personaje');
      var nombre = form.nombre.value.trim();
      var texto = form.texto.value.trim();
      if (!nombre || !texto) return;
      addComentario(personaje, nombre, texto).then(function () {
        form.reset();
        renderComentarios(container);
      });
    });
  });
});
