const moves = document.getElementById("moves-count");
const timeValue = document.getElementById("time");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const gameContainer = document.querySelector(".game-container");
const result = document.getElementById("result");
const controls = document.querySelector(".controls-container");
let cards;
let interval;
let firstCard = false;
let secondCard = false;
const width = document.documentElement.clientWidth;

//อาเรย์หน้าการ์ด
const items = [
  { name: "coal", image: "Card/coal.png" },
  { name: "iron", image: "Card/iron.png" },
  { name: "gold", image: "Card/gold.png" },
  { name: "lapis", image: "Card/lapis.png" },
  { name: "redstone", image: "Card/redstone.png" },
  { name: "shroomlight", image: "Card/shroomlight.png" },
  { name: "gravel", image: "Card/gravel.png" },
  { name: "rawgold", image: "Card/rawgold.png" },
  { name: "dirt", image: "Card/dirt.png" },
];

//ค่าเริ่มต้นเวลา ,การนับการจับคู่, คะแนน
let seconds = 0,
  minutes = 0;

let movesCount = 0,
  winCount = 0;

//เวลา
const timeGenerator = () => {
  seconds += 1;
  //ถ้าครบ 60 วิจะเป็น 1 นาที
  if (seconds >= 60) {
    minutes = 1;
    seconds = 0;
  }
  //จัดรูปเวลาก่อนแสดงผล
  let secondsValue = seconds < 10 ? `0${seconds}` : seconds;
  let minutesValue = minutes < 10 ? `0${minutes}` : minutes;
  timeValue.innerHTML = `<span>Time:</span>${minutesValue}:${secondsValue}`;
};

//คำนวณจำนวนการจับคู่ กด 2 ใบเพิ่ม 1 ครั้ง
const movesCounter = () => {
  movesCount += 1;
  moves.innerHTML = `<span>Moves:</span>${movesCount}`;
};

//ฟังก์ชันสุ่มหน้าการ์ด
const generateRandom = (size = 4) => {
  //ดึงข้อมูลหน้าการ์ดจากอาเรย์
  let tempArray = [...items];
  //ประกาศอาเรย์เก็บคู่หน้าการ์ด
  let cardValues = [];
  //ทำให้หน้าการ์ดเป็นคู่ๆ ขนาดควรเป็นสองเท่า (4*4)/2 
  size = (size * size) / 2;
  //ระบบสุ่มหน้าการ์ด
  for (let i = 0; i < size; i++) {
    const randomIndex = Math.floor(Math.random() * tempArray.length);
    cardValues.push(tempArray[randomIndex]);
    //เอาค่าออกจากอาเรย์ชั่วคราว
    tempArray.splice(randomIndex, 1);
  }
  return cardValues;
};

const matrixGenerator = (cardValues, size = 4) => {
  gameContainer.innerHTML = "";
  cardValues = [...cardValues, ...cardValues];
  //สุ่มตำแหน่งการ์ด
  cardValues.sort(() => Math.random() - 0.5);
  for (let i = 0; i < size * size; i++) {
    /*
        สร้างการ์ด1การ์ด
        before หลังการ์ด => front side หน้าการ์ด
        after หน้าการ์ด => back side หลังการ์ด
        data-card-values ในคำสั่งจัดเก็บหน้าการ์ดที่เป็นคู่กันไว้ แต่ในโค้ดจะใช้เก็บการ์ดที่เลือกในภายหลัง
      */
    gameContainer.innerHTML += `
     <div class="card-container" data-card-value="${cardValues[i].name}">
        <div class="card-before">
        <img src="card/back.png" class="image"/>
        </div>
        <div class="card-after">
          <img src="${cardValues[i].image}" class="image"/></div>
        </div>
     `;
  }
  //Grid
  gameContainer.style.gridTemplateColumns = `repeat(${size},auto)`;

  //ตรวจสอบการ์ดว่าจับคู่ได้ถูกต้อง
  cards = document.querySelectorAll(".card-container");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      //ถ้าการ์ดที่เลือกไม่ตรงกัน จะเรียกใช้ (การ์ดที่จับคู่แล้วเมื่อคลิกจะไม่เกิดอะไร)
      if (!card.classList.contains("matched")) {
        //หมุนการ์ดเมื่อคลิก
        card.classList.add("flipped");
        //ตรวจสอบการ์ดใบแรก
        if (!firstCard) {
          //การ์ดปัจจุบันจะเป็นใบแรกเสมอ
          firstCard = card;
          firstCardValue = card.getAttribute("data-card-value");
        } else {
          //เมื่อเลือกใบที่2
          movesCounter();
          secondCard = card;
          let secondCardValue = card.getAttribute("data-card-value");
          if (firstCardValue == secondCardValue) {
            //ถ้าการ์ด1และ2ตรงกันเพิ่ม class matched ให้ละจะไม่สามารถกดได้ เนื่องจากโค้ด บรรทัดที่ 102
            firstCard.classList.add("matched");
            secondCard.classList.add("matched");
            //ให้ใบแรกเป็น false เนื่องจากใบถัดไปจะเป็นใบแรกในตอนนี้
            firstCard = false;
            //จะเพิ่มเมื่อเจอคู่การ์ดที่ถูกต้อง
            winCount += 1;
            //ตรวจสอบว่า คะแนนชนะ เท่ากับ ครึ่งหนึ่งของ length
            if (winCount == Math.floor(cardValues.length / 2)) {
              result.innerHTML = `<h2>You Won</h2>
            <h4>Moves: ${movesCount}</h4>`;
              stopGame();
            }
          } else {
            //ถ้าการ์ดไม่ตรง
            //หมุนกลับไปเป็นด้านหลังการ์ด
            let [tempFirst, tempSecond] = [firstCard, secondCard];
            firstCard = false;
            secondCard = false;
            let delay = setTimeout(() => {
              tempFirst.classList.remove("flipped");
              tempSecond.classList.remove("flipped");
            }, 600);
          }
        }
      }
    });
  });
};

//ปุ่มเริ่มเกม
//ควบคุมการมองเห็นของปุ่ม เมื่อกดเริ่ม ปุ่มหยุดจะปรากฎ
startButton.addEventListener("click", () => {
  movesCount = 0;
  seconds = 0;
  minutes = 0;
  controls.classList.add("hide");
  stopButton.classList.remove("hide");
  startButton.classList.add("hide");
  //เริ่มนับเวลา
  interval = setInterval(timeGenerator, 1000);
  //นับการจับคู่การ์ด
  moves.innerHTML = `<span>Moves:</span> ${movesCount}`;
  initializer();
});

//ปุ่มปิดเกม
//ควบคุมการมองเห็นของปุ่ม เมื่อกดหยุด ปุ่มเริ่มจะปรากฎ
stopButton.addEventListener(
  "click",
  (stopGame = () => {
    controls.classList.remove("hide");
    stopButton.classList.add("hide");
    startButton.classList.remove("hide");
    clearInterval(interval);
  })
);

//ค่าเริ่มต้น
const initializer = () => {
  result.innerText = "";
  winCount = 0;
  let cardValues = generateRandom();
  console.log(cardValues);
  matrixGenerator(cardValues);
};

