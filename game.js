module.exports = {
    initGame,
    checkIsWinner,
    moveRollDice,
    endTurn,
    movePlaceSoldier,
    startAttack,
    evaluateAttack,
    clearAttack,
    moveSoldiers,
    checkBoardForZeroSoldiers
}
const { shuffle } = require('./utils');

  
function initGame(numPlayers,room){
    const state = createGameState(numPlayers,room); 
    return state;
}
function createGameState(numPlayers,room){
    //Asjad, mis s6ltuvad m2ngijate arvust
    console.log("game state created");
    let scores = [];
    let pOrder = [1,2];
    let nicknames = [];
    
    for(i=1;i<pOrder.length+1;i++){
      nicknames.push("Plr " + i);
    }
    /***TODO: GENERATE RANDOM PLAY ORDER */
    /**TODO: ADD NICKNAMES U CAN PUT IN AT INITIALIZATION */
    /***TODO: GIVE GAME STARTER A HOW MANY PLRS OPTION (MAX TULEB PAIKA PANNA) */
    /***TODO: winner handling */
    
    return{
        room:room,
        playOrder:pOrder,
        nicknames:nicknames,
        currentPlayer: pOrder[0],
        numPlayers:numPlayers,
        turn:0,
        winner:false,
        active:true,
        sodureid:[30,30],
        maakonnad:["hiiumaa","saaremaa","laanemaa","harjumaa",
        "rapla","parnu","laaneviru","idaviru","jogeva","tartu",
        "valga","polva","voru","viljandi","jarva"],
        board:createRiskBoard(),
        attack:{
          isHappening:false,
          attackingCountry:null,
          defendingCountry:null,
          attacker:null,
          defender:null,
          dice:[[],[]],
          winner:null,
        }
    }
}

function checkIsWinner(state){
    if(!state){ //kui state tyhi 2ra tee midagi
        console.log("state on tyhi");
        return;
    }
    /*CHECKS IF ALL COUNTRIES CONTROLLED BY 1 player*/
    
    for(player = 0;player<state.numPlayers;player++){
      controlledAreas = 0;
      for(i=0;i<state.maakonnad.length;i++){
        if(state.board[state.maakonnad[i]].owner == player+1){
           controlledAreas++;
        }
      }
      if(controlledAreas == 15){
        return player + 1;
      }
    }

    
    
}
/********************MOVES**************/
function moveSoldiers(state,from,to,amount){
  sourceCountrySoldiers = state.board[from].soldiers;
  
  sourceCounty = state.board[from]
  destCountry = state.board[to]
  
  if(amount >sourceCountrySoldiers){
    return -1;
  }
  if(!state.maakonnad.includes(from) || !state.maakonnad.includes(to)){
    return -2;
  }
  neighbors = state.board[from].neighbors;
  if(!neighbors.includes(to)){
    return -3
  }
  if(sourceCounty == destCountry){
    return -4;
  }
  state.board[to].soldiers += amount;
  state.board[from].soldiers -= amount;
  return 1;
}
function moveRollDice(state,player){
  /*Lisab playerile skoori*/
  
  roll = Math.floor(Math.random() * 6 + 1) //1-6
  dice = state.attack.dice[player-1]; //dice array
  
  if(!dice.includes(null)){return}; //kui tyhje kohti pole ss return
  
  for(i=0;i<dice.length;i++){
    if(dice[i] == null){ //
      dice[i]  = roll;
      break;
    }
  }
}
function movePlaceSoldier(state, owner,country,nrOfSoldiers){
    if(nrOfSoldiers == null || nrOfSoldiers == 0){
      return -3
    }
    riik = state.board[country];
    nrOfSoldiersLeft = state.sodureid[owner-1]
    console.log("soldiers left",nrOfSoldiersLeft)
    if(nrOfSoldiersLeft - nrOfSoldiers < 0 ){
      console.log("returned -2")
      return -2; //kui pole piisavalt s6dureid j2rgi
    }
    
    if(riik.owner <1 || riik.owner == owner){ //kui vaba riik, v6i selle m2ngija oma
      riik.owner = owner;
      riik.soldiers += nrOfSoldiers;
      state.sodureid[owner-1] -= nrOfSoldiers;
      return 1;
    }
    return -1; //kui on kellegi teise oma;
    
    
    
    
    
}
function checkBoardForZeroSoldiers(state){
  /*check for free countries and update soldiers*/
  board = state.board;
  maakonnad = state.maakonnad;

  
  for(i=0;i<maakonnad.length;i++){
    riik = board[maakonnad[i]];
    if(riik.soldiers <= 0){
      riik.owner = -1;
    }
  }
  
}
function bubbleSortAscending(array){
  for(i=0;i<array.length;i++){
    for(j=0;j<array.length-i;j++){
      if(array[i] < array[i+1]){
        temp = array[i];
        array[i] = array[i+1];
        array[i+1] = temp;
      }
    }
  }
  return array;
}
function evaluateAttack(state){
  /*Vaatab, kes v6itis*/
  attacker = state.attack.attacker;
  defender = state.attack.defender;
  
  attackerDice = state.attack.dice[attacker-1];
  defenderDice = state.attack.dice[defender-1];
  
  if(attackerDice.includes(null) || defenderDice.includes(null)){console.log("Returned cause includes not enough rolls");return};
  
  attackerDice = bubbleSortAscending(attackerDice);
  defenderDice = bubbleSortAscending(defenderDice);
  
  for(let i = 0;i<defenderDice.length;i++){
    dRoll = defenderDice[i];
    aRoll = attackerDice[i];
    
    if(aRoll  > dRoll){
      state.board[state.attack.defendingCountry].soldiers -= 1;
    }
    else{
      state.board[state.attack.attackingCountry].soldiers -= 1;
    }
  }
  if(state.board[state.attack.attackingCountry].soldiers <=0){
    state.attack.winner = defender
    endTurn(state);
  }
  else{
    state.attack.winner = attacker; //kui riigis on nyyd 0  s6durit siis se check on checkboardforzeroSoldiers funktsioonis.
  }
  return 1;
}
function endTurn(state){
  /*Vahetab currenplayer j2rgmise m2ngija playOrderis vastu*/
  /**STUFF THAT HAPPENS AT TURN BEGIN */
  /********************************************************** */
  let playerIndexInOrder = getElementIndex(state);
    if(state.currentPlayer == state.playOrder[state.numPlayers-1]){ //kui playorderis viimane,ss j2rgmine on esimene
         state.currentPlayer = state.playOrder[0];
  }else
  {
    state.currentPlayer = state.playOrder[playerIndexInOrder + 1]; //breakpoint.
  }
  state.turn += 1;
  
  /**Siia peaks panema mingi state reset funktsioon, et asjad, nt dice iga k2igu l6pus nulli lyya */
  // state.turn  = state.turn +  1;
}

function startAttack(state,attackingCountry,defendingCountry,nrOfDice){
  
  
  /*ERROR CHECKS*/
  attackerSoldiers = state.board[attackingCountry].soldiers;
  if(attackerSoldiers - nrOfDice < 1){
    console.log("startaattck return -1")
    return -1}
  
  /*Paneb m2nguseisu, et attack toimumas*/
  
  attacker = state.board[attackingCountry].owner;
  defender = state.board[defendingCountry].owner;

  state.attack.attacker = attacker;
  state.attack.defender = defender;
  
  state.attack.attackingCountry = attackingCountry;
  state.attack.defendingCountry = defendingCountry;
  state.attack.isHappening = true;
  
  /*Palju t2ringuid?*/
  atArr = [];
  for(i=0;i<nrOfDice;i++){
    atArr.push(null);
  }
  defArr = [];
  for(i=0;i<nrOfDice-1;i++){
    defArr.push(null);
  }
  state.attack.dice[attacker-1] = atArr; 
  
  state.attack.dice[defender-1] = defArr;
  
  
  
}
function clearAttack(state){
  state.attack.isHappening = false;
  state.attack.attacker = null;
  state.attack.defender = null;
  state.attack.dice = [[null],[null]];
  state.attack.winner = null;
}
function getElementIndex(state){
  for(i=0;i<state.numPlayers;i++){
    if(state.playOrder[i] == state.currentPlayer){
      return i;
    }
  }
  console.log("getElementIndex function didnt work");
  return;
}
function checkIfAllStatesFilled(state){
  maakonnad = state.maakonnad;
  for(i=0;i<maakonnad.length;i++){
    maakond = state.board[maakonnad[i]];
    if(maakond.owner <0){return false}
  }
  return true;
}
function createRiskBoard(){
  /*teeb JSON objekti, kus iga kontinendi kohta riigid ja info nende riikide kohta
  *naabrid, mis m2ngijale kuulub, mitu s6durit peal etc*/
  var board = {
    hiiumaa:{owner:1,soldiers:5,neighbors:["saaremaa","laanemaa"]},
    saaremaa:{owner:2,soldiers:4,neighbors:["hiiumaa","laanemaa","parnu"]},
    laanemaa:{owner:1,soldiers:2,neighbors:["hiiumaa","saaremaa","parnu","harjumaa","rapla"]},
    harjumaa:{owner:1,soldiers:3,neighbors:["laanemaa","rapla","jarva","laaneviru"]},
    rapla:{owner:1,soldiers:2,neighbors:["harjumaa","laanemaa","jarva","parnu"]},
    
    parnu:{owner:-1,soldiers:0,neighbors:["saaremaa","viljandi","laanemaa","rapla","jarva"]},
    laaneviru:{owner:-1,soldiers:0,neighbors:["harjumaa","jarva","jogeva","idaviru"]},
    idaviru:{owner:-1,soldiers:0,neighbors:["jogeva","laaneviru"]},
    jogeva:{owner:-1,soldiers:0,neighbors:["idaviru","laaneviru","tartu","viljandi","jarva"]},
    tartu:{owner:-1,soldiers:0,neighbors:["polva","valga","jogeva","viljandi"]},
    
    jarva:{owner:2,soldiers:0,neighbors:["harjumaa","rapla","parnu","viljandi","jogeva","laaneviru"]},
    valga:{owner:-1,soldiers:0,neighbors:["viljandi","tartu","polva","voru"]},
    polva:{owner:-1,soldiers:0,neighbors:["tartu","valga","voru"]},
    voru:{owner:-1,soldiers:0,neighbors:["valga","polva"]},
    viljandi:{owner:-1,soldiers:0,neighbors:["parnu","jarva","jogeva","tartu","valga"]}
  }
  return board;
}
/*   */
    /*hiiumaa:{owner:1,soldiers:3,neighbors:["saaremaa","laanemaa"]},
    saaremaa:{owner:1,soldiers:6,neighbors:["hiiumaa","laanemaa","parnu"]},
    laanemaa:{owner:2,soldiers:0,neighbors:["hiiumaa","saaremaa","parnu","harjumaa","rapla"]},
    harjumaa:{owner:2,soldiers:0,neighbors:["laanemaa","rapla","jarva","laaneviru"]},
    rapla:{owner:1,soldiers:0,neighbors:["harjumaa","laanemaa","jarva","parnu"]},
    
    parnu:{owner:2,soldiers:0,neighbors:["saaremaa","viljandi","laanemaa","rapla","jarva"]},
    laaneviru:{owner:2,soldiers:0,neighbors:["harjumaa","jarva","jogeva","idaviru"]},
    idaviru:{owner:2,soldiers:0,neighbors:["jogeva","laaneviru"]},
    jogeva:{owner:2,soldiers:0,neighbors:["idaviru","laaneviru","tartu","viljandi","jarva"]},
    tartu:{owner:2,soldiers:0,neighbors:["polva","valga","jogeva","viljandi"]},
    
    jarva:{owner:2,soldiers:0,neighbors:["harjumaa","rapla","parnu","viljandi","jogeva","laaneviru"]},
    valga:{owner:2,soldiers:0,neighbors:["viljandi","tartu","polva","voru"]},
    polva:{owner:1,soldiers:0,neighbors:["tartu","valga","voru"]},
    voru:{owner:2,soldiers:0,neighbors:["valga","polva"]},
    viljandi:{owner:1,soldiers:0,neighbors:["parnu","jarva","jogeva","tartu","valga"]}*/
    /*    hiiumaa:{owner:-1,soldiers:0,neighbors:["saaremaa","laanemaa"]},
    saaremaa:{owner:-1,soldiers:0,neighbors:["hiiumaa","laanemaa","parnu"]},
    laanemaa:{owner:-1,soldiers:0,neighbors:["hiiumaa","saaremaa","parnu","harjumaa","rapla"]},
    harjumaa:{owner:-1,soldiers:0,neighbors:["laanemaa","rapla","jarva","laaneviru"]},
    rapla:{owner:-1,soldiers:0,neighbors:["harjumaa","laanemaa","jarva","parnu"]},
    
    parnu:{owner:-1,soldiers:0,neighbors:["saaremaa","viljandi","laanemaa","rapla","jarva"]},
    laaneviru:{owner:-1,soldiers:0,neighbors:["harjumaa","jarva","jogeva","idaviru"]},
    idaviru:{owner:-1,soldiers:0,neighbors:["jogeva","laaneviru"]},
    jogeva:{owner:-1,soldiers:0,neighbors:["idaviru","laaneviru","tartu","viljandi","jarva"]},
    tartu:{owner:-1,soldiers:0,neighbors:["polva","valga","jogeva","viljandi"]},
    
    jarva:{owner:-1,soldiers:0,neighbors:["harjumaa","rapla","parnu","viljandi","jogeva","laaneviru"]},
    valga:{owner:-1,soldiers:0,neighbors:["viljandi","tartu","polva","voru"]},
    polva:{owner:-1,soldiers:0,neighbors:["tartu","valga","voru"]},
    voru:{owner:-1,soldiers:0,neighbors:["valga","polva"]},
    viljandi:{owner:-1,soldiers:0,neighbors:["parnu","jarva","jogeva","tartu","valga"]}*/
   
    /*hiiumaa:{owner:1,soldiers:3,neighbors:["saaremaa","laanemaa"]},
    saaremaa:{owner:1,soldiers:6,neighbors:["hiiumaa","laanemaa","parnu"]},
    laanemaa:{owner:1,soldiers:0,neighbors:["hiiumaa","saaremaa","parnu","harjumaa","rapla"]},
    harjumaa:{owner:1,soldiers:0,neighbors:["laanemaa","rapla","jarva","laaneviru"]},
    rapla:{owner:1,soldiers:0,neighbors:["harjumaa","laanemaa","jarva","parnu"]},
    
    parnu:{owner:-1,soldiers:0,neighbors:["saaremaa","viljandi","laanemaa","rapla","jarva"]},
    laaneviru:{owner:1,soldiers:0,neighbors:["harjumaa","jarva","jogeva","idaviru"]},
    idaviru:{owner:1,soldiers:0,neighbors:["jogeva","laaneviru"]},
    jogeva:{owner:1,soldiers:0,neighbors:["idaviru","laaneviru","tartu","viljandi","jarva"]},
    tartu:{owner:1,soldiers:0,neighbors:["polva","valga","jogeva","viljandi"]},
    
    jarva:{owner:1,soldiers:0,neighbors:["harjumaa","rapla","parnu","viljandi","jogeva","laaneviru"]},
    valga:{owner:1,soldiers:0,neighbors:["viljandi","tartu","polva","voru"]},
    polva:{owner:1,soldiers:0,neighbors:["tartu","valga","voru"]},
    voru:{owner:1,soldiers:0,neighbors:["valga","polva"]},
    viljandi:{owner:1,soldiers:0,neighbors:["parnu","jarva","jogeva","tartu","valga"]}*/