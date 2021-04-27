let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let input = document.getElementById("input");
let download = document.getElementById("download");
let width = 825;
let height = 600;
canvas.height = height;
canvas.width = width;
ctx.lineWidth = 1;

var ruta = true;
var rutaOn= false;
var goma = false;
var gomaTrazando = false;
function dibujar(event) {
  x = oMousePos(canvas, event).x;
  y = oMousePos(canvas, event).y;
  console.log("ruta: "+ruta , "goma: " +goma, "gomaTrazando: " +gomaTrazando);

  if (rutaOn == true) {
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  if( gomaTrazando == true){
    ctx.clearRect(x-10, y-10, 20,20);
  }
}

function oMousePos(canvas, evt) {
  var ClientRect = canvas.getBoundingClientRect();
  return {
    x: Math.round(evt.clientX - ClientRect.left),
    y: Math.round(evt.clientY - ClientRect.top),
  };
}

canvas.addEventListener("mousemove", dibujar);

canvas.addEventListener("mousedown", function () {
  if(goma == true){
    gomaTrazando = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
    canvas.addEventListener("mousemove", dibujar);
  }
  if(ruta == true){
    rutaOn =true;
    ctx.beginPath();
    ctx.moveTo(x, y);
    canvas.addEventListener("mousemove", dibujar);
  }
   
});
canvas.addEventListener("mouseup", function () {
  rutaOn = false;
  gomaTrazando = false;
});
canvas.addEventListener("mouseout", function () {
  rutaOn = false;
  gomaTrazando = false;

});
function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b),
      min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
      h = s = 0; // achromatic
  } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
          case r:
              h = (g - b) / d + (g < b ? 6 : 0);
              break;
          case g:
              h = (b - r) / d + 2;
              break;
          case b:
              h = (r - g) / d + 4;
              break;
      }
      h /= 6;
  }

  return [h, s, l];
}
function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
      r = g = b = l; // achromatic
  } else {
      var hue2rgb = function hue2rgb(p, q, t) {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
      }

      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
function colorLinea(color) {
  ctx.strokeStyle = color.value;
}
function anchoLinea(ancho) {
  ctx.lineWidth = ancho.value;
  document.getElementById("valor").innerHTML = ancho.value;
}
function limpiar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  input.value = "";
}
function applyFilter(filter) {
  var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var pixels = imgData.data;
  var numPixels = imgData.width * imgData.height;
  for (var i = 0; i < numPixels; i++) {
      var r = pixels[i * 4],
      g = pixels[i * 4 + 1],
      b = pixels[i * 4 + 2];

    if (filter == "bw") {
      var grey = (r + g + b) / 3;
      pixels[i * 4] = grey;
      pixels[i * 4 + 1] = grey;
      pixels[i * 4 + 2] = grey;
    }
    if (filter == "invertir") {
      pixels[i * 4] = 255 - r;
      pixels[i * 4 + 1] = 255 - g;
      pixels[i * 4 + 2] = 255 - b;
    }
    if (filter == "binarizacion") {
      let gray = 0.299 * r + 0.587 * g + 0.114 * b;
      if (gray > 120) {
        r = 255;
        g = 255;
        b = 255;
      } else {
        r = 0;
        g = 0;
        b = 0;
      }
      pixels[i * 4] = r;
      pixels[i * 4 + 1] = g;
      pixels[i * 4 + 2] = b;
    }
    if (filter == "brillo") {
      pixels[i * 4] = r + ( r * 0.1);
      pixels[i * 4 + 1] = g + ( g * 0.1);
      pixels[i * 4 + 2] = b + ( b * 0.1);
    }
    if(filter == "sepia"){
      pixels[i * 4] = (r * 0.393) + (g * 0.769) + (b * 0.189);
      pixels[i * 4 + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
      pixels[i * 4 + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
    }
    if(filter == "saturacion"){
        let hsl = rgbToHsl(r, g, b); //algoritmo sacado de internet
        hsl[1] += hsl[1] + .2;
        let rgb = hslToRgb(hsl[0], hsl[1], hsl[2]) //algoritmo sacado de internet

        pixels[i * 4] = rgb[0];
        pixels[i * 4 + 1] = rgb[1];
        pixels[i * 4 + 2] = rgb[2];
    }
  }
  ctx.putImageData(imgData, 0, 0);
}
function applyBlur() {
  let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let matrizBlur = [
      [1 / 9, 1 / 9, 1 / 9],
      [1 / 9, 1 / 9, 1 / 9],
      [1 / 9, 1 / 9, 1 / 9]
  ]

  for (let x = 0; x < imgData.width; x++) {
      for (let y = 0; y < imgData.height; y++) {
          pixelMatriz(imgData, x, y, matrizBlur)
      }
  }

  ctx.putImageData(imgData, 0, 0);
}
/////////////////////////////////////////////////////
function applyBorder() {
  let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var pixels = imgData.data;
  var numPixels = imgData.width * imgData.height;
  for (var i = 0; i < numPixels; i++) {
      var r = pixels[i * 4],
      g = pixels[i * 4 + 1],
      b = pixels[i * 4 + 2];

      var grey = (r + g + b) / 3;
      pixels[i * 4] = grey;
      pixels[i * 4 + 1] = grey;
      pixels[i * 4 + 2] = grey;
    }
  let matriz = [
      [-1, -1, -1],
      [-1, 4, -1],
      [-1, -1, -1]
  ]

  for (let x = 0; x < imgData.width; x++) {
      for (let y = 0; y < imgData.height; y++) {
          pixelMatriz(imgData, x, y, matriz)
      }
  }

  ctx.putImageData(imgData, 0, 0);
}
function activarGoma(){
  goma = true;
  ruta = false;
}
function activarLapiz(){
  ruta = true;
  goma = false;
}
let pixelMatriz = (imgData, x, y, matriz) => {
  //Variables de ubicacion de pixel
  let ul = ((x - 1 + imgData.width) % imgData.width + imgData.width * ((y - 1 + imgData.height) % imgData.height)) * 4;
  let uc = ((x - 0 + imgData.width) % imgData.width + imgData.width * ((y - 1 + imgData.height) % imgData.height)) * 4;
  let ur = ((x + 1 + imgData.width) % imgData.width + imgData.width * ((y - 1 + imgData.height) % imgData.height)) * 4;
  let ml = ((x - 1 + imgData.width) % imgData.width + imgData.width * ((y + 0 + imgData.height) % imgData.height)) * 4;
  let mc = ((x - 0 + imgData.width) % imgData.width + imgData.width * ((y + 0 + imgData.height) % imgData.height)) * 4;
  let mr = ((x + 1 + imgData.width) % imgData.width + imgData.width * ((y + 0 + imgData.height) % imgData.height)) * 4;
  let ll = ((x - 1 + imgData.width) % imgData.width + imgData.width * ((y + 1 + imgData.height) % imgData.height)) * 4;
  let lc = ((x - 0 + imgData.width) % imgData.width + imgData.width * ((y + 1 + imgData.height) % imgData.height)) * 4;
  let lr = ((x + 1 + imgData.width) % imgData.width + imgData.width * ((y + 1 + imgData.height) % imgData.height)) * 4;

  let p0, p1, p2, p3, p4, p5, p6, p7, p8

  p0 = imgData.data[ul] * matriz[0][0];
  p1 = imgData.data[uc] * matriz[0][1];
  p2 = imgData.data[ur] * matriz[0][2];
  p3 = imgData.data[ml] * matriz[1][0];
  p4 = imgData.data[mc] * matriz[1][1];
  p5 = imgData.data[mr] * matriz[1][2];
  p6 = imgData.data[ll] * matriz[2][0];
  p7 = imgData.data[lc] * matriz[2][1];
  p8 = imgData.data[lr] * matriz[2][2];
  let red = (p0 + p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8);

  p0 = imgData.data[ul + 1] * matriz[0][0]
  p1 = imgData.data[uc + 1] * matriz[0][1];
  p2 = imgData.data[ur + 1] * matriz[0][2];
  p3 = imgData.data[ml + 1] * matriz[1][0];
  p4 = imgData.data[mc + 1] * matriz[1][1];
  p5 = imgData.data[mr + 1] * matriz[1][2];
  p6 = imgData.data[ll + 1] * matriz[2][0];
  p7 = imgData.data[lc + 1] * matriz[2][1];
  p8 = imgData.data[lr + 1] * matriz[2][2];
  let green = (p0 + p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8);

  p0 = imgData.data[ul + 2] * matriz[0][0];
  p1 = imgData.data[uc + 2] * matriz[0][1];
  p2 = imgData.data[ur + 2] * matriz[0][2];
  p3 = imgData.data[ml + 2] * matriz[1][0];
  p4 = imgData.data[mc + 2] * matriz[1][1];
  p5 = imgData.data[mr + 2] * matriz[1][2];
  p6 = imgData.data[ll + 2] * matriz[2][0];
  p7 = imgData.data[lc + 2] * matriz[2][1];
  p8 = imgData.data[lr + 2] * matriz[2][2];
  let blue = (p0 + p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8);

  imgData.data[mc] = red;
  imgData.data[mc + 1] = green;
  imgData.data[mc + 2] = blue;
  imgData.data[mc + 3] = imgData.data[lc + 3];
}
input.addEventListener("change", function () {
  var reader = new FileReader();
  reader.onload = () => {
    let imagen = new Image();
    imagen.src = reader.result;
    imagen.onload = () => {
      ctx.drawImage(imagen, 0, 0, canvas.width, canvas.height);
      ctx.putImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
    };
  };
  reader.readAsDataURL(input.files[0]);
});
download.addEventListener("click", function () {
  let link = document.createElement('a');
  link.download = 'imagenEditada.png';
  link.href = canvas.toDataURL()
  link.click();
})