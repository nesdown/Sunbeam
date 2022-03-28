"use strict";

const raysCount = 500;
const particlesCount = 500;
const { PI, cos, sin, abs, round } = Math;
const TAU = 2 * PI;
const rand = (n) => Math.random() * n;
const fadeInOut = (t, m) => abs(((t + 0.5 * m) % m) - 0.5 * m) / (0.5 * m);

let emitter, mouse;

class Mouse {
  constructor(x, y) {
    this.hover = false;
    this.targetPosition = new Vector2(
      0.5 * window.innerWidth,
      0.6 * window.innerHeight
    );

    this.position = new Vector2(
      0.5 * window.innerWidth,
      0.4 * window.innerHeight
    );

    window.addEventListener("mousemove", (e) => {
      this.targetPosition.x = e.clientX;
      this.targetPosition.y = e.clientY;
      this.hover = true;
    });

    window.addEventListener("mouseout", () => {
      this.targetPosition.x = 0.5 * window.innerWidth;
      this.targetPosition.y = 0.6 * window.innerHeight;
      this.hover = false;
    });

    window.addEventListener("resize", this.resize.bind(this));
  }
  resize() {
    this.targetPosition.x = 0.5 * window.innerWidth;
    this.targetPosition.y = 0.6 * window.innerHeight;
  }
  update() {
    this.position.lerp(this.targetPosition, 0.025);
  }
}

class Ray {
  constructor() {
    this.init();
  }
  init() {
    this.ttl = 100 + rand(200);
    this.life = 0;
    this.growth = round(rand(1)) ? 0.5 : -0.5;
    this.len = round(0.35 * window.innerHeight * rand(1)) + 100;
    this.width = 3 * rand(0.5);
    this.velocity = 0.25 - rand(0.5);
    this.position = {};
    this.position.start = new Vector2(
      window.innerWidth * rand(1),
      window.innerHeight * 0.5 + (15 - rand(30))
    );

    this.angle = this.position.start.angleTo(mouse.position);
    this.position.end = new Vector2(
      this.position.start.x + this.len * cos(this.angle),
      this.position.start.y + this.len * sin(this.angle)
    );

    this.hue = round(40 + rand(20));
    this.saturation = round(50 + rand(20));
  }
  color(ctx) {
    this.alpha = fadeInOut(this.life, this.ttl);

    let color1 = `hsla(${this.hue},100%,100%,0)`,
      color2 = `hsla(${this.hue},${this.saturation}%,70%,${this.alpha})`,
      color3 = `hsla(${this.hue},50%,70%,0)`,
      gradient = ctx.createLinearGradient(
        this.position.start.x,
        this.position.start.y,
        this.position.end.x,
        this.position.end.y
      );

    gradient.addColorStop(0, color1);
    gradient.addColorStop(0.25, color2);
    gradient.addColorStop(1, color3);

    return gradient;
  }
  update() {
    this.life++;
    this.len += this.growth;
    this.angle = mouse.position.angleTo(this.position.start);
    this.position.end.x = this.position.start.x + this.len * cos(this.angle);
    this.position.end.y = this.position.start.y + this.len * sin(this.angle);
    this.position.start.addScalarX(this.velocity);
    this.position.end.addScalarX(this.velocity);
    if (this.life > this.ttl) this.init();
  }
  draw(canvas) {
    canvas.line(
      this.position.start.x,
      this.position.start.y,
      this.position.end.x,
      this.position.end.y,
      this.width,
      this.color(canvas.buffer)
    );
  }
}

class Particle {
  constructor() {
    this.life = Math.round(rand(200));
    this.init();
  }
  init() {
    this.ttl = 100 + rand(300);
    this.radius = 3 + rand(3);
    this.position = new Vector2(
      window.innerWidth * rand(1),
      window.innerHeight * 0.5 + (15 - rand(30))
    );

    this.velocity = new Vector2(0.25 - rand(0.5), 0.25 - rand(0.5));
    this.hue = Math.round(50 + rand(20));
  }
  color(ctx) {
    this.alpha = 0.65 * this.wave;
    return `hsla(${this.hue},50%,75%,${this.alpha})`;
  }
  update() {
    this.life++;
    this.wave = fadeInOut(this.life, this.ttl);
    let nTheta =
      noise.simplex3(
        this.position.x * 0.0025,
        this.position.y * 0.0025,
        this.life * 0.0025
      ) * TAU;
    let mTheta = mouse.position.angleTo(this.position);
    this.velocity
      .lerp(
        {
          x: cos(nTheta),
          y: sin(nTheta)
        },

        0.05
      )
      .lerp(
        {
          x: cos(mTheta),
          y: sin(mTheta)
        },

        0.075
      );

    this.position.add(this.velocity);
    if (this.life > this.ttl) {
      this.life = 0;
      this.init();
    }
  }
  draw(canvas) {
    canvas.arc(
      this.position.x,
      this.position.y,
      this.radius * this.wave + 1,
      0,
      TAU,
      this.color(canvas.buffer)
    );
  }
}

class Canvas {
  constructor(selector) {
    this.element =
      document.querySelector(selector) ||
      (() => {
        let element = document.createElement("canvas");
        element.style = `position: absolute; width: 100vw; height: 100vh;`;
        document.body.appendChild(element);
        return element;
      })();
    this.ctx = this.element.getContext("2d");
    this.frame = document.createElement("canvas");
    this.buffer = this.frame.getContext("2d");
    this.dimensions = new Vector2();
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();
  }
  resize() {
    this.dimensions.x = this.frame.width = this.element.width =
      window.innerWidth;
    this.dimensions.y = this.frame.height = this.element.height =
      window.innerHeight;
  }
  clear() {
    this.ctx.clearRect(0, 0, this.dimensions.x, this.dimensions.y);
    this.buffer.clearRect(0, 0, this.dimensions.x, this.dimensions.y);
  }
  line(x1, y1, x2, y2, w, c) {
    this.buffer.beginPath();
    this.buffer.strokeStyle = c;
    this.buffer.lineWidth = w;
    this.buffer.moveTo(x1, y1);
    this.buffer.lineTo(x2, y2);
    this.buffer.stroke();
    this.buffer.closePath();
  }
  rect(x, y, w, h, c) {
    this.buffer.fillStyle = c;
    this.buffer.fillRect(x, y, w, h);
  }
  arc(x, y, r, s, e, c) {
    this.buffer.beginPath();
    this.buffer.fillStyle = c;
    this.buffer.arc(x, y, r, s, e);
    this.buffer.fill();
    this.buffer.closePath();
  }
  render() {
    this.ctx.drawImage(this.frame, 0, 0);
  }
  drawImage(image, x = 0, y = 0) {
    this.buffer.drawImage(image, x, y);
  }
}

class Emitter {
  constructor() {
    this.background = new Canvas(".background");
    this.canvas = new Canvas(".canvas");

    this.rayCount = raysCount;
    this.particlesCount = particlesCount;
    this.init();
  }
  init() {
    this.objects = [];
    for (let i = 0; i < this.rayCount; i++) {
      this.objects.push(new Ray());
    }
    for (let i = 0; i < this.particlesCount; i++) {
      this.objects.push(new Particle());
    }
  }
  drawBackground() {
    let color1 = "rgb(255,255,255)",
      color2 = "rgb(238, 205, 93)",
      gradient = this.canvas.buffer.createLinearGradient(
        0.5 * this.canvas.dimensions.x,
        0,
        0.5 * this.canvas.dimensions.x,
        this.canvas.dimensions.y
      );

      gradient.addColorStop(0, color1);
      gradient.addColorStop(0.5, color2);
      gradient.addColorStop(1, color1);

    // gradient.addColorStop(0, color1);
    // gradient.addColorStop(0.35, color2);
    // gradient.addColorStop(0.5, '#deb72f');
    // gradient.addColorStop(0.65, color2);
    // gradient.addColorStop(1, color1);
    this.background.rect(
      0,
      0,
      this.canvas.dimensions.x,
      this.canvas.dimensions.y,
      gradient
    );

    this.background.buffer.save();
    this.background.buffer.filter = "blur(6px)";
    this.background.buffer.globalCompositeOperation = "lighter";
    this.background.drawImage(this.canvas.frame);
    this.background.buffer.restore();
    this.background.render();
  }
  render() {
    this.canvas.clear();
    for (let i = 0; i < this.objects.length; i++) {
      this.objects[i].update();
      this.objects[i].draw(this.canvas);
    }
    this.canvas.render();
    this.drawBackground();
  }
}

function loop() {
  mouse.update();
  emitter.render();
  window.requestAnimationFrame(loop);
}

window.requestAnimationFrame = (() => {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

window.onload = () => {
  noise.seed(Math.round(2000 * rand(1)));
  mouse = new Mouse();
  emitter = new Emitter();
  loop();
};

// (function (window, document) {
//   //IIFE's are pretty neat http://benalman.com/news/2010/11/immediately-invoked-function-expression/
//   var canvas,
//     ctx, //main (visible) canvas/context
//     osCanvas,
//     osCtx, //offscreen canvas/context
//     rect,
//     height,
//     width,
//     objects,
//     numParticles,
//     numRays, //objects array + totals
//     pInput,
//     rInput,
//     rCount,
//     pCount,
//     title; //DOM elements

//   var Ray = function () {
//     this.ctx = osCtx; //locally cache offscreen 2d context for more effecient animation

//     this.angle = (85 * Math.PI) / 180; //105 deg in radians

//     this.init = function () {
//       this.velocity = 0.25 - Math.random() * 0.5; //velocity of x-axis
//       this.len = canvas.height / 2 + Math.random() * (canvas.height / 2); //length of ray between half and full window height
//       this.start = {
//         //start/top of ray
//         x: Math.random() * (canvas.width + 100) - 50,
//         y: 0
//       };
//       this.end = {
//         //end/bottom of ray
//         x: this.start.x + this.len * Math.cos(this.angle), //use sine and cosine to calculate end point based on start point, length and angle
//         y: this.start.y + this.len * Math.sin(this.angle) //start at point, add length then 'rotate' to final point by multiplying sine/cosine of angle
//       };
//       this.ttl = 100 + Math.random() * 200; //total lifespan of ray 'time to live'
//       this.life = 0; //current lifespan of ray
//       this.width = 0.5 + Math.random() * 4; //random width between 0.5 an 4.5
//       this.hue = Math.round(45 + Math.random() * 15).toString(); //random yellow hue between 45 and 60 (degrees)
//       this.saturation = Math.round(20 + Math.random() * 40).toString(); //random saturation between 40% and 60%
//     };

//     this.color = function () {
//       //generate gradient
//       var alpha = wave(this.life, this.ttl) * 0.005, //fade in/fade out alpha
//         color1 =
//           "hsla(" +
//           this.hue +
//           "," +
//           this.saturation +
//           "%," +
//           "60%," +
//           alpha.toString() +
//           ")", //start color of ray gradient
//         color2 = "hsla(50,20%,20%,0)", //bottom color of ray gradient (transparent)
//         gradient = ctx.createLinearGradient(
//           this.start.x,
//           this.start.y,
//           this.end.x,
//           this.end.y
//         );

//       gradient.addColorStop(0, color1);
//       gradient.addColorStop(1, color2);

//       return gradient;
//     };

//     this.draw = function () {
//       //draw the ray
//       this.ctx.beginPath();
//       this.ctx.strokeStyle = this.color();
//       this.ctx.lineWidth = this.width;
//       this.ctx.moveTo(this.start.x, this.start.y);
//       this.ctx.lineTo(this.end.x, this.end.y);
//       this.ctx.stroke();
//       this.ctx.closePath();
//     };

//     this.update = function () {
//       if (this.life > this.ttl) {
//         //re-initialize when lifespan expires
//         this.init();
//       }
//       this.life++; //add to current life
//       this.start.x += this.velocity; //move both ends of line
//       this.end.x += this.velocity;
//     };

//     this.init(); //initialize when new ray is created

//     return this; //return local scope
//   };

//   var Particle = function () {
//     this.ctx = osCtx; //locally cache offscren 2d context for more effecient animation

//     this.init = function () {
//       this.position = {
//         //random x,y position
//         x: Math.random() * width,
//         y: height / 2 + (Math.random() * height) / 2
//       };
//       this.velocity = {
//         //random velocity on x-axis and y-axis
//         x: 0.5 - Math.random() * 1,
//         y: 0.5 - Math.random() * 1
//       };
//       this.ttl = 100 + Math.random() * 200; //total lifespan of particle
//       this.life = 0; //current life of particle
//       this.size = 1 + Math.random() * 10; //random size
//     };

//     this.color = function () {
//       //generate hsla color
//       var alpha = wave(this.life, this.ttl) * 0.005, //fade in/fade out alpha
//         color = "hsla(50,50%,25%," + alpha.toString() + ")";
//       return color;
//     };

//     this.draw = function () {
//       //draw the particle
//       this.ctx.beginPath();
//       this.ctx.fillStyle = this.color();
//       this.ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
//       this.ctx.fill();
//       this.ctx.closePath();
//     };

//     this.update = function () {
//       if (this.life > this.ttl) {
//         this.init();
//       } else {
//         this.life++;
//         this.position.x += this.velocity.x;
//         this.position.y += this.velocity.y;
//       }
//     };

//     this.init(); //initialize when new particle is created

//     return this; //return local scope
//   };

//   function onResize() {
//     //allows for resizing without effecting previously drawn objects
//     rect = canvas.getBoundingClientRect();
//     height = rect.height;
//     width = rect.width;

//     canvas.height = osCanvas.height = height;
//     canvas.width = osCanvas.width = width;
//   }

//   function requestAnimationFrame() {
//     //vendor prefixing + fallback
//     return (
//       window.requestAnimationFrame ||
//       window.webkitRequestAnimationFrame ||
//       window.mozRequestAnimationFrame ||
//       window.oRequestAnimationFrame ||
//       window.msRequestAnimationFrame ||
//       function (callback) {
//         window.setTimeout(callback, 1000 / 60);
//       }
//     );
//   }

//   function wave(t, a) {
//     //function credit to http://stackoverflow.com/questions/26590800/how-can-we-increment-and-then-decrement-a-counter-without-conditionals
//     return Math.abs(((t + a / 2) % a) - a / 2);
//   }

//   function setTitle() {
//     //set title based on current objects being drawn
//     var titleStr;
//     if (numRays > 0 && numParticles > 0) titleStr = "Rays &amp; Particles";
//     else if (numRays > 0 && numParticles === 0) titleStr = "Rays";
//     else if (numRays === 0 && numParticles > 0) titleStr = "Particles";
//     else if (numRays === 0 && numParticles === 0) titleStr = "¯\\_(ツ)_/¯";

//     title.innerHTML = titleStr;
//   }

//   function createObjects() {
//     numRays = parseInt(rInput.value); //pull values from range inputs, convert to integers
//     numParticles = parseInt(pInput.value);

//     setTitle();

//     objects = [];

//     for (let i = 0; i < numRays; i++) {
//       //instantiate rays/particles
//       var ray = new Ray();
//       objects.push(ray);
//     }

//     for (let i = 0; i < numParticles; i++) {
//       var particle = new Particle();
//       objects.push(particle);
//     }
//   }

//   function render(c1, c2) {
//     c1.clearRect(0, 0, width, height); //clear previously drawn frames
//     c2.clearRect(0, 0, width, height);
//     c2.shadowBlur = 30; //add a 'glow' to rays/particles
//     c2.shadowColor = "white";
//     c2.globalCompositeOperation = "lighter"; //lighter composite operation for more of a 'glow'
//     for (var i = 0, len = objects.length; i < len; i++) {
//       //draw offscreen/update objects (rays and particles in same array)
//       var obj = objects[i];
//       obj.update();
//       obj.draw();
//     }
//     c1.drawImage(osCanvas, 0, 0); //copy offscreen canvas to main canvas
//   }

//   function loop() {
//     //animation loop
//     render(ctx, osCtx);
//     window.requestAnimationFrame(loop);
//   }

//   function init() {
//     //initialize canvas/globals
//     canvas = document.getElementById("canvas"); //main (on-screen) canvas / context
//     ctx = canvas.getContext("2d");

//     osCanvas = document.createElement("canvas"); //secondary (off-screen) canvas / context
//     osCtx = osCanvas.getContext("2d");

//     //get the DOM elements
//     title = document.getElementById("title");

//     rInput = document.getElementById("ray-input");
//     rCount = document.getElementById("ray-count");

//     rInput.oninput = function () {
//       rCount.innerHTML = "Rays: " + this.value.toString();
//       createObjects();
//     };

//     pInput = document.getElementById("particle-input");
//     pCount = document.getElementById("particle-count");

//     pInput.oninput = function () {
//       pCount.innerHTML = "Particles: " + this.value.toString();
//       createObjects();
//     };

//     onResize(); //set canvas size
//     createObjects(); //create rays/particles
//     loop(); //do a barrel roll
//   }

//   window.onload = init;
//   window.onresize = onResize;
//   window.requestAnimationFrame = requestAnimationFrame();
// })(this, document);
