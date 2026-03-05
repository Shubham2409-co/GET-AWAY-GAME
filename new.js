document.addEventListener("DOMContentLoaded", () => {

const deck = Array.from(document.querySelectorAll("#cards button"));

/* -----------------------
PREPARE DECK
----------------------- */

deck.forEach(card => {

let text = card.textContent.trim().toLowerCase();
let [rank, suit] = text.split(" of ");

if (suit === "diamond") suit = "diamonds";
if (suit === "heart") suit = "hearts";
if (suit === "club") suit = "clubs";
if (suit === "spade") suit = "spades";

card.dataset.suit = suit;

const values = {ace:14,k:13,q:12,j:11};
card.dataset.value = values[rank] || parseInt(rank);

});

document.querySelector("#cards").style.display="none";


/* -----------------------
SHUFFLE
----------------------- */

for (let i = deck.length - 1; i > 0; i--) {

let j = Math.floor(Math.random() * (i + 1));
[deck[i], deck[j]] = [deck[j], deck[i]];

}


/* -----------------------
DEAL
----------------------- */

function deal(container,start,end){

const c=document.querySelector(container);
c.innerHTML="";

for(let i=start;i<end;i++){
c.appendChild(deck[i]);
}

}

deal("#user",0,13);
deal("#container1",13,26);
deal("#container2",26,39);
deal("#container3",39,52);


/* -----------------------
SORT USER
----------------------- */

function sortUserCards(){

const container=document.querySelector("#user");
const cards=Array.from(container.querySelectorAll("button"));

const order={spades:1,hearts:2,diamonds:3,clubs:4};

cards.sort((a,b)=>{

const s1=a.dataset.suit;
const s2=b.dataset.suit;

const v1=parseInt(a.dataset.value);
const v2=parseInt(b.dataset.value);

if(order[s1]!==order[s2])
return order[s1]-order[s2];

return v1-v2;

});

container.innerHTML="";
cards.forEach(c=>container.appendChild(c));

}

sortUserCards();


/* -----------------------
PLAYERS
----------------------- */

const players=[

{container:"#user",table:"#table",user:true,name:"You"},
{container:"#container1",table:"#table2",name:"Player 1"},
{container:"#container2",table:"#table1",name:"Player 2"},
{container:"#container3",table:"#table3",name:"Player 3"}

];

let current=0;
let leadSuit=null;
let pile=[];
let cardsPlayed=0;
let roundBroken=false;
let gameOver=false;


/* -----------------------
COUNTS
----------------------- */

function updateCounts(){

document.getElementById("player1count").textContent=
document.querySelectorAll("#container1 button").length;

document.getElementById("player2count").textContent=
document.querySelectorAll("#container2 button").length;

document.getElementById("player3count").textContent=
document.querySelectorAll("#container3 button").length;

}

updateCounts();


/* -----------------------
PLAY CARD
----------------------- */

function playCard(i,card){

const suit=card.dataset.suit;
const value=parseInt(card.dataset.value);

if(cardsPlayed===0){
leadSuit=suit;
}

if(cardsPlayed>0 && suit!==leadSuit){
roundBroken=true;
}

pile.push({player:i,suit,value,element:card});

const table=document.querySelector(players[i].table);
table.innerHTML="";
table.appendChild(card);

cardsPlayed++;

updateCounts();

}


/* -----------------------
AI TURN
----------------------- */

function aiTurn(){

if(gameOver) return;

const container=document.querySelector(players[current].container);
const cards=Array.from(container.querySelectorAll("button"));

if(cards.length===0) return;

let chosen;

if(cardsPlayed===0){

chosen=cards[0];

}else{

const same=cards.filter(c=>c.dataset.suit===leadSuit);
chosen=same.length ? same[0] : cards[0];

}

playCard(current,chosen);
nextTurn();

}


/* -----------------------
NEXT TURN
----------------------- */

function nextTurn(){

if(gameOver) return;

/* ROUND BROKEN */

if(roundBroken){
setTimeout(decideWinner,1000);
return;
}

if(cardsPlayed<4){

current=(current+1)%4;

if(!players[current].user)
setTimeout(aiTurn,600);

}else{

setTimeout(decideWinner,1000);

}

}


/* -----------------------
USER PLAY
----------------------- */

document.querySelector("#user").addEventListener("click",e=>{

if(!players[current].user) return;
if(e.target.tagName!=="BUTTON") return;

const suit=e.target.dataset.suit;

if(cardsPlayed!==0){

const cards=Array.from(document.querySelectorAll("#user button"));
const same=cards.filter(c=>c.dataset.suit===leadSuit);

if(same.length && suit!==leadSuit){

alert("You must follow suit!");
return;

}

}

playCard(current,e.target);
nextTurn();

});


/* -----------------------
DECIDE WINNER
----------------------- */

function decideWinner(){

const leadCards=pile.filter(c=>c.suit===leadSuit);

const highest=leadCards.reduce((a,b)=>a.value>b.value?a:b);

const winner=highest.player;

const container=document.querySelector(players[winner].container);

setTimeout(()=>{

/* IF SUIT BROKEN -> PICK CARDS */

if(roundBroken){
pile.forEach(c=>container.appendChild(c.element));
}

/* SAME SUIT -> REMOVE CARDS */

else{
pile.forEach(c=>c.element.remove());
}

document.querySelector("#table").innerHTML="";
document.querySelector("#table1").innerHTML="";
document.querySelector("#table2").innerHTML="";
document.querySelector("#table3").innerHTML="";

pile=[];
leadSuit=null;
cardsPlayed=0;
roundBroken=false;

updateCounts();
sortUserCards();

/* GAME OVER */

for(let p of players){

if(document.querySelectorAll(p.container+" button").length===0){

alert("Game Over! Winner: "+p.name);
gameOver=true;
return;

}

}

/* WINNER STARTS NEXT ROUND */

current=winner;

if(!players[current].user)
setTimeout(aiTurn,600);

},1000);

}


/* -----------------------
START GAME
----------------------- */

function startWithAceSpades(){

for(let i=0;i<players.length;i++){

const cards=document.querySelectorAll(players[i].container+" button");

for(let c of cards){

if(c.dataset.suit==="spades" && c.dataset.value=="14"){

current=i;
playCard(i,c);
nextTurn();
return;

}

}

}

}

startWithAceSpades();

});