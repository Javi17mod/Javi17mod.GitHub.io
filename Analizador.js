var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
//El método createAnalyser() del AudioContext crea un nodo analizador que puede ser utilizado para crear representaciones visuales del sonido
var analizador = audioCtx.createAnalyser();
analizador.fftSize = 1024; // [32, 64, 128, 256, 512, 1024, 2048]
var dataArray = new Uint8Array(analizador.frequencyBinCount);

var audioBuffer, fuenteDeReproduccion;
var start = false;
var stop = true;
var time = 0;

function solicitarAudio(url) {
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";
  request.onload = function() {
    audioCtx.decodeAudioData(request.response, function(buffer) {
      audioBuffer = buffer;
    });
  };

  request.send();
}

function reproducirAudio() {
  fuenteDeReproduccion = audioCtx.createBufferSource();
  fuenteDeReproduccion.buffer = audioBuffer;
  fuenteDeReproduccion.connect(analizador);
  analizador.connect(audioCtx.destination);
  fuenteDeReproduccion.start(audioCtx.currentTime);
}

function detenerAudio() {
  fuenteDeReproduccion.stop();
}

function audio() {
  if (stop) {
    // si el audio está parado
    time = audioCtx.currentTime;
    start = true;
    stop = false;
    boton.innerHTML = "||";
    reproducirAudio();
  } else {
    // de lo contrario
    stop = true;
    start = false;
    boton.innerHTML = "&#9655;";
    detenerAudio();
  }
}

solicitarAudio(
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/222579/Kevin_MacLeod_-_Camille_Saint-Sans_Danse_Macabre_-_Finale.mp3"
);

// Utiliza el evento click para iniciar o detener la reproducción
boton.addEventListener("click", audio, false);

window.setInterval(function() {
  if (audioBuffer && audioCtx.currentTime - time >= audioBuffer.duration) {
    stop = true;
    boton.innerHTML = "&#9655;";
  }
}, 1000);

// configura el canvas
var canvas = document.querySelector("canvas");
ctx = canvas.getContext("2d");
var cw = (canvas.width = 350);
var ch = (canvas.height = 255);
ctx.fillStyle = "#0673e0"

// construye el array de barras
var barras = [];
var bNum = 25;

for (var i = 0; i < bNum; i++) {
  var barra = {};
  barra.w = cw / bNum;
  barra.h = 0;
  barra.x = i * barra.w;
  barra.y = ch;
  barras.push(barra);
}

// Creamos una función que genera una nueva fotograma
function Fotograma() {
  requestId = window.requestAnimationFrame(Fotograma);
  /*el método getByteFrequencyData() toma como argumento un array de tipo Uint8Array*/
  analizador.getByteFrequencyData(dataArray);
  ctx.clearRect(0, 0, cw, ch);
  // la doble tilde (~~) es un operador equivalente a Math.floor() o casi
  var n = ~~(analizador.frequencyBinCount / bNum);
  for (var i = 0; i < barras.length; i++) {
    barras[i].h = -dataArray[i * n]; // altura negativa!!
    ctx.beginPath();
    ctx.fillRect(barras[i].x, barras[i].y, barras[i].w - 1, barras[i].h);
  }
}
// llama la función fotograma para iniciar la animación
Fotograma();
