//To do:
// Make drag use acceleration instead of absolute position
// Push and pop numbers of particles with slider
// Slider for gravity strength
// Add collisions?

var canvas = document.getElementById("theCanvas");
console.log(canvas);
var c = theCanvas.getContext("2d");

var speedSlider = document.getElementById("speedSlider");
var speedReadout = document.getElementById("speedReadout");

// canvas.width = 300;
widthScale = 0.75;
heightScale = 0.75;
maxWidth = 800;
if (window.innerWidth*widthScale > maxWidth){
  canvas.width = maxWidth;
} else{
  canvas.width = window.innerWidth*widthScale;
}

var currentWindowWidth = window.innerWidth;

canvas.height = canvas.width;
w = canvas.width;
h = canvas.height;

var mouse = {
  x: undefined,
  y: undefined
}

window.addEventListener("mousemove", function(event){
  mouse.x = event.layerX
  mouse.y = event.layerY
})
canvas.addEventListener("touchmove", function(event){
  var touch = event.touches[0];
  console.log(touch);
  mouse.x = touch.clientX - canvas.offsetLeft
  mouse.y = touch.clientY - canvas.offsetTop
})




let dragging = false;
var dragCellIdx = -1;
var particles = [];

// const N = 5;
var N = Number(sliderN.value);
var currentN = N;
const dt = 0.3; // time step
const radiusScale = 0.1;


var G = Number(sliderG.value);
function showG() {
  readoutG.innerHTML = sliderG.value;
  G = Number(sliderG.value);
}

var M = Number(sliderM.value); //Trail length
function showM() {
  readoutM.innerHTML = sliderM.value;
  M = Number(sliderM.value);
}


// Parameters 
// const G = 1000;
const minMass = 30;
const maxMass = 100;
const sun = true;
const sunMass = 300;

// Trails parameters
// const M = 25; // Number of past positions to store



for (let i = 0; i < N; i++) {
  // var x = Math.random() * w;
  // var y = Math.random() * h;
  var x = w*0.7*(Math.random()-0.5) + w/2;
  var y = h*0.7*(Math.random()-0.5) + h/2;
  var vx = 30*(Math.random() - 0.5);
  var vy = 30*(Math.random() - 0.5);

  var x0 = x;
  var y0 = y;
  var m = (maxMass-minMass)*Math.random() + minMass;
  var radius= m*radiusScale;

  if (sun && i==0){
    x = w/2;
    y = h/2;
    vx = 0;
    vy = 0;
    m = sunMass;
    radius = 30;
  }

  particles.push(new Particle(x, y, x0, y0, vx, vy, radius, m));
}

// Add and remove particles
function showN() {
  readoutN.innerHTML = sliderN.value-1;
  N = Number(sliderN.value);

  if (N < currentN){
    for (let i = 0; i < currentN-N; i++){
      console.log(i)
      particles.pop();
    }
    currentN=N;
  }

  if (N > currentN){
    for (let i = 0; i < N-currentN; i++){
      var x = w*0.7*(Math.random()-0.5) + w/2;
      var y = h*0.7*(Math.random()-0.5) + h/2;
      var vx = 30*(Math.random() - 0.5);
      var vy = 30*(Math.random() - 0.5);

      var x0 = x;
      var y0 = y;
      var m = (maxMass-minMass)*Math.random() + minMass;
      var radius= m*radiusScale;
      particles.push(new Particle(x, y, x0, y0, vx, vy, radius, m));
    }
    currentN=N;
  }
}



window.addEventListener("mousedown", findCell, false);
window.addEventListener("touchstart", findCell, false);

window.addEventListener("mouseup", e => {
  dragging = false;
}, false);
window.addEventListener("touchend", e => {
  dragging = false;
}, false);

function findCell(){
  
  let i = 0;
  // find a cell that the mouse overlaps with
  while (i<N){
      let dXmouse = particles[i].x - mouse.x;
      let dYmouse = particles[i].y - mouse.y;
      let mouseDist = Math.sqrt(dXmouse*dXmouse + dYmouse*dYmouse);

      if (mouseDist < particles[i].radius){
        dragging = true;
        dragCellIdx = i;
        break;
      }
      i++;
  }
}



animate();

function animate(){

  requestAnimationFrame(animate);
  c.clearRect(0, 0, w, h); // clear canvas

  if(currentWindowWidth != window.innerWidth){
    console.log('rescale');
    if (window.innerWidth*widthScale > maxWidth){
      canvas.width = maxWidth;
    } else{
      canvas.width = window.innerWidth*widthScale;
    }
    particles[0].x = w/2;
    particles[0].y = h/2;
    currentWindowWidth = window.innerWidth;
  }
  
  canvas.height = canvas.width;
  
  w = canvas.width;
  h = canvas.height;

  for(i = 0; i < N; i++){
    // particles.repel(particles, i);
    
    particles[i].update(particles, i);
    // particles[i].lateralInhibition(particles,i);
    particles[i].draw(i);

    }


}




function Particle (x, y, x0, y0, vx, vy, radius, m){
  this.x = x;           // x-position of cell
  this.y = y;           // y-position of cell
  this.x0 = x0;         // Desired x-location of cell (spring restoring force to this location)
  this.y0 = y0;         // Desired y-location of cell (spring restoring force to this location)
  this.vx = vx;         // x velocity
  this.vy = vy;         // y velocity
  this.ax = 0;          // x acceleration
  this.ay = 0;          // y acceleration
  
  this.m = m;
  this.radius = radius; // Radius of particle
  this.p = Math.random(); // Initial protein expresion
  
  this.xTrail = [];
  this.yTrail = [];
  this.trailColour = [];
  this.trailColVals = [];
  this.xTrail.push(this.x);
  this.yTrail.push(this.y);
  


//__________________________________________________________________//

  this.draw = function(i) {




    

    aMag = Math.sqrt(this.ax*this.ax + this.ay*this.ay);
    aMax = 0.4;
    rVal = 255*aMag/aMax;
    aMag = Math.sqrt(this.ax*this.ax + this.ay*this.ay);
    aMax = 0.004*G*N;
    aNorm = aMag/aMax;
    if (aMag > aMax){
      aNorm = 1;
    } 
    // console.log(normP);
    // colVals = evaluate_cmap(aNorm, 'RdYlBu', true); // Colourmaps documentation at https://github.com/timothygebhard/js-colormaps
    // colVals = evaluate_cmap(aNorm, 'Spectral', true);
    // colVals = evaluate_cmap(aNorm, 'viridis', false);
    // colVals = evaluate_cmap(aNorm, 'cubehelix', false);
    // colVals = evaluate_cmap(aNorm, 'gist_stern', false);
    // colVals = evaluate_cmap(aNorm, 'YlGnBu', true);
    // colVals = evaluate_cmap(aNorm, 'RdPu', true);
    // colVals = evaluate_cmap(aNorm, 'rainbow', true);
    colVals = evaluate_cmap(aNorm, 'gist_earth', false);
    

        //Update trail
    if (this.xTrail.length < M){
      this.xTrail.push(this.x);

      this.yTrail.push(this.y);

      this.trailColVals.push(colVals);


    } 
    
    else {
      this.xTrail.shift()
      this.xTrail.push(this.x);

      this.yTrail.shift()
      this.yTrail.push(this.y);

      this.trailColVals.shift();
      this.trailColVals.push(colVals);
      
    }

    if (this.xTrail.length > M){
      for (let i = 0; i < this.xTrail.length-M; i++){
        this.xTrail.shift();
        this.yTrail.shift();
        this.trailColVals.shift(colVals);
      }
    }


    // Draw trail
    for (let m = 0; m < this.xTrail.length-1; m++){
      
      var x1 = this.xTrail[m];
      var x2 = this.xTrail[m+1];
      var y1 = this.yTrail[m];
      var y2 = this.yTrail[m+1];
      
      var alpha = m/(this.xTrail.length-1);
      // console.log(m)
      // this.trailColour = "rgb(0, 0, 0, "+ alpha +")";
      var trailColVal = this.trailColVals[m];
      this.trailColour = "rgb("+ Number(trailColVal[0]) +", "+ Number(trailColVal[1]) +", "+ Number(trailColVal[2]) +","+ alpha +")";
    
      
      // console.log(this.trailColour)

      if(i>0){
      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo(x2, y2);

      c.strokeStyle = this.trailColour;
      c.lineWidth = 4;
      c.stroke();
      }
    }


    // Draw particle
    this.colour = "rgb("+ Number(colVals[0]) +", "+ Number(colVals[1]) +", "+ Number(colVals[2]) +")";
    
    if (sun && i==0){
      this.colour = "rgb(255, 220, 100)";
    }

    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI*2);

    c.strokeStyle = this.colour;
    c.fillStyle = this.colour; 
    c.stroke();
    c.fill();
  }

  this.update = function(particles, i) {

    if (i == 0){
      for (let n = 0; n < N; n++){
        particles[n].ax = 0;
        particles[n].ay = 0;
      }
      
    }

    if(dragCellIdx == i && dragging){
      this.x = mouse.x;
      this.y = mouse.y;
      this.x0 = mouse.x;
      this.y0 = mouse.y;
      this.vx = 0;
      this.vy = 0;
    } 

    this.attract(particles, i);
    // this.boundaries();

    this.vx += this.ax*dt;
    this.vy += this.ay*dt;

    if (sun && i==0){
      this.vx = 0;
      this.vy = 0;
    }

    this.x  += this.vx*dt;
    this.y  += this.vy*dt;


  }



  this.attract = function(particles, i) {
    for (let j = i+1; j < N; j++){

      let other = particles[j];

      let dx = other.x - this.x;
     
      let dy = other.y - this.y;
      let r = Math.sqrt(dx*dx + dy*dy);

      let F = G*this.m*other.m/(r*r);

      // Prevent infinite acceleration if particles cross paths
      let minDist = this.m+other.m;
      let maxF = G*this.m*other.m/(minDist*minDist);
      if (F > maxF) {
        F=maxF;
      }

      this.ax  += F*dx/(r*this.m);
      this.ay  += F*dy/(r*this.m);
      other.ax -= F*dx/(r*other.m);
      other.ay -= F*dy/(r*other.m);

      }
    }

    this.boundaries = function() {
      if(this.x > w){
        this.x = 0;
      }
      if(this.x < 0){
        this.x = w;
      }
      if(this.y > h){
        this.y = 0;
      }
      if(this.y < 0){
        this.y = h;
      }

    }

  }




function randColour(mapName) {


  if (mapName == "allColours"){
    colour = "rgb("+ Math.random()*255 +", "+ Math.random()*255 +", "+ Math.random()*255 +")";
  }

  if (mapName == "grey"){
    let val = Math.random()*255;
    colour = "rgb("+ val +", "+ val +", "+ val +")";
  }

  if (mapName == "bright"){
    let light = 0.8;
    colour = "rgb("+ (light*Math.random() + (1-light)) * 255 +", "+ (light*Math.random() + (1 - light)) * 255 +", "+ (light*Math.random() + (1 - light)) * 255 +")";
  }


  return colour;
}

