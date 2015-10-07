var xScale = 18;
var yScale = 18;

this.mapImage = document.createElement('canvas');
this.mapImage.width = game.canvas.width;
this.mapImage.height = game.canvas.height;

console.log(mapHeight, mapWidth, xScale, yScale);
console.log(game.canvas.width, game.canvas.height);

var baseColor = new Color(40, 40, 40);
var strokeColor = baseColor.lighten(40);
var frontColor = strokeColor.lighten(40);

var ctx = this.mapImage.getContext('2d');
for (var y=0; y<mapHeight; y++) {
  for (var x=0; x<mapWidth; x++) {
    var tile = mapContent[y][x];
    var colorChangePct = 60;
    var maxHeight = 4;

    function drawCube(x, y, height) {
      var stroke = strokeColor;
      var front = frontColor;
      var top = baseColor.lighten(colorChangePct * height);

      var step = yScale * (3/4);
      var offset = step * height;

      // draw front face (2/3 height of top face)
      ctx.strokeStyle = stroke;
      ctx.fillStyle = front;

      ctx.fillRect(x * xScale, (y * yScale) - offset, xScale, step);
      ctx.strokeRect(x * xScale+1, (y * yScale) - offset+1, xScale -1, step -1);

      // draw top face
      ctx.fillStyle = top;

      ctx.fillRect(x * xScale, (y * yScale) - offset - yScale, xScale, yScale);
      ctx.strokeRect(x * xScale+1, (y * yScale) - offset - yScale+1, xScale-1, yScale-1);
    }

    var h = 0;
    while (h <= tile) {
      drawCube(x, y, h);
      h++;
    }
  }
}
