// To do: 
// Boundary conditions                           DONE
// Some particles dont interact                  DONE
// Add sliders - add min and max for interaction distance - time step - grid size
// Click to drag a particles x0, y0 position
// Starting positions                            DONE
// Anisotropic spring/damping values             DONE
// Add lateral inhibition                        DONE
// Add cell division cell cycle function
// At wall send other way
// Random IKM param per cell
// Use D3.js to graph outputs

// var canvas = document.querySelector('canvas');
// var c = canvas.getContext("2d"); // c is context
var canvas = document.getElementById("theCanvas");
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

var particles = [];
const N = 400;
// const IKM = 15; // How large the noise term is in left-right IKNM
const radius = 8; // size of particles
const dt = 0.1; // time step
// const B = 5; // B = b/sqrt(mk) - damping constant in non-dimensionalised damped spring equation

const B = { // B = b/sqrt(mk) - damping constant in non-dimensionalised damped spring equation
  x: 2,
  y: 10
}

const springDist = 3*radius;;
const R = 20; // A=k/m for particle repulsion 

const mu = 0.1;
const pRate = 8; // rate of lateral inhibition kinetics
const LIDistMax = 6*radius;
const LIDistMin = 4*radius;

IKM = Number(speedSlider.value);
function showSpeed() {
  speedReadout.innerHTML = speedSlider.value;
  IKM = Number(speedSlider.value);
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

  var vx = 300*(Math.random() - 0.5);
  var vy = 300*(Math.random() - 0.5);

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
    particles[i].draw("proteinBRW",i);
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

function Particle (x, y, x0, y0, vx, vy, B, radius, colour){
  this.x = x;
  this.y = y;
  this.x0 = x0;
  this.y0 = y0;
  this.vx = vx;
  this.vy = vy;
  this.radius = radius;
  this.colour = colour;
  // this.colour = 'white';
  this.ax = 0;
  this.ay = 0;
  this.B = B;

  this.p = Math.random();



  this.draw = function(colourType,i) {

    if(colourType == "acceleration"){
      aMag = Math.sqrt(this.ax*this.ax + this.ay*this.ay);
      // aMag = Math.sqrt((this.x0 - this.x)*(this.x0 - this.x));
      aMax = 60;
      rVal = 255*aMag/aMax;
      bVal = 50* (aMag*aMag)/(aMax*aMax) + 100;
      gVal = 50* (aMag*aMag)/(aMax*aMax) + 100;
      // bVal = 50* aMag/aMax + 100;
      // gVal = 50* aMag/aMax + 100;
      this.colour = "rgb("+ rVal +", "+ bVal +", "+ gVal +")";
    }
    
    if(colourType == "indexGrey"){
      colVal = 255*i/N;
      this.colour = "rgb("+ colVal +", "+ colVal +","+ colVal +")";

    }

    if(colourType == "proteinBRW"){
      pMax = 6;
      rVal = 255*this.p/pMax;
      bVal = 50* (this.p*this.p)/(pMax*pMax) + 100;
      gVal = 50* (this.p*this.p)/(pMax*pMax) + 100;
      // bVal = 50* aMag/aMax + 100;
      // gVal = 50* aMag/aMax + 100;
      this.colour = "rgb("+ rVal +", "+ bVal +", "+ gVal +")";
    }

    if(colourType == "proteinGrey"){
      pMax = 3;
      colVal = 255*this.p/pMax;
      
      // bVal = 50* aMag/aMax + 100;
      // gVal = 50* aMag/aMax + 100;
      this.colour = "rgb("+ colVal +", "+ colVal +", "+ colVal +")";
    }

    

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

    this.x0 += 0.1*this.vx*dt;
    this.y0 += 0.1*this.vy*dt;

    

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
            numNeigh++;
            pSum += other.p;
            // console.log(pSum);
          }
        // }
      }
    }
    // console.log(pSum);
    if (numNeigh>0){
      meanP = pSum/numNeigh;
      // this.p += pRate*((1 - this.x/w)/(1+meanP*meanP*meanP) - mu*this.p)*dt;
      this.p += pRate*(1/(1+meanP*meanP*meanP) - mu*this.p)*dt;

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

