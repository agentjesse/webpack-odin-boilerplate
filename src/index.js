/* Next task:
-  write next tasks for project here, commit messages get buried
- example task
*/

// importing CSS directly into the related js file
import './styles.css';

// module imports, from named and default
import { logToConsole as lg, tableToConsole as tb} from "./logger"; //shorthand loggers
import { functionOne,functionTwo } from './myModule';
import myName from './myName'; // 'myName' can be changed here, but not in the source

//modules import testing
functionOne();
console.log( functionTwo() );
console.log( myName('jerry') );

//source map error test
//cosnole.log( myName('jerry') );

const booksGrid = document.querySelector('.booksGrid');
const newBookBtn = document.querySelector('#newBookBtn');
const newBookModal = document.querySelector('#newBookModal');
const closeModalBtn = document.querySelector('#closeModalBtn');
const submitBookBtn = document.querySelector('#submitBookBtn');
const titleInput = document.querySelector('#title');
const authorInput = document.querySelector('#author');
const pagesInput = document.querySelector('#pages');
const readInput = document.querySelector('#read');
//library that stores book objects will be an array
const myLibrary = [
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    pages: 277,
    read: false
  },
  {
    title: "Lord of the Flies",
    author: "William Golding",
    pages: 224,
    read: false
  },
  {
    title: "Fahrenheit 451",
    author: "Ray Bradbury",
    pages: 249,
    read: false
  },
  {
    title: "Animal Farm",
    author: "George Orwell",
    pages: 112,
    read: false
  },
  {
    title: "Brave New World",
    author: "Aldous Huxley",
    pages: 311,
    read: false
  }
];

//book objects constructor
function Book(title, author, pages, read) {
  this.title = title;
  this.author = author;
  this.pages = pages ? pages : 'N/A';
  this.read = read;
}
//Book object methods on the shared prototype object. not using arrow functions for the this value
Book.prototype.changeReadState = function () {
  this.read = this.read ? false : true;
};

//create a book, add to library array
function addBookToLibrary(title, author, pages, read) {
  myLibrary.push( new Book(title, author, pages, read) );
}

//dummy book objects need to have their prototype chain set:
myLibrary.forEach( dummyBook=> {
  Object.setPrototypeOf(dummyBook, Book.prototype);
  //obj.constructor = Book;// Optionally update constructor reference
});

//(re)build and display library on page after library array changes ..ouch
const updateBooksGrid = ()=> {
  booksGrid.textContent = ''; //clear books before adding
  myLibrary.forEach( (item,index)=> {
    //make html elements
    const bookElem = document.createElement('article');
    const h3 = document.createElement('h3');
    const h4 = document.createElement('h4');
    const pagesPara = document.createElement('p');
    const readLabel = document.createElement('label');
    const readInput = document.createElement('input');
    //wrapper for book removal icon. edit any associated parent child finding logic later
    const removeWrapper = document.createElement('div');
    const removeBookIcon = document.createElement('div');
    //add html elements data
    h3.textContent = item.title;
    h4.textContent = item.author;
    pagesPara.textContent = `Pages: ${item.pages}`;
    readLabel.textContent = 'Read: ';
    readInput.setAttribute('type','checkbox');
    readInput.checked = item.read ? true : false;
    bookElem.classList.add('book'); //styling class
    removeWrapper.classList.add('removeWrapper'); //styling class
    removeBookIcon.setAttribute('data-arr-i',`${index}`);
    //append to parents
    readLabel.append(readInput);
    removeWrapper.append(removeBookIcon);
    bookElem.append(h3, h4, pagesPara, readLabel, removeWrapper);
    booksGrid.append(bookElem);
  });
};
updateBooksGrid(); //first run to populate page

//event listeners
//open modal without bg interactivity, also makes ::backdrop pseudo-element
newBookBtn.addEventListener('click', e=> {
  e.stopPropagation();
  newBookModal.showModal();
});
//close and open modal from buttons within a form with method=dialog
closeModalBtn.addEventListener('click', e=> {
  e.stopPropagation();
  newBookModal.close();
});
submitBookBtn.addEventListener('click', e=> {
  e.stopPropagation();
  //check at least title and author inputs filled
  if ( titleInput.checkValidity() && authorInput.checkValidity() ) {
    //use data for new book with the odin required addBookToLibrary fn
    addBookToLibrary(titleInput.value, authorInput.value, pagesInput.value, readInput.checked);
    updateBooksGrid();
    newBookModal.close(); //also sends a close event, if needed
  }
});
//listener to catch bubbling clicks to remove book from library
booksGrid.addEventListener('click', e=> {
  e.stopPropagation();
  //if book removal div element is clicked
  if ( e.target.dataset.arrI ) {
    myLibrary.splice(e.target.dataset.arrI,1);
    updateBooksGrid();
  }
  //if the change read state CHECKBOX was clicked:
  //event bubbles to booksGrid,just match the checkbox input
  if (e.target.type === 'checkbox') {
    myLibrary[
      +e.target.parentElement.nextElementSibling.children['0'].dataset.arrI
    ].changeReadState(); //div with data-* attr is next element after
  }
});
