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
const dt = 0.5; // time step
const radiusScale = 0.1;


const maxForce = 0.2;
// var cohesionCoeff = 0.2; 
// var alignCoeff = 0.2;
// var separationCoeff = 0.2;
const radius= 3;
var minSpeed = 1;
var desiredSpeed = 6;
var perceptionRadius = 50;


var cohesionCoeff = Number(sliderCoh.value);
function showCoh() {
  readoutCoh.innerHTML = sliderCoh.value;
  cohesionCoeff = Number(sliderCoh.value);
}

var alignCoeff = Number(sliderAlign.value);
function showAlign() {
  readoutAlign.innerHTML = sliderAlign.value;
  alignCoeff = Number(sliderAlign.value);
}

var separationCoeff = Number(sliderSep.value);
function showSep() {
  readoutSep.innerHTML = sliderSep.value;
  separationCoeff = Number(sliderSep.value);
}

var trailAlpha = Number(sliderM.value); //Trail length
function showM() {
  readoutM.innerHTML = sliderM.value;
  trailAlpha = Number(sliderM.value);
}


// Parameters 
const G = 1000;
const minMass = 30;
const maxMass = 30;
const sun = false;
const sunMass = 300;

// Trails parameters
// const M = 25; // Number of past positions to store



for (let i = 0; i < N; i++) {
  // var x = Math.random() * w;
  // var y = Math.random() * h;
  var x = w*0.7*(Math.random()-0.5) + w/2;
  var y = h*0.7*(Math.random()-0.5) + h/2;
  var vx = 2*desiredSpeed*(Math.random() - 0.5);
  var vy = 2*desiredSpeed*(Math.random() - 0.5);

  var x0 = x;
  var y0 = y;
  var m = (maxMass-minMass)*Math.random() + minMass;

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
  readoutN.innerHTML = sliderN.value;
  N = Number(sliderN.value);

  if (N < currentN){
    for (let i = 0; i < currentN-N; i++){
      // console.log(i)
      particles.pop();
    }
    currentN=N;
  }

  if (N > currentN){
    for (let i = 0; i < N-currentN; i++){
      var x = w*0.7*(Math.random()-0.5) + w/2;
      var y = h*0.7*(Math.random()-0.5) + h/2;
      var vx = 2*desiredSpeed*(Math.random() - 0.5);
      var vy = 2*desiredSpeed*(Math.random() - 0.5);

      var x0 = x;
      var y0 = y;
      var m = (maxMass-minMass)*Math.random() + minMass;
      
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
  // c.clearRect(0, 0, w, h); // clear canvas
  // c.fillStyle = 'rgba(15, 22, 26, 0.01)';
  // c.fillRect(0, 0, w, h);
  
  c.fillStyle = 'rgba(5, 5, 5,' + trailAlpha + ')';
  c.fillRect(0, 0, w, h);
  // c.fillStyle = 'rgba(15, 22, 26, 0.1)';
  // c.fillRect(0, 0, w, h);

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
  
  // canvas.height = canvas.width;
  
  w = canvas.width;
  h = canvas.width;

  

  for(i = 0; i < N; i++){
    
    particles[i].update(particles, i);
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

  this.density = 0;
  


//__________________________________________________________________//

  this.draw = function(i) {

    aMag = Math.sqrt(this.ax*this.ax + this.ay*this.ay);
    
    aMax = 0.002;
    // console.log(this.density)
    aMag = this.density;
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
    // colVals = evaluate_cmap(aNorm, 'gist_earth', false);
    // colVals = evaluate_cmap(aNorm, 'Blues', true);
    // colVals = evaluate_cmap(aNorm, 'gnuplot2', true);
    // colVals = evaluate_cmap(aNorm, 'RdBu', true);
    colVals = evaluate_cmap(aNorm, 'afmhot', false);
    colVals = evaluate_cmap(aNorm, 'magma', false);

    


    // Draw particle
    this.colour = "rgb("+ Number(colVals[0]) +", "+ Number(colVals[1]) +", "+ Number(colVals[2]) +")";
    // this.colour = "rgb("+ 255 +", "+ 255 +", "+ 255 +")";

    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    c.lineWidth=0.01;
    c.strokeStyle = this.colour;
    c.fillStyle = this.colour; 
    c.stroke();
    c.fill();

  }







  this.update = function(particles, i) { // This sums up all the different calculated accelerations to update the velocity and position

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

    // this.attract(particles, i);
    this.boundaries();

    let align = this.align(particles,i);
    let cohesion = this.cohesion(particles, i);
    let separation = this.separation(particles,i);
    // this.ax = alignCoeff*align[0] + cohesionCoeff*cohesion[0];
    // this.ay = alignCoeff*align[1] + cohesionCoeff*cohesion[1];
    this.ax = alignCoeff*align[0] + cohesionCoeff*cohesion[0] + separationCoeff*separation[0];
    this.ay = alignCoeff*align[1] + cohesionCoeff*cohesion[1] + separationCoeff*separation[1];


    // let alignment = this.align(particles, i);
    
    // let separation = 

    
    // this.ax = cohesion[0];
    // this.ay = cohesion[1];

    this.vx += this.ax*dt;
    this.vy += this.ay*dt;

    let speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
      
      if (speed > desiredSpeed){
        speedMult = desiredSpeed/speed;
        this.vx = this.vx*speedMult;
        this.vy = this.vy*speedMult;
      }

      if (speed < minSpeed){
        speedMult = minSpeed/speed;
        this.vx = this.vx*speedMult;
        this.vy = this.vy*speedMult;
      }

    // let speed = Math.sqrt(vx*vx + vy*vy);
    // console.log(i)
    // // console.log(v)
    // let minSpeed = 10;
    // var vMult = minSpeed/speed;
    // console.log(vMult)
    // this.vx = this.vx*vMult;
    // this.vy = this.vy*vMult;

    


    this.x  += this.vx*dt;
    this.y  += this.vy*dt;


  }


  this.align = function(particles,i){

    let vxAvg = 0;
    let vyAvg = 0;
    let total = 0;

    for (j = 0; j < N; j++){
      let other = particles[j];

      let dx = other.x - this.x;
      let dy = other.y - this.y;
      let r = Math.sqrt(dx*dx + dy*dy);

      if (other != this && r < perceptionRadius){
        vxAvg += other.vx;
        vyAvg += other.vy;
        total++;
      }

      
    }

    this.density = total/(Math.PI*perceptionRadius*perceptionRadius);

    if (total>0){
      vxAvg = vxAvg/total;
      vyAvg = vyAvg/total;

      speedAvg = Math.sqrt(vxAvg*vxAvg + vyAvg*vyAvg);
      
      // if (speedAvg > desiredSpeed){
      //   speedMult = desiredSpeed/speedAvg;
      //   vxAvg = vxAvg*speedMult;
      //   vyAvg = vyAvg*speedMult;
      // }

      speedMult = desiredSpeed/speedAvg;

      vxAvg = vxAvg*speedMult;
      vyAvg = vyAvg*speedMult;

      steeringX = vxAvg - this.vx;
      steeringY = vyAvg - this.vy;
    } else {
      steeringX = 0;
      steeringY = 0;
    }

    return [steeringX, steeringY];

  }




  this.cohesion = function(particles,i){

    let xAvg = 0;
    let yAvg = 0;
    let total = 0;

    for (j = 0; j < N; j++){
      let other = particles[j];

      let dx = other.x - this.x;
      let dy = other.y - this.y;
      let r = Math.sqrt(dx*dx + dy*dy);

      if (other != this && r < perceptionRadius){
        xAvg += other.x;
        yAvg += other.y;
        total++;
      }

      
    }

    if (total>0){
      xAvg = xAvg/total;
      yAvg = yAvg/total;

      

      // speedAvg = Math.sqrt(xAvg*xAvg + yAvg*yAvg);
      
      // speedMult = desiredSpeed/speedAvg;

      // xAvg = xAvg*speedMult;
      // yAvg = yAvg*speedMult;

      steeringX = xAvg - this.x;
      steeringY = yAvg - this.y;


      force = Math.sqrt(steeringX*steeringX + steeringY*steeringY);
      if (force>maxForce){
        steeringX = steeringX*maxForce/force;
        steeringY = steeringY*maxForce/force;
      }

    } else {
      steeringX = 0;
      steeringY = 0;
    }

    return [steeringX, steeringY];

  }


  this.separation = function(particles,i){

    let diffX = 0;
    let diffY = 0;
    let total = 0;

    for (j = 0; j < N; j++){
      let other = particles[j];

      let dx = other.x - this.x;
      let dy = other.y - this.y;
      let r = Math.sqrt(dx*dx + dy*dy);

      if (other != this && r < perceptionRadius){
        diffX += (this.x - other.x)/r;
        diffY += (this.y - other.y)/r;
        total++;
      }

      
    }

    if (total>0){
      steeringX = diffX/total;
      steeringY = diffY/total;

      // speedAvg = Math.sqrt(xAvg*xAvg + yAvg*yAvg);
      
      // speedMult = desiredSpeed/speedAvg;

      // xAvg = xAvg*speedMult;
      // yAvg = yAvg*speedMult;

      // steeringX = xAvg - this.x;
      // steeringY = yAvg - this.y;


      force = Math.sqrt(steeringX*steeringX + steeringY*steeringY);
      if (force>maxForce){
        steeringX = steeringX*maxForce/force;
        steeringY = steeringY*maxForce/force;
      }

    } else {
      steeringX = 0;
      steeringY = 0;
    }

    return [steeringX, steeringY];

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
