import {Bodies, Body, Collision, Engine, Events, Render, Runner, World} from "matter-js";
import { FRUITS_BASE } from "./fruits";


const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes:false,
    background:"#F7F4C8",
    width:620,
    height:850
  }
});

const world = engine.world;

// 벽 테두리 만들기
// vite 는 중앙을 기준으로 px값 계산/ X,  Y,  width, height
const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic:true,
  render: {fillStyle: "#E6B143"}
})

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic:true,
  render: {fillStyle: "#E6B143"}
})

const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic:true,
  render: {fillStyle: "#E6B143"}
})

const topLine = Bodies.rectangle(310, 150, 620, 2, {
  name:"topLine",
  isStatic:true,
  isSensor:true,//감지만 해서 과일이 떨어지게 만듦
  render: {fillStyle: "#E6B143"}
})

World.add(world, [leftWall,rightWall,ground,topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let interval = null;
let num_suika = 0;

function addFruit(){
  // 정수로 랜덤 값
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS_BASE[index];

  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    isSleeping: true, // 고정
    render: {
      sprite: {texture: `${fruit.name}.png`}
    },
    //통통 튀게
    restitution:0.2,
  });

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);

  window.onkeydown = (event) => {
    if(disableAction)
      return;
    

    switch (event.code) {
      case "ArrowLeft" :
        // 이동키 부드럽게
        if (interval)
          return;
        interval = setInterval(() =>{
          if(currentBody.position.x - currentFruit.radius > 30)
            Body.setPosition(currentBody, {
              x:currentBody.position.x - 10,
              y:currentBody.position.y,
            });
        }, 20);        
        break;

      case "ArrowRight":
        if (interval)
          return;
        interval = setInterval(() =>{
          if(currentBody.position.x + currentFruit.radius < 590)
            Body.setPosition(currentBody, {
              x:currentBody.position.x + 10,
              y:currentBody.position.y,
            });
        }, 20)
        
        break;
      
      case "Space":
        currentBody.isSleeping = false;
        disableAction = true;

        setTimeout(() =>{
          addFruit();
          disableAction = false;
        }, 1000);
        break;
    }
  }
}

//위치 키 한칸씩이동
window.onkeyup = (event) => {
  switch (event.code) {
    case "ArrowLeft":
    case "ArrowRight":
      clearInterval(interval);
      interval = null;
  }
};

// 충돌이벤트
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if(collision.bodyA.index === collision.bodyB.index) {
      const index = collision.bodyA.index;

      if (index === FRUITS_BASE.length - 1){
        return;
      }

      World.remove(world, [collision.bodyA, collision.bodyB]);

      // 충돌 후 새과일 생성
      const newFruit = FRUITS_BASE[index + 1];

      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,{          
          render: {
            sprite: {texture: `${newFruit.name}.png`}
          },
          index: index + 1,
        }        
      );

      World.add(world, newBody);
    }

    // // 성공 이벤트
    // if(newFruit === Bodies.circle)
    // num_suika++;

    // topLine 부딪히면 게임 끝
    if (!disableAction && (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")){
      alert("Game over");
    }
  });
});

addFruit();