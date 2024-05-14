/* Next task:

-turn this repo into new boilerplate
*/

// JS/CSS imports
import './styles.css';
// import './assets/book-remove.svg'; //asset files example
//include file extension For Node.js when importing local modules:
import { logToConsole as lg, log2DStringArray as lg2sa } from './logger.js';
import { makePlayer } from './main.js';

//jest testing for this file is in index.test.js and done with ES Module exports

//Main Project wrapped in initializer function to not have it's top level code execute when jest
//imports this file.
const initProject = ()=> {
  //Game flow starts here. sets up player/board states , UI, listeners, etc.
  const passDeviceDiv = document.querySelector('#passDeviceDiv');
  const continueBtn = document.querySelector('#continueBtn');
  const boardsAndLabelsDiv = document.querySelector('#boardsAndLabelsDiv');
  const receivingBoardDiv = document.querySelector('.receivingBoardDiv');
  const attackingBoardDiv = document.querySelector('.attackingBoardDiv');
  const msgDiv = document.querySelector('#msgDiv'); //feedback message div
  const startBtn = document.querySelector('#startBtn');
  const restartBtn = document.querySelector('#restartBtn');
  const clearableBtnsDiv = document.querySelector('.clearable'); //for ship direction button
  const shipOverlayDiv = document.querySelector('.shipOverlayDiv');
  const shipNamesToPlace = ['Patrol Boat', 'Destroyer', 'Submarine', 'Battleship', 'Carrier'];
  const shipLengths = [2, 3, 3, 4, 5];
  let lastHoveredCell; //store last cell hovered over
  let shipIndex;
  let shipDirection; //for ship placement
  let shipDirectionBtn;
  let gameType; //assign '1P'/'2P' when button clicked
  let player1; //player objects with gameboards
  let player2;
  let currentPlayer; //turn reference vars
  let opponent;
  let computerAttacking = false; //boolean to hold off premature attacks against computer
  let debounceTimerIdentifier; //store timeout identifier from the setTimeout in sendAttack
  let player1ShipsPlaced = false; //to track player1 ship placement completion
  let player1PlacingShips = false; //working on this
  let player2ShipsPlaced = false; //to track player2 ship placement completion
  let placeShipsRandomlyBtn; //save access to block it

  //fn to render a player's 2 boards; call after data changes in players' playGrid arrays
  const renderBoards = ()=> {
    // lg('rendering boards. current player has playGrid arr:'); //debug
    // lg( currentPlayer.getGameboard().getPlayGrid() ); //debug
    [[currentPlayer, receivingBoardDiv], [opponent, attackingBoardDiv]]
      .forEach( ([player, boardDiv])=> {
        boardDiv.textContent = ''; //delete old cells
        //build cells from playGrid array, append to board div
        player.getGameboard().getPlayGrid().forEach( (rowArr, row)=> {
          // lg(rowArr.join()); //debug
          rowArr.forEach( (data, col)=> {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('cellDiv');
            cellDiv.dataset.cellData = data;
            cellDiv.dataset.row = row;
            cellDiv.dataset.col = col;
            boardDiv.append( cellDiv );
          } );
        } );
      } );
  };

  //listener cb fn to handle sending an attack to opponent board and get computer's attacks
  const sendAttack = (e)=> {
    e.stopPropagation();
    //return early if debounceTimerIdentifier holds a timer identifier from setTimeout
    if (debounceTimerIdentifier) return;
    //return early if computer attack not done
    if (computerAttacking) return;
    //set computerAttacking to true
    if (gameType === '1P') computerAttacking = true;
    //using conditional since div border clicks trigger listener cb
    if (e.target.className === 'cellDiv') {
      //call receiveAttack fn on opponent's gameboard, save result for display logic
      const attackRes = opponent.getGameboard()
        .receiveAttack( [+e.target.dataset.row, +e.target.dataset.col] );
      //only re-render when attackRes is a useful string like hit or miss
      if (attackRes) {
        //log opponent playGrid arr after sending attack. comment for prod...
        // lg(`${opponent === player1 ? 'P1' : 'P2'}'s board:`);
        // lg2sa( opponent.getGameboard().getPlayGrid() );
        renderBoards();//show attack result
        //handle game over when all opponent's ships sunk
        if (opponent.getGameboard().allShipsSunk()) {
          //disable attackingBoardDiv, inform player
          attackingBoardDiv.removeEventListener('click', sendAttack);
          msgDiv.textContent = `Player ${ currentPlayer === player1 ? '1' : '2' } wins!`;
          computerAttacking = false; //disable to allow player's next attack
        //handle next player's turn: show attack result message, wait a little to hide
        //boards and show passDeviceDiv. After that, we wait for the device pass, and for
        //next player to press the continue button with the continueToNextPlayer cb fn.
        } else {
          msgDiv.textContent = attackRes === 'hit' ? 'Attack hit!' : 'Attack missed!';
          //show current player's attack / info message for a delayed period, then either hide
          //boards and show passDeviceDiv, or proceed with computer's attack
          debounceTimerIdentifier = setTimeout( () => {
            if (gameType === '2P') {
              boardsAndLabelsDiv.style.display = 'none';
              passDeviceDiv.style.display = 'block';
            } else { // gameType === '1P'
              getAndHandleComputerAttack();
            }
            debounceTimerIdentifier = null; //clear it after either path
          }, 1000); //extend this delay to 1000 for prod...
        }
      //handle click on cellDiv that did not result in hit / miss (previously attacked cell)
      } else {
        computerAttacking = false; //disable to allow player's next attack
      }
    //handle click not on a cellDiv, like border
    } else {
      computerAttacking = false; //disable to allow player's next attack
    }

  };

  //fn to get and handle computer's attacks. called by setTimeout after attacking computer
  const getAndHandleComputerAttack = ()=> {
    //get computer's attack coordinates, need to pass in player's board for computer decision
    const compAtkRes = currentPlayer.getGameboard().receiveAttack(
      opponent.getNextAttackCoords( currentPlayer.getGameboard().getPlayGrid() )
    );
    renderBoards();//show computer's attack
    msgDiv.textContent = compAtkRes === 'hit'
      ? 'Computer\'s attack hit! Make your turn..'
      : 'Computer\'s Attack missed! Make your turn..';
    //check if computer won
    if ( currentPlayer.getGameboard().allShipsSunk() ) {
      //disable attackingBoardDiv, inform player
      attackingBoardDiv.removeEventListener('click', sendAttack);
      msgDiv.textContent = 'Computer wins!';
    }
    computerAttacking = false; //disable to allow player's next attack
  };

  //cb fn to go to next player when continueBtn in passDeviceDiv clicked. Also
  //handles hiding between ship placements.
  const continueToNextPlayer = (e)=> {
    e.stopPropagation();
    [opponent, currentPlayer] = [currentPlayer, opponent]; //swap players
    // lg(currentPlayer === player1 ? 'switched to player1' : 'switched to player2'); //debug
    passDeviceDiv.style.display = 'none'; //hide
    //listen for P2 ships placement
    if (!player2ShipsPlaced && player1ShipsPlaced && !player1PlacingShips) {
      placeShipsAndSetup();
      // lg(4);
    //show next player's boards and info msg on click
    } else {
      renderBoards(); //remake cells
      msgDiv.textContent = `Player ${ currentPlayer === player1 ? '1' : '2' }'s attack turn..`;
      // lg(5);
    }
    boardsAndLabelsDiv.style.display = 'flex'; //show boards
  };

  //fn to set available buttons, attach listeners, start listening for attacks
  //need to make sure works for 2P...
  const setBtnsListenersAndStart = ()=> {
    restartBtn.removeAttribute('disabled'); //allow restarting, same gameType
    startBtn.setAttribute('disabled', ''); //block
    placeShipsRandomlyBtn.setAttribute('disabled', ''); //block
    //set listener to handle attack cell clicks
    attackingBoardDiv.addEventListener('click', sendAttack);
    msgDiv.textContent = `Player ${ currentPlayer === player1 ? 1 : 2}'s attack turn..`; //for UI
  };

  //cb fn to change ship placement direction. propagation ok
  const changeDirection = ()=> shipDirection = shipDirection === 'right' ? 'down' : 'right';

  //cb fn to place 5 ships in current player's gameboard
  const placeShipFromCell = (e)=> {
    e.stopPropagation();
    //when a ship must be placed and cursor is still over cell
    if (shipIndex < 5 && lastHoveredCell) {
      //try placing a ship; placeShip throws errors to catch
      try {
        currentPlayer.getGameboard().placeShip(
          [+lastHoveredCell.dataset.row, +lastHoveredCell.dataset.col],
          shipDirection,
          shipNamesToPlace[shipIndex]
        );
        renderBoards(); //show successfully placed ship
        shipIndex++; //increment index for correct ship on next placement
        //set msg for next ship placement if ship index valid
        if (shipIndex < 5) {
          msgDiv.textContent = `Place your ${shipNamesToPlace[shipIndex]}`;
        //confirm placements via startBtn when all ships placed (shipIndex === 5)
        } else {
          if (gameType === '1P') { //for 1P game
            //prep for game start, but still allow random placements
            shipPlacementCleanup(true); //remove listeners
            // lg(6);
          } else { //for 2P game
            shipOverlayDiv.style.display = 'none'; //hide
            // lg(7);
          }
          startBtn.removeAttribute('disabled'); //enable for confirmation
          msgDiv.textContent = 'Click start to confirm placements';
        }
      //catch and ship placement errors, inform user to try again
      } catch (err) {
        msgDiv.textContent = 'invalid ship placement, try again';
        // lg(err.message);
      }
    }
  };

  //listener cb fn to show shipOverlayDiv for current ship being placed. saves hovered cell
  const showShipOverlay = (e)=> {
    e.stopPropagation();
    lastHoveredCell = e.target.classList.contains('cellDiv') ? e.target : null;
    if (lastHoveredCell) { // .cellDivs only
      //align ship overlay to lastHoveredCell
      shipOverlayDiv.style.top = `${ lastHoveredCell.getBoundingClientRect().top
        + window.scrollY }px`;
      shipOverlayDiv.style.left = `${ lastHoveredCell.getBoundingClientRect().left
        + window.scrollX }px`;
      //set overlay dimensions from ship length
      if (shipDirection === 'right') { //place horizontal ship
        shipOverlayDiv.style.width = `${ lastHoveredCell
          .getBoundingClientRect().width * shipLengths[shipIndex] }px`;
        shipOverlayDiv.style.height = `${lastHoveredCell.getBoundingClientRect().height}px`;
      } else if (shipDirection === 'down') { //place vertical ship
        shipOverlayDiv.style.width = `${lastHoveredCell.getBoundingClientRect().width}px`;
        shipOverlayDiv.style.height = `${ lastHoveredCell
          .getBoundingClientRect().height * shipLengths[shipIndex] }px`;
      }
    }
  };

  //fn to clean up after ship placements. removes listeners
  const shipPlacementCleanup = (allowRandomPlacements = false)=> {
    receivingBoardDiv.removeEventListener('click', placeShipFromCell);
    receivingBoardDiv.removeEventListener('mouseover', showShipOverlay);
    shipOverlayDiv.style.display = 'none'; // hide shipOverlayDiv
    shipDirectionBtn.removeEventListener('click', changeDirection);
    shipDirectionBtn.setAttribute('disabled', ''); //disable direction btn
    //disable random placements btn conditionally
    if (!allowRandomPlacements) placeShipsRandomlyBtn.setAttribute('disabled', '');
  };

  const placeRandomly = ()=> {
    shipIndex = 5; //block manual ship placement
    currentPlayer.getGameboard().placeShipsRandomly(); //place ships randomly
    renderBoards(); //show ships
    //ask for placement confirmation via startBtn, but still allow random placements
    startBtn.removeAttribute('disabled');
    shipPlacementCleanup(true); //stop manual placement listeners
    msgDiv.textContent = 'Click start to confirm placements.';
  };

  //fn to listen for 5 ship placements in 2 ways: click-cells-to-place (simpler than
  //drag and drop), or click random placement. Placements confirmed via start button
  const placeShipsAndSetup = ()=> {
    shipIndex = 0;
    shipDirection = 'right'; //for ship placement

    // lg(`now listening for ${ currentPlayer === player1 ? 'P1' : 'P2'} placements`); //debug

    //add ship direction change, and random placement btns in cleared .clearable div
    clearableBtnsDiv.textContent = ''; //clear old btns
    shipDirectionBtn = document.createElement('button');
    shipDirectionBtn.textContent = 'change ship direction';
    shipDirectionBtn.addEventListener('click', changeDirection);
    placeShipsRandomlyBtn = document.createElement('button');
    placeShipsRandomlyBtn.textContent = 'place ships randomly';
    placeShipsRandomlyBtn.addEventListener('click', placeRandomly);
    clearableBtnsDiv.append( shipDirectionBtn, placeShipsRandomlyBtn ); //add to UI
    //enable preview overlay of ship to place on hovered .cellDiv element
    receivingBoardDiv.addEventListener('mouseover', showShipOverlay);
    //start listeners for player(s) ship placement
    receivingBoardDiv.addEventListener('click', placeShipFromCell);
    if (gameType === '2P') continueBtn.addEventListener('click', continueToNextPlayer );
    //show boards, shipOverlayDiv, placement message
    renderBoards(); //show current player's boards
    shipOverlayDiv.style.display = 'block';
    msgDiv.textContent = `Player ${ currentPlayer === player1 ? '1' : '2'}, click grid
    to place Patrol Boat, or the place ships randomly button`;
  };

  //listener for buttons in setupControlsWrap
  //begin game from btn of chosen game type
  document.querySelector('.setupControlsWrap').addEventListener('click', (e)=> {
    e.stopPropagation();

    switch (e.target.id) {
      //when 2P (battle other player) game type chosen...
      case 'playOtherPlayerBtn':
        gameType = '2P';
        //make and assign 2 players (both are default type human)
        player1 = makePlayer();
        player2 = makePlayer();
        [currentPlayer, opponent] = [player1, player2];
        //inform starting player, enable startBtn
        msgDiv.textContent = 'Player 1, please turn device away and click start';
        startBtn.removeAttribute('disabled'); //
        break;
      //when 1P (battle computer) game type chosen
      case 'playComputerBtn':
        document.querySelectorAll('.hideMe').forEach((c)=>c.className = ''); //show titles
        gameType = '1P'; //gameType for computer choice logic
        //make one human, one computer player
        player1 = makePlayer(); //type 'human' is default
        player2 = makePlayer('computer');
        [currentPlayer, opponent] = [player1, player2];
        //start ship placement listener, it will take over control flow and
        //setup/start game when all ships placed
        placeShipsAndSetup();
        break;
      //For 1P/2P games, startBtn control flow from game state
      case 'startBtn':
        //for 1P games:
        if (gameType === '1P') {
          player2.getGameboard().placeShipsRandomly();//populate computer's board randomly
          setBtnsListenersAndStart(); //setup / start game
        //for 2P games:
        //listen for P1 ship placements
        } else if (!player1ShipsPlaced && !player1PlacingShips) {
          document.querySelectorAll('.hideMe').forEach((c)=>c.className = ''); //show titles
          player1PlacingShips = true;//set placement state
          startBtn.setAttribute('disabled', ''); //disable btn
          placeShipsAndSetup(); //begin listening
          // lg(1);
        //accept P1 ship placements, hide boards, show passDeviceDiv. Once P2 has device and
        //clicks continueBtn, continueToNextPlayer handles listening for P2 ship placements
        } else if (player1PlacingShips && !player1ShipsPlaced) {
          player1PlacingShips = false; //set placement state
          player1ShipsPlaced = true; //set placement state
          startBtn.setAttribute('disabled', ''); //disable btn
          placeShipsRandomlyBtn.setAttribute('disabled', ''); //disable btn
          boardsAndLabelsDiv.style.display = 'none'; //hide boards
          passDeviceDiv.style.display = 'block'; //show passing screen with continueBtn
          msgDiv.textContent = ''; //clear prev player msg
          shipDirectionBtn.setAttribute('disabled', ''); //disable
          // lg(2);
        //accept P2 ship placements, start game. no need to pass device...
        } else if (player1ShipsPlaced && !player1PlacingShips) {
          player2ShipsPlaced = true; //set placement state
          shipPlacementCleanup(); //stop placement listeners
          setBtnsListenersAndStart(); //setup / start game
          // lg(3);
        }
        break;
      //handle boards/state reset, game restart
      case 'restartBtn':
        //path for restarting computer battle
        if (gameType === '1P') {
          //remake boards, reset player order
          player1 = makePlayer();
          player2 = makePlayer('computer');
          [currentPlayer, opponent] = [player1, player2];
          attackingBoardDiv.removeEventListener('click', sendAttack); //disable until ships placed
          restartBtn.setAttribute('disabled', ''); //disable until game starts
          //start ship placement listener, it will take over control flow and
          //setup/start game when all ships placed
          placeShipsAndSetup();
        //path for restarting 2 player battle...
        } else {
          // lg('restarting 2p game..');//debug
          // debugger
          //restore boards if restart button pressed when passDeviceDiv active
          boardsAndLabelsDiv.style.display = 'flex';
          passDeviceDiv.style.display = 'none';
          //reset boards by reassigning player1/2 to new player objects with null playGrid arrays
          player1 = makePlayer();
          player2 = makePlayer();
          [currentPlayer, opponent] = [player1, player2];
          attackingBoardDiv.removeEventListener('click', sendAttack); //disable until ships placed
          restartBtn.setAttribute('disabled', ''); //disable until game starts
          //reset some ship placement states
          player1PlacingShips = true;
          player1ShipsPlaced = false;
          player2ShipsPlaced = false;
          //start ship placement listener; it takes over control flow and does
          //game setup/start when all ships placed
          placeShipsAndSetup();
        }
        break;
    }

  });

  // Remove the initProject event listener
  document.removeEventListener('DOMContentLoaded', initProject);
}; //end of wrapped project
// Start project code when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initProject);
