import { makeShip, makeGameboard, makePlayer } from './main.js';
import { logToConsole as lg, objectToString as ots, log2DStringArray } from './logger.js';

test('use jsdom in this test file', () => {
  const element = document.createElement('div');
  expect(element).not.toBeNull();
});

test('ship obj creation with: length, hitsReceived, isSunk', () => {
  //make a default 2 length ship, sink it
  const testShip = makeShip('Patrol Boat');
  testShip.hitShip();
  testShip.hitShip();
  //check it's state
  expect(testShip.getLength()).toBe(2);
  expect(testShip.getHits()).toBe(2);
  expect(testShip.isSunk()).toBe(true);
  expect(testShip.shipName).toBe('Patrol Boat');
});

test('gameboard obj creation', ()=> {
  //make 10x10 Gameboard instance
  const board = makeGameboard();
  //check board methods
  //board should be 2D array of 100 null elements
  expect(board.getPlayGrid()).toEqual( [...Array(10)].map( ()=> Array(10).fill(null) ) );
  //place ships with 3 args: startCoords, direction, ship name
  board.placeShip( [0, 0], 'right', 'Patrol Boat' ); //length 2
  board.placeShip( [1, 2], 'left', 'Destroyer' ); //length 3
  board.placeShip( [2, 0], 'right', 'Submarine' ); //length 3
  board.placeShip( [6, 8], 'down', 'Battleship' ); //length 4
  board.placeShip( [9, 9], 'up', 'Carrier' ); //length 5
  //out of bounds / occupied placement tests
  expect( ()=> board.placeShip( [0, 0], 'right', 'Carrier' ) ).toThrow('cell 0,0 occupied');
  expect( ()=> board.placeShip( [0, 9], 'right', 'Carrier' ) ).toThrow('cell 0,10 out of bounds');
  //received attack tests
  expect( ()=> board.receiveAttack([10, 0]) ).toThrow('attack out of bounds');
  board.receiveAttack([5, 0]);
  expect( board.getPlayGrid()[5][0] ).toBe('miss');
  //sink carrier from: 9,9 to 5,9
  board.receiveAttack([9, 9]);
  board.receiveAttack([8, 9]);
  board.receiveAttack([7, 9]);
  board.receiveAttack([6, 9]);
  board.receiveAttack([5, 9]);
  expect( board.getPlayGrid()[9][9] ).toBe('hit');//check playGrid arr mar
  expect( board.getPlayGrid()[8][9] ).toBe('hit');
  expect( board.getPlayGrid()[7][9] ).toBe('hit');
  expect( board.getPlayGrid()[6][9] ).toBe('hit');
  expect( board.getPlayGrid()[5][9] ).toBe('hit');
  expect( board.getShipsMap().get('Carrier').getHits() ).toBe(5); //check hits
  expect( board.getShipsMap().get('Carrier').isSunk() ).toBe(true);//check sunk

  //visualize board
  // log2DStringArray( board.getPlayGrid() );
});

test('gameboard obj tests 1', ()=> {
  //make 10x10 Gameboard instance
  const board = makeGameboard();
  //check board methods
  //place ships with 3 args: startCoords, direction, ship name
  board.placeShip( [0, 0], 'right', 'Patrol Boat' ); //length 2
  board.placeShip( [9, 9], 'up', 'Carrier' ); //length 5
  //sink patrol boat from 0,0 to 0,1
  board.receiveAttack([0, 0]);
  board.receiveAttack([0, 1]);
  expect( board.getPlayGrid()[0][0] ).toBe('hit');//check playGrid arr mar
  expect( board.getPlayGrid()[0][1] ).toBe('hit');
  expect( board.getShipsMap().get('Patrol Boat').getHits() ).toBe(2); //check hits
  expect( board.getShipsMap().get('Patrol Boat').isSunk() ).toBe(true);//check sunk
  //carrier still floating
  expect( board.getShipsMap().get('Carrier').isSunk() ).toBe(false);//check sunk
  //check if all ships sunk
  expect( board.allShipsSunk() ).toBe(false);

  //visualize board
  // log2DStringArray( board.getPlayGrid() );
});

test('gameboard random ship population', ()=> {
  const board = makeGameboard();
  board.placeShipsRandomly(); //place ships randomly
  // log2DStringArray( board.getPlayGrid() ); //visualize board
});

test('player obj creation', ()=> {
  //make two players
  const player1 = makePlayer();
  const computerPlayer = makePlayer('computer');
  //check board / playGrid array made with nulls to start
  expect( player1.getType() ).toBe('human');
  expect( player1.getGameboard().getPlayGrid()[0][0] ).toBeNull();
  //check computer players can be made and provide attack coordinates
  expect( computerPlayer.getType() ).toBe('computer');
  //make sure coords array of length 2 is returned
  expect( computerPlayer.getNextAttackCoords(
    player1.getGameboard().getPlayGrid()
  ).length ).toBe(2);

});
