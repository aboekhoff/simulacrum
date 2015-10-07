var game = Tetryon.create();

// setup input here
game.input.add.button('UP', Tetryon.Keyboard.UP);
game.input.add.button('RIGHT', Tetryon.Keyboard.RIGHT);
game.input.add.button('DOWN', Tetryon.Keyboard.DOWN);
game.input.add.button('LEFT', Tetryon.Keyboard.LEFT);
//

game.resources.characters = {
  cache: {},
  get: function(name) {
    return this.cache[name];
  },
  load: function(name) {
    if (this.cache[name]) {
      return;
    }

    var root = 'assets/rpg/'
    var upPath = root + 'human-back/full-sheet/' + name + '.png';
    var downPath = root + 'human-front/full-sheet/' + name + '.png';
    var leftPath = root + 'human-side/full-sheet/' + name + '.png';

    game.resources.onReady(function() {
      var up = game.resources.get(upPath);
      var down = game.resources.get(downPath);
      var left = game.resources.get(leftPath);
      var right = flipImageHorizontal(left);

      var frames = [
        {x: 0, y:0, width: 16, height: 16},
        {x: 16, y:0, width: 16, height: 16},
        {x: 32, y:0, width: 16, height: 16},
        {x: 48, y:0, width: 16, height: 16}
      ];

      game.resources.characters.cache[name] = {
        up: up,
        left: left,
        right: right,
        down: down,
        animations: {
          up: { name: 'up', resource: up, frames: frames},
          left: { name: 'left', resource: left, frames: frames },
          right: { name: 'right', resource: right, frames: frames },
          down: { name: 'down', resource: down, frames: frames }
        }
      }
    });

    game.resources.load(upPath);
    game.resources.load(downPath);
    game.resources.load(leftPath);
  }
}

var AVATARS = ['ninja1', 'wizard1', 'templar1', 'adventurer_m1', 'adventurer_f1', 'mage1', 'thief1', 'hunter1'];
AVATARS.forEach(function(name) {
  game.resources.characters.load(name);
});

game.resources.load('map', 'assets/map.txt')

game.resources.onReady(function() {
  game.canvas = document.createElement('canvas');
  game.canvas.width = window.innerWidth;
  game.canvas.height = window.innerHeight;

  document.body.appendChild(game.canvas);
  init();
});

game.engine.addComponentTypes({
  transform: {x: 0, y: 0, scale: 1},
  velocity: {x: 0, y: 0},
  avatar: { name: "adventurer_m1" },
  spriteAnimation: {
    name: null,
    resource: null,
    frames: null,
    speed: 0.1, // seconds per frame
    currentFrame: 0,
    elapsed: 0,
    paused: false
  },
  sprite: {
    resource: null,
    x: 0,
    y: 0,
    width: 0,
    height: 0
  }
});

game.engine.addSystems({
  physics: {
    dependencies: ['transform', 'velocity'],
    each: function(entity) {
      var t = entity.get('transform');
      var v = entity.get('velocity');
      t.x += v.x * game.time.elapsed;
      t.y += v.y * game.time.elapsed;

      if (t.x < 0) {t.x = 0; v.x *= - 1}
      else if (t.x > game.canvas.width) {t.x = game.canvas.width; v.x *= -1}
      if (t.y < 0) {t.y = 0; v.y *= -1}
      else if (t.y > game.canvas.height) {t.y = game.canvas.height; v.y *= -1}
    }
  },

  animationSelection: {
    dependencies: ['avatar', 'velocity', 'spriteAnimation'],
    each: function(entity) {
      var a = entity.get('avatar');
      var v = entity.get('velocity');
      var s = entity.get('spriteAnimation');
      var dir = null;
      var alpha = 0
      if (Math.abs(v.x) > alpha) {
        alpha = Math.abs(v.x);
        dir = v.x > 0 ? 'right' : 'left';
      }
      if (Math.abs(v.y) > alpha) {
        alpha = Math.abs(v.y);
        dir = v.y > 0 ? 'down' : 'up';
      }
      if (alpha > 0 && s.name !== dir) {
        var animation = game.resources.characters.cache[a.name].animations[dir];
        s.name = animation.name;
        s.resource = animation.resource;
        s.speed = 0.16;
        s.frames = animation.frames;
        s.currentFrame = 0;
        s.paused = false;
        s.elapsed = 0;
      }
    }
  },

  spriteAnimation: {
    dependencies: ['spriteAnimation', 'sprite'],
    each: function(entity) {
      var a = entity.get('spriteAnimation');
      var s = entity.get('sprite');

      if (s.paused) { return; }

      var duration = (a.frames.length) * a.speed;

      a.elapsed += game.time.elapsed;

      // reset the counter
      while (a.elapsed > duration) {
        a.elapsed -= duration;
      }

      var frameIndex = Math.floor(a.elapsed / a.speed);
      var frame = a.frames[frameIndex];

      s.resource = a.resource;
      s.x = frame.x;
      s.y = frame.y;
      s.width = frame.width;
      s.height = frame.height;
      s.flip = a.flip;
    }
  },

  render: {
    dependencies: ['transform', 'sprite'],

    init: function() {

    },

    drawCell: function(x, y, z, color) {

    },

    generateMapImage: function() {
      // if map is dyanmic check for changes

      // only one map now
      var mapTxt = game.resources.get('map').trim();
      var mapContent = mapTxt.split('\n');
      var mapHeight = mapContent.length;
      var mapWidth = mapContent[0].length;

      // var xScale = game.canvas.width/mapWidth;
      // var yScale = game.canvas.height/mapHeight;


    },

    renderMap: function() {
      if (!this.mapImage) {
        this.generateMapImage();
      }
      this.ctx.drawImage(this.mapImage, 0, 0);
    },

    before: function(_) {
      this.ctx = game.canvas.getContext('2d');
      this.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
      this.renderMap();
    },

    each: function(entity) {
      var t = entity.get('transform');
      var s = entity.get('sprite');
      var img = s.resource;

      var scaleWidth = s.width * t.scale;
      var scaleHeight = s.height * t.scale;

      this.ctx.drawImage(
        img,
        s.x,
        s.y,
        s.width,
        s.height,
        t.x - scaleWidth/2,
        t.y - scaleHeight/2,
        scaleWidth,
        scaleHeight
      )

      if (s.flip) {
        this.ctx.restore();
      }
    }
  }
})

function init() {
  var scale = 2;
  var numCharacters = 0;
  var minVelocity = -80;
  var maxVelocity = 80;

  var ctx = game.canvas.getContext('2d');
  ctx.webkitImageSmoothingEnabled = false;
  ctx.mozImageSmoothing = false;
  ctx.imageSmoothingEnabled = false;

  for (var i=0; i<numCharacters; i++) {
    var avatar = AVATARS[randomInt(0, AVATARS.length)];
    game.engine.entity()
      .add('transform', {x:game.canvas.width/2, y:game.canvas.height/2, scale: scale})
      .add('velocity', {x: randomFloat(minVelocity, maxVelocity), y: randomFloat(minVelocity, maxVelocity)})
      .add('avatar', {name: avatar})
      .add('spriteAnimation')
      .add('sprite')
  }
  //
  // for (var v in game.resources.characters.cache) {
  //   var ctx = game.canvas.getContext('2d');
  //   var animations = game.resources.characters.cache[v].animations;
  //
  //   for (var v in animations) {
  //     var anim = animations[v];
  //     game.engine.entity()
  //       .add('transform', {x: x, y: y, scale: scale})
  //       .add('spriteAnimation', {resource: anim.resource, frames: anim.frames, speed: 0.16})
  //       .add('sprite');
  //       y += 16 * scale;
  //   }
  // }

  game.start();
}
