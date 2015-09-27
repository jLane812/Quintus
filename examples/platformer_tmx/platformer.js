// # Quintus platformer example
//
// [Run the example](../quintus/examples/platformer/index.html)
// WARNING: this game must be run from a non-file:// url
// as it loads a level json file.
//
// This is the example from the website homepage, it consists
// a simple, non-animated platformer with some enemies and a 
// target for the player.
window.addEventListener("load",function() {

// Set up an instance of the Quintus engine  and include
// the Sprites, Scenes, Input and 2D module. The 2D module
// includes the `TileLayer` class as well as the `2d` componet.
var Q = window.Q = Quintus()
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX")
        // Maximize this game to whatever the size of the browser is
        .setup({ maximize: true })
        // And turn on default input controls and touch input (for UI)
        .controls().touch()

Q.component("missile", {
  added: function() {
    this.entity.on("step", "handleFiring");
  },
  extend: {
    handleFiring: function(dt) {
      if (this.p.canFire && Q.inputs.fire) {
        if (this.p.direction === 'right') {
          console.log("Direction right");
          var missile = Q.stage().insert(new Q.Missile({
            x: this.p.x+5, y: this.p.y
          }));
        }
        this.p.canFire = false;
      } else if (Q.inputs.fire) {
        console.log("You already fired the missle. Nice try.");
      }
    }
  }
});


// ## Player Sprite
// The very basic player sprite, this is just a normal sprite
// using the player sprite sheet with default controls added to it.
Q.Sprite.extend("Player",{

  // the init constructor is called on creation
  init: function(p) {

    // You can call the parent's constructor with this._super(..)
    this._super(p, {
      sheet: "player",  // Setting a sprite sheet sets sprite width and height
      jumpSpeed: -400,
      speed: 300
    });

    this.add('2d, platformerControls, missile');

    this.on("hit.sprite",function(collision) {

      if(collision.obj.isA("Tower")) {
        Q.stageScene("endGame",1, { label: "You Won!" }); 
        this.destroy();
      }
    });
  }
});

Q.Sprite.extend("Missile", {
  init: function(p) {
    console.log("creating Missile");
    this._super(p,{
      sheet: "missile",
      angle: 0,
      speed : 30,
    });
    //this.on('hit','erase');
  },
  step: function(dt){
    //this.stage.collide(this);
    console.log("Missile step")
    if(this.p.angle === 0){
      this.p.x += this.p.speed * dt;
    }
    else if(this.p.angle === 180){
      this.p.x -= this.p.speed * dt;
    }
    //if(this.p.y > Q.el.height || this.p.y < 0){
    //  this.destroy();
    //}
  }, 
  sensor: function() {
    //this.destroy();
  },
  erase: function(collision) {
    //this.debind();
    //this.destroy();
  }
});

// ## Tower Sprite
// Sprites can be simple, the Tower sprite just sets a custom sprite sheet
Q.Sprite.extend("Tower", {
  init: function(p) {
    this._super(p, { sheet: 'tower' });
  }
});

// ## Power Up
Q.Sprite.extend("PowerUp", {
  init: function(p) {
    this._super(p, { sheet: 'powerUp'});

    this.add('2d');

    this.on("bump.top,bump.left,bump.right,bump.bottom",function(collision) {
      if(collision.obj.isA("Player")) {
        collision.obj.p.canFire = true; 
        console.log(collision.obj.p);
        this.destroy();
      }
    });
  }
});

// ## Enemy Sprite
// Create the Enemy class to add in some baddies
Q.Sprite.extend("Enemy",{
  init: function(p) {
    this._super(p, { sheet: 'enemy', vx: 100, visibleOnly: true, type: Q.SPRITE_ENEMY });

    this.add('2d, aiBounce');

    this.on("bump.left,bump.right,bump.bottom",function(collision) {
      if(collision.obj.isA("Player")) { 
        Q.stageScene("endGame",1, { label: "You Died" }); 
        collision.obj.destroy();
      }
    });

    this.on("bump.top",function(collision) {
      if(collision.obj.isA("Player")) { 
        this.destroy();
        collision.obj.p.vy = -300;
      }
    });
  }
});

// ## level1 scene
// Create a new scene called level1
Q.scene("level1",function(stage) {
  Q.stageTMX("level1.tmx",stage);
  stage.add("viewport").follow(Q("Player").first());
});


Q.scene('endGame',function(stage) {
  var container = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));

  var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                  label: "Play Again" }))         
  var label = container.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
                                                   label: stage.options.label }));
  button.on("click",function() {
    Q.clearStages();
    Q.stageScene('level1');
  });

  container.fit(20);
});


// Load one or more TMX files
// and load all the assets referenced in them
Q.loadTMX("level1.tmx, sprites.json", function() {
  Q.compileSheets("sprites.png","sprites.json");
  Q.stageScene("level1");
});

// ## Possible Experimentations:
// 
// The are lots of things to try out here.
// 
// 1. Modify level.json to change the level around and add in some more enemies.
// 2. Add in a second level by creating a level1.json and a level1 scene that gets
//    loaded after level1 is complete.
// 3. Add in a title screen
// 4. Add in a hud and points for jumping on enemies.
// 5. Add in a `Repeater` behind the TileLayer to create a paralax scrolling effect.

});
