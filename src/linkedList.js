/* Next task
-optimize by keeping a reference to the second last node in addition to the tail, called penultimate. AND!!!! check every single other function will correctly set it after implementing the optimization
*/

import { logToConsole as lg } from './logger.js'; //shorthand loggers

//node creation fn
const makeNode = (value = null, next = null)=> ( { value, next } );
//linked list creation fn
const makeLinkedList = (head = null, tail = null)=> {
  let currentSize = 0; //cache the size to not always recalculate
  //management fns
  //fn to add node to end of list
  const append = (value)=> {
    //handle empty list
    if ( !head ) {
      head = makeNode(value);
      tail = head;
    } else { //handle non-empty list
      //create new node at tail
      tail.next = makeNode(value);
      tail = tail.next; //set new tail
    }
    currentSize++;
  };

  //fn to add node at beginning of list
  const prepend = (value)=> {
    //handle empty list
    if ( !head ) {
      head = makeNode(value);
      tail = head;
    } else { //make, set new head node
      const newHead = makeNode(value);
      newHead.next = head;
      head = newHead;
    }
    currentSize++;
  };

  //OLD PRE MEMOIZATION CODE: fn to return amount of nodes in list.
  // const getSize = ()=> {
  //   let size = 0;
  //   let currentNode = head;
  //   while ( currentNode ) { //loop based on existence of next node
  //     size++;
  //     currentNode = currentNode.next;
  //   }
  //   return size;
  // };

  //NEW MEMOIZATION CODE: fn to return amount of nodes in list.
  const getSize = ()=> currentSize;

  //fn to get node from an index. optionally provide boolean for skipValidation for internal invocations
  const at = (index, skipValidation)=> {
    let currentNode = head;
    if (!skipValidation) {
      if ( index < 0 || index >= getSize() ) {
        throw new Error('Index outside list bounds [list is zero-indexed]');
      }
    }
    for ( let currentIndex = 0; currentIndex <= index; currentIndex++ ) {
      if ( currentIndex === index) return currentNode;
      currentNode = currentNode.next; //move to next node
    }
  };

  //fn to remove tail node of list
  const pop = ()=> {
    //handle empty list
    if ( getSize() === 0 ) {
      lg( 'list empty, nothing to remove' );
      return;
    }
    //handle popping of last node
    if ( getSize() === 1 ) {
      [head, tail] = [null, null];
      currentSize--;
      return;
    }
    //since this is not a doubly-linked list, we need to traverse the list to the end
    let currentNode = head;
    while ( currentNode.next ) {
      tail = currentNode; //before changing currentNode, set tail to point to previous node
      currentNode = currentNode.next; //move to next node
    }
    //once tail is set correctly, pop last node.
    tail.next = null;
    currentSize--;
  };

  /*

  //fn to check if a value is in the list, not needed, just check if findIndex returns an index
  const contains = (value)=> {
    //traverse and compare
    let currentNode = head;
    while ( currentNode ) {
      if ( currentNode.value === value ) return true;
      currentNode = currentNode.next; //move to next node
    }
    return false;//when value not in list
  };

  */

  // given a value, get the index of the node if value exists in list. use instead of
  //contains method above, since null returned when no node with value found in list
  const findIndex = (value)=> {
    //travese, compare, save index
    let index = 0;
    let currentNode = head;
    while ( currentNode ) {
      if ( currentNode.value === value ) return index;
      index++;
      currentNode = currentNode.next; //move to next node
    }
    return null; //handle value not found
  };

  // insert a new node at insertion index
  const insertAt = (value, insertIndex)=> {
    lg( `value to insert: ${value}` );
    // throw error if the list does not have the indexed space created, like
    // trying to insert to 0 on an empty list, or to an index past the last index.
    if ( insertIndex < 0 || insertIndex >= getSize() ) {
      throw new Error(`Insertion Index not in list bounds. (List empty: ${
        getSize() === 0 ? 'true' : 'false'
      })`);
    }
    // handle node insertions at head
    if ( insertIndex === 0 ) {
      prepend(value);
      return;
    }
    //handle insertion at index within list after head
    const previousNode = at(insertIndex - 1, true);//skips validation in at()
    const nextNode = previousNode.next.next;
    //create new node with value and the nextNode
    previousNode.next = makeNode(value, nextNode);
    currentSize++;
  };

  // remove node at index, return it's value
  const removeAt = (removalIndex)=> {
    // lg( `index of node to remove: ${removalIndex}` );
    // throw error if the list does not have the indexed space created, like
    // trying to remove 0 on an empty list, or to an index past the last index.
    if ( removalIndex < 0 || removalIndex >= getSize() ) {
      throw new Error(`Removal Index not in list bounds. (List empty: ${
        getSize() === 0 ? 'true' : 'false'
      })`);
    }
    let returnVal;
    // handle node removal at head
    if ( removalIndex === 0 ) {
      returnVal = head.value;
      head = head.next;
      currentSize--;
      return returnVal;
    }
    //handle removal at index within list after head
    const previousNode = at(removalIndex - 1, true); //skips validation in at()
    returnVal = previousNode.next.value;
    const nextNode = previousNode.next.next;
    //connect nodes together
    previousNode.next = nextNode;
    currentSize--;
    return returnVal;
  };

  const toString = ()=> {
    //handle empty list
    if ( getSize() === 0 ) {
      return 'linked list is empty';
    }
    let result = '';
    let currentNode = head;
    //traverse, concat
    while ( currentNode ) {
      result += `( ${currentNode.value} ) -> `;
      currentNode = currentNode.next; //move to next node
    }
    result += 'null';
    return result;
  };

  return {
    append,
    prepend,
    getHead: ()=> head,
    getTail: ()=> tail,
    getSize,
    at,
    pop,
    // contains, //use findIndex
    findIndex,
    toString,
    insertAt,
    removeAt,
  };
};
export default makeLinkedList;
//testing
// const linkedList1 = makeLinkedList();
// linkedList1.append( 'banana' );
// linkedList1.append( 'pear' );
// lg( JSON.stringify( linkedList1.getHead(), null, '\t' ) ); //wow!!!
// lg( `nodes in linked list: ${ linkedList1.getSize() }` );
// lg( `tail of linked list: ${ JSON.stringify( linkedList1.getTail(), null, '\t' ) }` );
// lg( `node at index 1 of linked list: ${ JSON.stringify( linkedList1.at(1), null, '\t' ) }` );
// lg( `index of 'cherry' in list: ${ linkedList1.findIndex('cherry') }` );
// linkedList1.insertAt('apple', 0);
// lg( linkedList1.removeAt(0) );
// lg( linkedList1.toString() );
