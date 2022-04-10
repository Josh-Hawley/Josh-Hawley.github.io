// To do: 
// Boundary conditions                           DONE
// Some particles dont interact                  DONE
// Add sliders                                   DONE
// Click to drag a particles x0, y0 position     DONE
// Starting positions                            DONE
// Anisotropic spring/damping values             DONE
// Add lateral inhibition                        DONE
// Add cell division cell cycle function
// At wall send other way
// Random IKM param per cell
// Use D3.js to graph outputs
//Get a good colourmap
// Mouse increases expression in a given area
// Angle dependent protrusions
//Double check protrusions are bidirectional signalling
// Sort bug when dragged cell goes beyond edge of sim
// Add kymograph visualisation

// var canvas = document.querySelector('canvas');
// var c = canvas.getContext("2d"); // c is context
var canvas = document.getElementById("theCanvas");
console.log(canvas);
var c = theCanvas.getContext("2d");

var speedSlider = document.getElementById("speedSlider");
var speedReadout = document.getElementById("speedReadout");

// canvas.width = 300;
w = canvas.width;
h = canvas.height;


// w = window.innerWidth;
// h = window.innerHeight;
// let w = 300;
// let h = 600;
// canvas.width = w;
// canvas.height = h;

const range = document.querySelectorAll(".range-slider input");
progress = document.querySelector(".range-slider .progress");
let gap = 0.5;
const inputValue = document.querySelectorAll(".numberVal input");



range.forEach(input => {
  input.addEventListener("input", e =>{
    let minrange = parseFloat(range[0].value),
    maxrange = parseFloat(range[1].value);
    
    if(maxrange - minrange < gap){
      if(e.target.className === "range-min"){
        range[0].value = maxrange - gap;
      }
      else{
        range[1].value = minrange + gap;
      }
    }
    else{
      progress.style.left = (minrange / range[0].max) * 100 + '%';
      progress.style.right = 100 - (maxrange / range[1].max) * 100 + '%';
      inputValue[0].value = minrange;
      inputValue[1].value = maxrange;
    }


  })
})

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
const N = 400;
// const IKM = 15; // How large the noise term is in left-right IKNM
const radius = Math.sqrt((w*h)/(6*N)); // size of particles
const dt = 0.1; // time step
// const B = 5; // B = b/sqrt(mk) - damping constant in non-dimensionalised damped spring equation

const B = { // B = b/sqrt(mk) - damping constant in non-dimensionalised damped spring equation
  x: 2,
  y: 13
}

const springDist = 2.8*radius;;
const R = 20; // A=k/m for particle repulsion 




LIDistMin = Number(range[0].value)*2*radius;
LIDistMax = Number(range[1].value)*2*radius;
function updateMinMax() {
  LIDistMin = Number(minSliderVal.value)*2*radius;
  LIDistMax = Number(maxSliderVal.value)*2*radius;

}
// const LIDistMax = 3*radius;
// const LIDistMin = 0*radius;

var IKM = Number(IKMSlider.value);
function showIKM() {
  IKMReadout.innerHTML = IKMSlider.value;
  IKM = Number(IKMSlider.value);
}

var LIRate = 40; // rate of lateral inhibition kinetics
LIRate = Number(LIRateSlider.value);
function showLIRate() {
  LIRateReadout.innerHTML = LIRateSlider.value;
  LIRate = Number(LIRateSlider.value);
}

// Protrusion parameters
var contactTimeMax = 50;
contactTimeMax = Number(contactTimeSlider.value);
function showContactTime() {
  contactTimeReadout.innerHTML = contactTimeSlider.value;
  contactTimeMax = Number(contactTimeSlider.value);
}

var probInteract = 0.0005;
probInteract = Number(probInteractSlider.value);
function showProbInteract() {
  probInteractReadout.innerHTML = probInteractSlider.value;
  probInteract = Number(probInteractSlider.value);
}

var mu = 0.1; // Degredation rate
mu = Number(muSlider.value);
function showMu() {
  muReadout.innerHTML = muSlider.value;
  mu = Number(muSlider.value);
}

const Nrow = h/(3*radius);
const Ncol = N/Nrow;

colPos = 0;
rowPos = 0;

for (let i = 0; i < N; i++) {
  var x = Math.random() * w;
  var y = Math.random() * h;

  // colPos += w/Ncol;

  // if (colPos > w - springDist){
  //   colPos = 0;
  //   rowPos += h/Nrow;
  // }

  // x = springDist + colPos + 3*(Math.random()-0.5);
  // y = springDist + rowPos + 3*(Math.random()-0.5);

  var vx = 0;
  var vy = 0;

  var x0 = x;
  var y0 = y;

  var colour = randColour("bright");

  particles.push(new Particle(x, y, x0, y0, vx, vy, B, radius, colour));
}


// window.addEventListener("click",
//   function(event){
//     for(i = 0; i < N; i++){
//       particles[i].perturb();
//     }
//   }
// )


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

      if (mouseDist < radius){
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
  // c.fillStyle = "rgb(150, 150, 150)";
  // c.fillRect(0, 0, w, h); // fill canvas with background colour

  for(i = 0; i < N; i++){
    // particles.repel(particles, i);
    
    particles[i].update(particles, i);
    particles[i].lateralInhibition(particles,i);
    particles[i].draw("proteinGrey",i);

    // canvas.addEventListener("mousedown", function(downEvent){
    //   banana = downEvent.layerX
    //   // particles[i].moveParticle();
      
    // })
    // canvas.addEventListener("mousedown", particles[i].moveParticle());
  }

}

// var mouse = {
//   x: undefined,
//   y: undefined
// }

// window.addEventListener("mousemove", function(event){
//   mouse.x = event.x
//   mouse.y = event.y
// })

function Particle (x, y, x0, y0, vx, vy, B, radius){
  this.x = x;           // x-position of cell
  this.y = y;           // y-position of cell
  this.x0 = x0;         // Desired x-location of cell (spring restoring force to this location)
  this.y0 = y0;         // Desired y-location of cell (spring restoring force to this location)
  this.vx = vx;         // x velocity
  this.vy = vy;         // y velocity
  this.ax = 0;          // x acceleration
  this.ay = 0;          // y acceleration
  
  this.B = B;           // Object that contains x and y spring/damping ratio constants
  this.radius = radius; // Radius of particle
  this.p = Math.random(); // Initial protein expresion
  
  this.contactTime = [];
  for(let n = 0; n < N; n++){
    this.contactTime.push(0);
  }

  // canvas.addEventListener("mousedown", this.moveParticle());
  

  this.draw = function(colourType,i) {

    // if(colourType == "acceleration"){
    //   aMag = Math.sqrt(this.ax*this.ax + this.ay*this.ay);
    //   // aMag = Math.sqrt((this.x0 - this.x)*(this.x0 - this.x));
    //   aMax = 60;
    //   rVal = 255*aMag/aMax;
    //   bVal = 50* (aMag*aMag)/(aMax*aMax) + 100;
    //   gVal = 50* (aMag*aMag)/(aMax*aMax) + 100;
    //   // bVal = 50* aMag/aMax + 100;
    //   // gVal = 50* aMag/aMax + 100;
    //   this.colour = "rgb("+ rVal +", "+ bVal +", "+ gVal +")";
    // }
    
    // if(colourType == "indexGrey"){
    //   colVal = 255*i/N;
    //   this.colour = "rgb("+ colVal +", "+ colVal +","+ colVal +")";

    // }

    // if(colourType == "proteinBRW"){
    //   pMax = 6;
    //   rVal = 255*this.p/pMax;
    //   bVal = 50* (this.p*this.p)/(pMax*pMax) + 100;
    //   gVal = 50* (this.p*this.p)/(pMax*pMax) + 100;
    //   // bVal = 50* aMag/aMax + 100;
    //   // gVal = 50* aMag/aMax + 100;
    //   this.colour = "rgb("+ rVal +", "+ bVal +", "+ gVal +")";
    // }

    // if(colourType == "proteinGrey"){
    //   pMax = 3;
    //   colVal = 205*this.p/pMax +40;
      
    //   // bVal = 50* aMag/aMax + 100;
    //   // gVal = 50* aMag/aMax + 100;
    //   this.colour = "rgb("+ colVal +", "+ colVal +", "+ colVal +")";
    // }

    pMax = 10;
    normP = this.p/pMax;
    if (this.p > pMax){
      normP = 1;
    } 
    // console.log(normP);
    colVals = evaluate_cmap(normP, 'RdYlBu', true); // Colourmaps documentation at https://github.com/timothygebhard/js-colormaps
    // colVals = evaluate_cmap(normP, 'Spectral', true);
    // colVals = evaluate_cmap(normP, 'viridis', false);
    // colVals = evaluate_cmap(normP, 'cubehelix', false);
    // colVals = evaluate_cmap(normP, 'gist_stern', false);
    
    this.colour = "rgb("+ Number(colVals[0]) +", "+ Number(colVals[1]) +", "+ Number(colVals[2]) +")";
    

    c.beginPath();
    c.arc(this.x, this.y, radius, 0, Math.PI*2);

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
      // this.ax += -0.3*this.vx - (this.x - this.x0);
      // this.ay += -0.3*this.vy - (this.y - this.y0);

      
      // if mouse is down identify which was the particle that was under the mouse click and keep updating it
    } 

    this.ax += -this.B.x*this.vx - (this.x - this.x0);
    this.ay += -this.B.y*this.vy - (this.y - this.y0);
    
    // this.ax = -this.B.x*this.vx;
    // this.ay = -this.B.y*this.vy;

    this.repel(particles, i);
    this.boundaries();

    this.vx += this.ax*dt;
    this.vy += this.ay*dt;
    this.x  += this.vx*dt;
    this.y  += this.vy*dt;

    this.x0 += 0.01*this.vx*dt; // Allow drift of position to avoid crowding
    this.y0 += 0.01*this.vy*dt;

 

    

    

    //IKNM
    this.x0 += IKM*(Math.random()-0.5); // random movement left and right
   
    if (this.x0 < radius){ // Left and right boundary
      this.x0 = radius;
    }
    if (this.x0 > w - radius){
      this.x0 = w -radius;
    }
    // if (this.y0 < radius){ // Left and right boundary
    //   this.y0 = radius;
    // }
    // if (this.y0 > h - radius){
    //   this.y0 = h -radius;
    // }
    // this.y0 += 2*(Math.random()-0.5);

    // if (i == N/2){
    //   this.x0 += 300*(Math.random()-0.5);
    //   this.y0 += 300*(Math.random()-0.5);
    // }

  }

  this.perturb = function() {
    this.x += 100*(Math.random()-0.5);
    this.y += 100*(Math.random()-0.5);
  }

  this.repel = function(particles, i) {
    for (let j = i+1; j < N; j++){

      let other = particles[j];

      let dx = other.x - this.x;
      if (dx < springDist){
        let dy = other.y - this.y;
        let r = Math.sqrt(dx*dx + dy*dy);
        if (r < springDist){
  
          let a = R*(r-springDist);

          this.ax  += a*dx/r;
          this.ay  += a*dy/r;
          other.ax -= a*dx/r;
          other.ay -= a*dy/r;
        } 
      }  
    }
  }

  this.boundaries = function() {
    const cutOffDistBound = 4*radius;
    const rigidity = 30;
    if (this.x < cutOffDistBound){
      this.ax += rigidity*(cutOffDistBound - this.x);
    }
    if (this.x > w-cutOffDistBound){
      this.ax += rigidity*((w - cutOffDistBound) - this.x);
    }
    if (this.y < cutOffDistBound){
      this.ay += rigidity*(cutOffDistBound - this.y);
    }
    if (this.y > h-cutOffDistBound){
      this.ay += rigidity*((h - cutOffDistBound) - this.y);
    }
  }


  this.lateralInhibition = function(particles, i){
    var numNeigh = 0;
    var pSum = 0;
    var meanP = 0 ;
    
    for (let j = 0; j < N; j++){

      if( i != j){
        let other = particles[j];
        let dx = other.x - this.x;

        // if (dx < LIDist){

          let dy = other.y - this.y;
          let r = Math.sqrt(dx*dx + dy*dy);
          

          if (r > LIDistMin && r < LIDistMax){
            if (Math.random()<probInteract || this.contactTime[j] > 0){
              numNeigh++;
              pSum += other.p;
              this.contactTime[j] = this.contactTime[j] + dt;
              other.contactTime[i] = other.contactTime[i] +dt;
              if (this.contactTime[j] > contactTimeMax){
                this.contactTime[j] = 0;
                other.contactTime[i] = 0;
              }

              if (i == N-1){ // Draw protrusions for 1 cell
                c.strokeStyle = 'white';
                c.lineWidth = 2;
                c.beginPath();
                c.moveTo(this.x, this.y);
                c.lineTo(other.x, other.y);
                c.stroke();

                c.beginPath();
                c.arc(other.x, other.y, radius/2, 0, Math.PI*2);
                c.fillStyle = 'black';
                c.fill();
                c.stroke();
                
              }

            }

          }
      }
    }

    if (numNeigh>0){
      meanP = pSum/numNeigh;
      // this.p += LIRate*((1 - this.x/w)/(1+meanP*meanP*meanP) - mu*this.p)*dt;
      let dp = LIRate*(1/(1+meanP*meanP*meanP) - mu*this.p);
      this.p += dp*dt + Math.sqrt(Math.abs(dp*dt))*(Math.random()-0.5); // Euler-Maryuma method to solve SDE
      if (this.p < 0){
        this.p = 0;
      }
      // console.log("meanP = " + 1/(1+meanP*meanP*meanP));
      // console.log("mu*this.p = " + mu*this.p);
      // console.log(1/(1+meanP*meanP*meanP) - mu*this.p);
      
      // console.log(Math.sqrt(dp*dt));

    }


  }

  // this.moveParticle = function(){
  //   let dXmouse = this.x - mouse.x;
  //   let dYmouse = this.y - mouse.y;
  //   let mouseDist = Math.sqrt(dXmouse*dXmouse + dYmouse*dYmouse);
  //   // console.log(this.y)
  //   if (mouseDist < radius){
  //     this.x = mouse.x;
  //     this.y = mouse.y;
  //     this.x0 = mouse.x;
  //     this.y0 = mouse.y;
  //   }
    
  // }

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

