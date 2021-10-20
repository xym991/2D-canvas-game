const canvas = document.createElement("canvas");
const root = document.querySelector(".game");
const pregame = document.querySelector(".pre-game");
canvas.height = innerHeight *2;
canvas.width = innerWidth  * 2;
root.appendChild(canvas);


let diff = 2;
const form = document.querySelector("form");
const scoreboard = document.querySelector(".scoreboard");
const energy = document.querySelector("#energy");
let playerScore=0;
let playerEnergy =0;

///color: rgba(255,0,133,1)



//audio

const intro = new Audio("./music/introSong.mp3");
const gameOverSound = new Audio("./music/gameOver.mp3");
gameOverSound.playbackRate= 3;
const shootingSound = new Audio("./music/shoooting.mp3");
shootingSound.playbackRate = 2.5;
const heavyWeaponSound = new Audio("./music/heavyWeapon.mp3");
heavyWeaponSound.playbackRate=3;
const killSound = new Audio("./music/killEnemy.mp3")
killSound.playbackRate = 1.4;
const obliteratorSound = new Audio ('./music/hugeWeapon.mp3')
obliteratorSound.playbackRate = 0.8;
let multiplyer =1; 



//------------------------------------------------------

document.querySelector("input").addEventListener("click", (e) => {
    e.preventDefault();

    form.style.display = "none";
    scoreboard.style.display = " block"
    pregame.style.display = "none"
  


    const val = document.querySelector("select").value;
 

    if (val == "easy") {
        setInterval(spawn, 1400);
        multiplyer =3;
        return (diff = 6)
    }
    if (val == "medium") {
        setInterval(spawn, 1000);
        multiplyer =4;
        return (diff = 6)
    }
    if (val == "hard") {
        setInterval(spawn, 1000);
        multiplyer =5;
        return (diff = 8)
    }
    if (val == "insane") {
        setInterval(spawn, 700);
        multiplyer =6;
        return (diff = 10)
    }
})


//-----------------------------------------------------------
const context = canvas.getContext('2d');

const playerPos = {
    x: canvas.width / 2,
    y: canvas.height / 2
}

class Entity {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color

    }

    draw() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, Math.PI / 180 * 0, Math.PI / 180 * 360, false);
        context.fillStyle = this.color;
        context.fill();

    }
  
}
class Player extends Entity {
    constructor(x, y, radius, color) {
        super(x, y, radius, color)
    }
  


}

//player init
const player = new Player(playerPos.x, playerPos.y, 40, `white`);


class Weapon extends Entity {
    constructor(x, y, radius, color, velocity,damage) {
        super(x, y, radius, color); 
        this.velocity = velocity;
        this.damage= damage;

    }
    update() {
        
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.draw();
       
    }


}
Weapon.arr = [];

class Enemy extends Entity {
    constructor(x, y, radius, color, velocity) {
        super(x, y, radius, color);
        this.velocity = velocity;

    }
    update() {
       
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.draw();
        
    }


}
Enemy.arr = [];

class Particle extends Entity{
    constructor(x, y, radius, color,velocity){
        super(x, y, radius, color)
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw(){
        context.save();
        
        context.globalAlpha= this.alpha;
       
        context.beginPath();
        context.arc(this.x, this.y, this.radius, Math.PI / 180 * 0, Math.PI / 180 * 360, false);
        context.fillStyle = this.color;
        context.fill();

        context.restore();
    }

    update() {
        this.draw();
        this.alpha -= 0.01;
        this.velocity.x *= 0.99;
        this.velocity.y *= 0.99;
        this.x += this.velocity.x ;
        this.y += this.velocity.y ;
       
     
        

     
        
    }
}

Particle.arr = [];

class Obliterator extends Weapon{
    constructor() {
        super(playerPos.x,playerPos.y,40 ,"rgba(255,0,133,1)",{}, 1000)
    }

    draw() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, Math.PI / 180 * 0, Math.PI / 180 * 360, false);
        context.strokeStyle =  this.color;
        context.lineWidth=40;
        
        
        context.stroke();

    }
    update(){
        this.radius +=30; 
        this.draw();
    }
}
//--------------------------------------------------------------

spawn = function () {

    let enemySize = (Math.random() *  100) + 10;
    let enemyColor = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;
    let random;
    if (Math.random() < 0.5) {
        random = {
            x: Math.random() < 0.5 ? canvas.width + enemySize : 0 - enemySize,
            y: Math.random() * canvas.height
        }

    } else {
        random = {
            y: Math.random() < 0.5 ? canvas.height + enemySize : 0 - enemySize,
            x: Math.random() * canvas.width
        }
    }

    const angle = Math.atan2(canvas.height / 2 - random.y, canvas.width / 2 - random.x)
    const velocity = {
        x: (Math.cos(angle) * diff),
        y: (Math.sin(angle) * diff),
    }
    Enemy.arr.push(new Enemy(random.x, random.y, enemySize, enemyColor, velocity));
}

let animationId;
let frames = 0;
function animate() {
    animationId = requestAnimationFrame(animate);
    context.fillStyle='rgba(20,20,20,0.2)';
    
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    
    player.draw();

    Particle.arr.forEach((particle, pIn) =>{
        if(particle.alpha <= 0){
          Particle.arr.splice(pIn, 1);
        }else{
            particle.update();

        }
    });

    Weapon.arr.forEach((weapon, wIn) => {
     weapon.update()

        if (weapon.x + weapon.radius < 1 || weapon.y + weapon.radius < 1 || weapon.x - weapon.radius > canvas.width || weapon.y - weapon.radius > canvas.height 
            || (weapon.radius > playerPos.x*1.5 && weapon.radius > playerPos.y *1.5)) {
            Weapon.arr.splice(wIn, 1)
        }


    });
    Enemy.arr.forEach((enemy, enIn) => {
        enemy.update()

        const distPlayernEnemy = Math.hypot(
            player.x - enemy.x, player.y - enemy.y
        );

        if (distPlayernEnemy - enemy.radius - player.radius < 1) {
      
            cancelAnimationFrame(animationId);
            gameOverSound.play();
            return gameOver();
        }


        Weapon.arr.forEach((weapon, wIn) => {
            const distEnemynWeapon = Math.hypot(weapon.x - enemy.x, weapon.y - enemy.y);

            if (distEnemynWeapon - enemy.radius - weapon.radius < 1) {


                if ( enemy.radius > weapon.damage +20){
                
                   
                    setTimeout(() => {
                        gsap.to(enemy, {
                            radius: enemy.radius-weapon.damage
                        })
                       if(playerEnergy < 100){
                        playerEnergy+=1;
                        energy.style.width = playerEnergy+ "%";
                        energy.style.backgroundColor  ="cyan";
                       }else{
                        energy.style.backgroundColor = "rgba(255,0,133,1)";
                       }
                        
                        if(weapon.damage < 100){
                            Weapon.arr.splice(wIn, 1)
                        }
                       
                        playerScore += weapon.damage * multiplyer;
                        scoreboard.innerHTML = `Score : ${playerScore}`;
                    }, 0)
                }else{


               
                    setTimeout(() => {
                        Enemy.arr.splice(enIn, 1)
                        if(weapon.damage < 100){
                            Weapon.arr.splice(wIn, 1)
                        }
                        if(playerEnergy < 99){
                            playerEnergy+=2;
                            energy.style.width = playerEnergy+ "%";
                            energy.style.backgroundColor  ="cyan";
                           }else{
                               if(playerEnergy ===99)playerEnergy+=1;
                               energy.style.backgroundColor = "rgba(255,0,133,1)";
                           }
                        killSound.play();
                        playerScore+= Math.floor(enemy.radius) * multiplyer;
                            scoreboard.innerHTML = `Score : ${playerScore}`;
                        for(let i =0 ; i<enemy.radius*3 ; i++){
                            Particle.arr.push(new Particle(enemy.x, enemy.y, 3, enemy.color, {
                                x : (Math.random()-0.5) * (Math.random() *15),
                                y:(Math.random()-0.5) *(Math.random() *15)
                            }))
                        }
                    }, 0)

                  

                }
              

            }



        });

    });

    frames++


} animate();

setInterval(() => {
    console.log(frames);

    frames = 0;
}, 1000)


function gameOver(){
 
 
    const gameOverBanner = document.createElement("div");
    const gameOverBtn = document.createElement('button');
    const highscore = document.createElement("div");
    
    
    gameOverBtn.innerText="Play Again";


    const prevHighscore = localStorage.getItem('highscore') && localStorage.getItem('highscore');
    if(playerScore > prevHighscore){
        localStorage.setItem("highscore", playerScore);
    }
    highscore.innerText =  `Highscore : ${localStorage.getItem("highscore") ? localStorage.getItem("highscore") : playerScore}`

    
    gameOverBanner.appendChild(highscore);
    gameOverBanner.appendChild(gameOverBtn);
   


    gameOverBtn.onclick = () => window.location.reload();

    gameOverBanner.classList.add("gameover");
   document.querySelector("body").appendChild(gameOverBanner);
   



}









//even listener for bullets
canvas.addEventListener('click', e => {
    shootingSound.play();
    //defining movement of bullet
    const angle = Math.atan2(e.clientY * 2 - canvas.height / 2, e.clientX * 2 - canvas.width / 2)
    const velocity = {
        x: Math.cos(angle) * 15,
        y: Math.sin(angle) * 15,
    }
    

    //initializing the bullet 
    const weapon = new Weapon(canvas.width / 2, canvas.height / 2, 15, `white`, velocity,30);
    Weapon.arr.push(weapon);
});

canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
  if(playerEnergy >= 2){
    heavyWeaponSound.play();

    //defining movement of bullet
    const angle = Math.atan2(e.clientY * 2 - canvas.height / 2, e.clientX * 2 - canvas.width / 2)
    const velocity = {
        x: Math.cos(angle) * 10,
        y: Math.sin(angle) * 10,
    }
    

    //initializing the bullet 
    const weapon = new Weapon(canvas.width / 2, canvas.height / 2, 40, `cyan`, velocity,60);
    Weapon.arr.push(weapon);
    playerEnergy-=4;
    energy.style.width = playerEnergy+ "%";
    energy.style.backgroundColor  ="cyan";
  }
});



window.addEventListener('keypress', e =>{
 
    if(e.key =" "){
        if(playerEnergy ===100){
            obliteratorSound.play();
            Weapon.arr.push(new Obliterator());   
            playerEnergy=0;
            energy.style.width = playerEnergy+ "%";
            energy.style.backgroundColor  ="cyan";
        }
       
    }

})


addEventListener("resize", ()=>{
   window.location.reload();
})