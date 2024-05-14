/* Next task:

*/

// JS imports
//include file extension For Node.js when importing local modules:
import { logToConsole as lg, objectToString as ots, logSetValues as lsv } from './logger.js';
import makeLinkedList from './linkedList.js';

//jest testing for this file is in main.test.js and done with ES Module exports

//fn to make ship objects
export const makeShip = ( shipName )=> {
  let length; let hits = 0; let isSunk = false;
  //assign ship length from name
  switch (shipName) {
    case 'Carrier':
      length = 5;
      break;
    case 'Battleship':
      length = 4;
      break;
    case 'Destroyer':
      length = 3;
      break;
    case 'Submarine':
      length = 3;
      break;
    case 'Patrol Boat':
      length = 2;
  }

  const hitShip = ()=> {
    if ( hits < length ) hits += 1; // increase hits
    if ( hits === length ) isSunk = true; // check to sink
  };

  return {
    getLength: ()=> length,
    getHits: ()=> hits,
    isSunk: ()=> isSunk, // bool of sink state
    hitShip, // call when hit
    shipName
  };
};

//private makeGameboard fn to place a ship on board and return a ship obj. The board
//marking part of placing a ship is done in this fn by editing the playGrid array.
//errors thrown for invalid placement arguments
const _placeAndGetShip = ( startCoords, direction, shipName, playGrid )=> {
  const ship = makeShip(shipName);
  const markEnd = ship.getLength();
  const possibleMarkCoords = [];

  //fn to check if cell is in bounds of 10 x 10 2D playGrid arr and free.
  const isValid = (row, col)=> {
    if ( row > -1 && row < 10 && col > -1 && col < 10 ) {
      //check if cell is occupied
      if ( playGrid[row][col] === null ) return true;
      throw new Error(`cell ${row},${col} occupied`); //when cell has a ship
      //*throw statement immediately ends fn execution. control then passed to first
      //catch block in the call stack. program terminates if no catch block exists
      //among caller functions.
    }
    throw new Error(`cell ${row},${col} out of bounds`); //when cell out of bounds
  };

  //place ship on board by checking if all cells valid to mark with ship name.
  //consider direction and gather possible marks from start in an array
  let newRow;
  let newCol;
  for (let markCount = 0; markCount < markEnd; markCount++) {
    switch (direction) {
      case 'up': //upwards marking
        [newRow, newCol] = [startCoords[0] - markCount, startCoords[1]]; //destructuring reassign
        if ( isValid( newRow, newCol ) ) possibleMarkCoords.push( [newRow, newCol] );
        break;
      case 'right': //rightwards marking
        [newRow, newCol] = [startCoords[0], startCoords[1] + markCount];
        if ( isValid( newRow, newCol ) ) possibleMarkCoords.push( [newRow, newCol] );
        break;
      case 'down': //downwards marking
        [newRow, newCol] = [startCoords[0] + markCount, startCoords[1]];
        if ( isValid( newRow, newCol ) ) possibleMarkCoords.push( [newRow, newCol] );
        break;
      case 'left': //leftwards marking
        [newRow, newCol] = [startCoords[0], startCoords[1] - markCount];
        if ( isValid( newRow, newCol ) ) possibleMarkCoords.push( [newRow, newCol] );
    }
  }
  //mark board when total possible marks match ship length (i.e. only valid marks made)
  if ( possibleMarkCoords.length === ship.getLength() ) {
    possibleMarkCoords.forEach( (markCoords)=> {
      playGrid[markCoords[0]][markCoords[1]] = shipName;
    } );
  }
  //return ship to caller for saving
  return ship;
};

//fn to make gameboard objects.
export const makeGameboard = ()=> {
  //start with 10 x 10 2D playGrid array of null elements, representing board cells.
  //Cells can change to hold data strings of the cell state: hit/miss/shipName.
  //Top left board cell coordinates are 0,0. Each 2nd dimension array maps to a board
  //row, top to bottom. Each element of 2nd dimension arrays maps to a board column,
  //from left to right.
  let playGrid = [...Array(10)].map( ()=> Array(10).fill(null) );
  //store made ships in this js Map for quick access:
  let shipsMap = new Map();

  //this fn calls private _placeAndGetShip with playGrid reference and expects ship obj back
  //errors on invalid placement arguments, can use try-catch blocks
  const placeShip = (startCoords, direction, shipName,)=> { //types: arr,str,str
    //place ship by marking board in _placeAndGetShip, then set returned ship in shipsMap
    shipsMap.set( shipName, _placeAndGetShip(startCoords, direction, shipName, playGrid) );
  };

  //fn to populate board with the ships in random positions
  const placeShipsRandomly = ()=> {
    //clear grid, shipsMap. no iteration for better time complexity
    playGrid = [...Array(10)].map( ()=> Array(10).fill(null) );
    shipsMap = new Map();
    //make array of ship names from largest to smallest
    const shipsToPlace = ['Carrier', 'Battleship', 'Submarine', 'Destroyer', 'Patrol Boat'];
    const shipSizes = [5, 4, 3, 3, 2]; //use this with loop to fill in set
    const markedCoords = new Set();
    const coordsToTry = makeLinkedList(); //pick random coords arr from this shrinking list
    playGrid.forEach( (rowArr, row)=> { //fill list with coord arrays
      rowArr.forEach( (data, col)=> coordsToTry.append([row, col]) );
    } );
    //recursive fn to place all ships. randomized greedy algo w/ small inifinite loop chance
    const placeShips = (shipIndex)=> {
      //base case: done placing when shipIndex matches length of shipsToPlace
      if (shipIndex === shipsToPlace.length) return;
      //pick random aim/direction and coordinate from linked list
      let aim = Math.random() < 0.5 ? 'right' : 'down';
      const currentCoord = coordsToTry
        .removeAt( Math.floor( Math.random() * coordsToTry.getSize() ) );
      //abandon coordinate if in markedCoords set
      if ( markedCoords.has(currentCoord.join(',')) ) {
        // lg(`${currentCoord} occupied, trying again`);
        placeShips(shipIndex);
      } else {
        try { //place ship with random available coordinate
          placeShip( currentCoord, aim, shipsToPlace[shipIndex] );
          //keep track of cells marked in playGrid past origin in a set to check.
          //removal from linked list is expensive.
          for (let i = 1; i < shipSizes[shipIndex]; i++) {
            if (aim === 'right') { //track right from placement origin
              markedCoords.add(`${currentCoord[0]},${currentCoord[1] + i}`);
            } else { //track down from placement origin
              markedCoords.add(`${currentCoord[0] + i},${currentCoord[1]}`);
            }
          }
          placeShips(++shipIndex);//place next ship recursively
        } catch (err) { //try again with modded placement args if ship placement failed.
          //remember isValid in _placeAndGetShip checks all cells to throw errors
          //try new coordinate if origin throws occupied error
          if ( +err.message[5] === currentCoord[0]
            && +err.message[7] === currentCoord[1] ) {
            // lg('origin coordinate occupied. will try new one');
            placeShips(shipIndex);
          } else { //try placing in opposite aim
            // lg(`found ${err.message} during ${shipsToPlace[shipIndex] } placement. will try opposite aim`);
            try { //try opposite aim before abandoning origin coordinate
              aim = aim === 'right' ? 'left' : 'up';
              placeShip( currentCoord, aim, shipsToPlace[shipIndex] );
              for (let i = 1; i < shipSizes[shipIndex]; i++) { //track cells past origin
                if (aim === 'left') { //track left from placement origin
                  markedCoords.add(`${currentCoord[0]},${currentCoord[1] - i}`);
                } else { //track up from placement origin
                  markedCoords.add(`${currentCoord[0] - i},${currentCoord[1]}`);
                }
              }
              placeShips(++shipIndex);//place next ship recursively
            } catch (err) { //2 omnidirectional tries from origin done, abandon for now
              // lg(`found ${err.message} during ${shipsToPlace[shipIndex] } placement. will try new coordinate`);
              coordsToTry.append(currentCoord);//return unused coord to linked list
              placeShips(shipIndex);
            }
          }
        }
      }
    };
    //start placing all ships recursively
    placeShips(0);
    // lsv(markedCoords); //view set...
  };

  //fn to handle attack from coordinates. must call hit on ships, or record missed shot.
  //returns the new mark for UI update logic
  const receiveAttack = ( attackCoords )=> {
    const row = attackCoords[0];
    const col = attackCoords[1];
    //check in bounds cells
    //* _placeAndGetShip isValid fn has Error throwing based logic, extracting it can wait.
    if ( row > -1 && row < 10 && col > -1 && col < 10 ) {
      switch (playGrid[row][col]) {
        //if attacked cell data is null, mark with miss
        case null:
          playGrid[row][col] = 'miss';
          return 'miss';
        //call ship's hitShip(), then update mark
        case 'Patrol Boat':
        case 'Destroyer':
        case 'Submarine':
        case 'Battleship':
        case 'Carrier':
          shipsMap.get(playGrid[row][col]).hitShip();
          playGrid[row][col] = 'hit';
          return 'hit';
      }
    } else throw new Error('attack out of bounds');
  };

  //fn to return boolean based on all ships' sunk states.
  //The some() CB checks if any ship is floating, answering: 'are all ships sunk?'.
  //If floating ship found, some() immediately returns true. The result is then
  //inversed before returning from allShipsSunk()
  const allShipsSunk = ()=> ![...shipsMap.values()].some( (ship)=> !ship.isSunk() );
  /* old checking code, clear and fine but long.
  let res = true; let done;
  shipsMap.forEach( (val)=> {
    if ( done ) return;
    //if any ship is not sunk, return false
    if ( !val.isSunk() ) { res = false; done = true; } } );
  return res;
  */

  return {
    getPlayGrid: ()=> playGrid,
    placeShip,
    receiveAttack,
    getShipsMap: ()=> shipsMap,
    allShipsSunk,
    placeShipsRandomly
  };
};

//object composition fn. pass in computer's gameboard as state for structure, return
//an object with computer methods for spreading into player object. computer methods
//(like getNextURDLCellCoords) will use the passed in opponent's board.
const isComputer = (gameboard)=> {
  //make linked list with nodes of '0,0' to '9,9' string values representing attack
  //coordinates. A playGrid 2D array is used for structure.
  const coordsToTry = makeLinkedList();
  gameboard.getPlayGrid().forEach( (rowArr, row)=> {
    rowArr.forEach( (data, col)=> coordsToTry.append( `${row},${col}` ) );
  } );
  //vars to compare last 2 coordinates and calculate inline attacks
  let lastHitCoords;
  let secondLastHitCoords;
  let hitOrigin;

  //fn to get the next valid URDL (up,right,down,left) cell to attack if found.
  //Returns 2 elem array of: row/col coordinates and attack's hit/miss
  const getNextURDLCellCoords = (playerPlayGrid)=> {
    const [lastHitRow, lastHitCol] = lastHitCoords;
    //need to loop over 2 arrays of 4 row/col move offsets, ordered cw from top
    const rowOffsets = [-1, 0, 1, 0];
    const colOffsets = [0, 1, 0, -1];
    //4 operation loop to find next adjacent cell to attack
    for ( let i = 0; i < 4; i++ ) {
      const newRow = lastHitRow + rowOffsets[i];
      const newCol = lastHitCol + colOffsets[i];
      //filter to in bounds cells
      if (newRow < 10 && newRow > -1 && newCol < 10 && newCol > -1) {
        //filter to cells with null or a ship name
        switch ( playerPlayGrid[newRow][newCol] ) {
          case null:
            //remove coord from coordsToTry linked list
            coordsToTry.removeAt( coordsToTry.findIndex(`${newRow},${newCol}`) );
            return [[newRow, newCol], 'miss'];
          case 'Patrol Boat':
          case 'Destroyer':
          case 'Submarine':
          case 'Battleship':
          case 'Carrier':
            //remove coord from coordsToTry linked list
            coordsToTry.removeAt( coordsToTry.findIndex(`${newRow},${newCol}`) );
            return [[newRow, newCol], 'hit'];
          default:
            // lg(`no null or ship name found at row: ${newRow} col: ${newCol
            // }. for loop iteration index: ${i}`);
        }
      }
    }
    //no valid URDL cell if no return from loop. return null so getNextAttackCoords
    //picks a random cell
    return [[null, null], null];
  };

  //fn to get computer's next attack. Accesses opponent gameboard arr for cell data
  //works ok with spaced apart ships, but if ships touch, or board too crowded, degrades
  const getNextAttackCoords = (playerPlayGrid)=> {
    //if secondLastHitCoords holds a value from two previous URDL (up,right,down,left)
    //adjacent hits, begin linear attacks
    if (secondLastHitCoords) {
      const [lastRow, lastCol] = lastHitCoords;
      const [secLastRow, secLastCol] = secondLastHitCoords;
      //when last hits are horizontally aligned
      if ( lastRow === secLastRow ) {
        //check to attack left when cell is a ship's name or null
        if ( lastCol > 0 && playerPlayGrid[lastRow][lastCol - 1] !== 'hit'
          && playerPlayGrid[lastRow][lastCol - 1] !== 'miss' ) {
          //update vars if leftwards inline attack will hit a ship
          if ( playerPlayGrid[lastRow][lastCol - 1] !== null ) {
            secondLastHitCoords = lastHitCoords;
            lastHitCoords = [lastRow, lastCol - 1];
          }
          //switch last hit vars to attack rightwards on next turn since this attack misses
          if ( playerPlayGrid[lastRow][lastCol - 1] === null ) {
            //set lastHitCoords to hitOrigin coords, allowing to start from them next turn
            lastHitCoords = hitOrigin;
            //assign secondLastHitCoords to a same alignment hit adjacent to hitOrigin coords
            secondLastHitCoords = [hitOrigin[0], hitOrigin[1] - 1];
          }
          //return this turn's leftward attack
          coordsToTry.removeAt( coordsToTry.findIndex(`${lastRow},${lastCol - 1}`) );
          return [lastRow, lastCol - 1];
        }
        //check to attack right when cell is a ship's name or null
        if ( lastCol < 9 && playerPlayGrid[lastRow][lastCol + 1] !== 'hit'
          && playerPlayGrid[lastRow][lastCol + 1] !== 'miss' ) {
          //update vars if rightwards inline attack will hit a ship
          if ( playerPlayGrid[lastRow][lastCol + 1] !== null ) {
            secondLastHitCoords = lastHitCoords;
            lastHitCoords = [lastRow, lastCol + 1];
          }
          //switch last hit vars to attack lefttwards on next turn since this attack misses
          if ( playerPlayGrid[lastRow][lastCol + 1] === null ) {
            //set lastHitCoords to hitOrigin coords, allowing to start from them next turn
            lastHitCoords = hitOrigin;
            //assign secondLastHitCoords to a same alignment hit adjacent to hitOrigin coords
            secondLastHitCoords = [hitOrigin[0], hitOrigin[1] + 1];
          }
          //return this turn's rightward attack
          coordsToTry.removeAt( coordsToTry.findIndex(`${lastRow},${lastCol + 1}`) );
          return [lastRow, lastCol + 1];
        }
      //when last hits are vertically aligned
      } else if (lastCol === secLastCol) {
        //check to attack up when cell is a ship's name or null
        if ( lastRow > 0 && playerPlayGrid[lastRow - 1][lastCol] !== 'hit'
          && playerPlayGrid[lastRow - 1][lastCol] !== 'miss' ) {
          //update vars if upwards inline attack will hit a ship
          if ( playerPlayGrid[lastRow - 1][lastCol] !== null ) {
            secondLastHitCoords = lastHitCoords;
            lastHitCoords = [lastRow - 1, lastCol];
          }
          //switch last hit vars to attack downwards on next turn since this attack misses
          if ( playerPlayGrid[lastRow - 1][lastCol] === null ) {
            //set lastHitCoords to hitOrigin coords, allowing to start from them next turn
            lastHitCoords = hitOrigin;
            //assign secondLastHitCoords to a same alignment hit adjacent to hitOrigin coords
            secondLastHitCoords = [hitOrigin[0] - 1, hitOrigin[1]];
          }
          //return this turn's upward attack
          coordsToTry.removeAt( coordsToTry.findIndex(`${lastRow - 1},${lastCol}`) );
          return [lastRow - 1, lastCol];
        }
        //check to attack down when cell is a ship's name or null
        if ( lastRow < 9 && playerPlayGrid[lastRow + 1][lastCol] !== 'hit'
          && playerPlayGrid[lastRow + 1][lastCol] !== 'miss' ) {
          //update vars if downwards inline attack will hit a ship
          if ( playerPlayGrid[lastRow + 1][lastCol] !== null ) {
            secondLastHitCoords = lastHitCoords;
            lastHitCoords = [lastRow + 1, lastCol];
          }
          //switch last hit vars to attack upwards on next turn since this attack misses
          if ( playerPlayGrid[lastRow + 1][lastCol] === null ) {
            //set lastHitCoords to hitOrigin coords, allowing to start from them next turn
            lastHitCoords = hitOrigin;
            //assign secondLastHitCoords to a same alignment hit adjacent to hitOrigin coords
            secondLastHitCoords = [hitOrigin[0] + 1, hitOrigin[1]];
          }
          //return this turn's downward attack
          coordsToTry.removeAt( coordsToTry.findIndex(`${lastRow + 1},${lastCol}`) );
          return [lastRow + 1, lastCol];
        }
      }
      //this point is reached when an attack could not be made at any end, for example
      //when ship is at edge or between missed shots. set up next attack as random by
      //clearing last two hit references.
      [lastHitCoords, secondLastHitCoords] = [null, null];
    }

    //if lastHitCoords holds a value from a previous turn that hit, try attacking
    //an URDL sibling cell to find an adjacent hit. this provides direction context.
    if (lastHitCoords) {
      const [nextAtkCoords, hitOrMiss] = getNextURDLCellCoords(playerPlayGrid);
      //return attacks that hit for linear attacking next turn. return missed attacks as is
      switch (hitOrMiss) {
        case 'hit':
          // Save coordinates for linear attacks next turn
          secondLastHitCoords = lastHitCoords;
          lastHitCoords = nextAtkCoords;
          return nextAtkCoords;
        case 'miss':
          return nextAtkCoords;
      }
    //if no hit or miss, let fn continue to return a random cell
    }

    //get random attack coordinate array with a random index within the linked list size. Use
    //linked list removeAt() to get the coordinate value and prevent re-attacking the cell.
    const atkCoords = coordsToTry.removeAt( Math.floor( Math.random() * coordsToTry.getSize() ) )
      .split(',').map(Number);
    //do something according to data in cell
    switch ( playerPlayGrid[atkCoords[0]][atkCoords[1]] ) {
      //for missed attack coords:
      case null:
        return atkCoords;
      //for hit attack coords:
      case 'Patrol Boat':
      case 'Destroyer':
      case 'Submarine':
      case 'Battleship':
      case 'Carrier':
        //if atkCoords will hit, save them to start checking URDL cells for an
        //adjacent hit from next turn
        lastHitCoords = atkCoords;
        //set hitOrigin to atkCoords before returning to UI logic
        hitOrigin = atkCoords;
        return atkCoords;
    }
  };

  return {
    getNextAttackCoords
  };
};

//fn to make player objects. player types (strings) are 'human' or 'computer' and have
//their own gameboard
export const makePlayer = (type = 'human')=> {
  const gameboard = makeGameboard();

  return {
    getGameboard: ()=> gameboard,
    getType: ()=> type,
    ...type === 'computer' ? isComputer(gameboard) : {} //conditional composition
  };
};
