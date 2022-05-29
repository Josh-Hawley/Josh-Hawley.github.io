var canvas = document.getElementById("theCanvas");
console.log(canvas);
var c = theCanvas.getContext("2d");

var speedSlider = document.getElementById("speedSlider");
var speedReadout = document.getElementById("speedReadout");

// canvas.width = 300;
widthScale = 0.5;
heightScale = widthScale;
canvas.width = window.innerWidth*widthScale;
canvas.height = window.innerHeight*heightScale;
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
const N = 10;
const G = 1000;
const dt = 0.1; // time step
const radiusScale = 0.3;

const minMass = 10;
const maxMass = 60;
const sun = true;
const sunMass = 200;


for (let i = 0; i < N; i++) {
  var x = Math.random() * w;
  var y = Math.random() * h;
  var vx = 0*(Math.random() );
  var vy = 0*(Math.random() - 0.5);
  
  // if (sun) {
  //   if(x > w/2){
  //     x
  //   }
  // }

  

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
    radius = 40;
  }

  particles.push(new Particle(x, y, x0, y0, vx, vy, radius, m));
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
  canvas.width = window.innerWidth*widthScale;
  canvas.height = window.innerHeight*heightScale;
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
  
  this.contactTime = [];
  for(let n = 0; n < N; n++){
    this.contactTime.push(0);
  }

  // canvas.addEventListener("mousedown", this.moveParticle());
  

  this.draw = function(i) {

    aMag = Math.sqrt(this.ax*this.ax + this.ay*this.ay);
    aMax = 0.4;
    rVal = 255*aMag/aMax;
    aMag = Math.sqrt(this.ax*this.ax + this.ay*this.ay);
    aMax = 0.1*G;
    aNorm = aMag/aMax;
    if (aMag > aMax){
      aNorm = 1;
    } 
    // console.log(normP);
    // colVals = evaluate_cmap(aNorm, 'RdYlBu', true); // Colourmaps documentation at https://github.com/timothygebhard/js-colormaps
    // colVals = evaluate_cmap(aNorm, 'Spectral', true);
    // colVals = evaluate_cmap(aNorm, 'viridis', false);
    colVals = evaluate_cmap(aNorm, 'cubehelix', false);
    // colVals = evaluate_cmap(aNorm, 'gist_stern', false);
    // let colVals = evaluate_cmap(aNorm, 'rainbow', true);
    
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

