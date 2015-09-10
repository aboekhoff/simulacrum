Object.copy = function(obj) {
  var newObj = obj.constructor();
  for (var v in obj) {
    if (obj.hasOwnProperty(v)) {
      newObj[v] = obj[v];
    }
  }
  return newObj;
}

function randomFloat(min, max) {
  if (max == null) {
    max = min; min = 0;
  }
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(randomFloat(min, max));
}

function imageToImageData(image) {
  var canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  var ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function flipImageHorizontal(image) {
  var c1 = document.createElement('canvas');
  c1.width = image.width; c1.height = image.height;

  var ctx1 = c1.getContext('2d');
  ctx1.drawImage(image, 0, 0);
  var d1 = ctx1.getImageData(0, 0, image.width, image.height);
  var d2 = ctx1.getImageData(0, 0, image.width, image.height);

  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var offset = (y * image.width + x) * 4;
      var offsetOrig = (y * image.width + (image.width - 1 - x)) * 4;
      for (var i=0; i<4; i++) {
        d2.data[offset+i] = d1.data[offsetOrig+i];
      }
    }
  }

  ctx1.putImageData(d2, 0, 0);
  return c1;
}

// why not invert the problem?
// find the grid of completely empty lines and the sprites must lie between

function toPixel(r, g, b, a) {
  return (r << 24) | (g << 16) | (b << 8) | a;
}

function computeOffsets(img) {
  var imgData = imageToImageData(img);
  var ys = scanHorizontal(imgData).flatten(); ys = ys.slice(1, ys.length-1);
  var xs = scanVertical(imgData).flatten(); xs = xs.slice(1, xs.length-1);

  function transform(arr) {
    var res = [];
    for (var i=0; i<arr.length; i+=2) {
      var a = arr[i];
      var b = arr[i+1];
      if (a != null && b != null) {
        res.push([a, Math.abs(b-a)]);
      }
    }
    return res;
  }

  var xs = transform(xs);
  var ys = transform(ys);

  var sprites = [];

  for (var i=0; i<ys.length; i++) {
    for (var j=0; j<xs.length; j++) {
      var y = ys[i][0];
      var x = xs[j][0];
      var height = ys[i][1];
      var width = xs[j][1];
      sprites.push({x: x, y: y, width: width, height: height })
    }
  }

  return sprites;
}

function scanHorizontal(imageData) {
  var data = imageData.data;
  var width = imageData.width;
  var height = imageData.height;

  var transparent = toPixel(data[0], data[1], data[2], data[3]);
  var result = [];
  var region = null;

  for (var y=0; y<height; y++) {
    isTransparent = true;
    for (var x=0; x<width; x++) {
      var i = (y * width * 4) + (x * 4);
      var p = toPixel(data[i], data[i+1], data[i+2], data[i+3]);
      if (p != transparent) { isTransparent = false; break; }
    }
    if (isTransparent && region == null) {
      region = [y];
    }
    else if ((!isTransparent || y == height-1) && region) {
      region.push(y - 1);
      result.push(region);
      region = null;
    }
  }

  return result;
}

function scanVertical(imageData) {
  var data = imageData.data;
  var width = imageData.width;
  var height = imageData.height;

  var transparent = toPixel(data[0], data[1], data[2], data[3]);
  var result = [];
  var region = null;

  for (var x=0; x<width; x++) {
    isTransparent = true;
    for (var y=0; y<height; y++) {
      var i = (y * width * 4) + (x * 4);
      var p = toPixel(data[i], data[i+1], data[i+2], data[i+3]);
      if (p != transparent) { isTransparent = false; break; }
    }
    if (isTransparent && region == null) {
      region = [x];
    }
    else if ((!isTransparent || x == width-1) && region) {
      region.push(x - 1);
      result.push(region);
      region = null;
    }
  }

  return result;
}

Array.flatten = function(arr, recursive) {
  function _flatten(obj, res, depth, recursive) {
    if (obj instanceof Array && (depth <= 1 || recursive)) {
      for (var i=0; i<obj.length; i++) {
        _flatten(obj[i], res, depth + 1, recursive);
      }
    } else {
      res.push(obj);
    }
  }

  var res = [];
  _flatten(arr, res, 0, recursive);
  return res;
}

Array.prototype.flatten = function(recursive) {
  return Array.flatten(this, recursive);
}
