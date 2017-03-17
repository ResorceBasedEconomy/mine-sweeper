'use strict'
console.log('Mine Sweeper');

var gLevel = { SIZE: 4, MINES: 2 };
var gState = { shownCount: 0, markedCount: 0 }
var gBoard = [];
var gTimer = 0;
var gTimeCount = 0;

// Main function 
function initGame() {
    // Initiate some global variables for restarting the game
    gState.markedCount = 0;
    gState.shownCount = 0;
    clearInterval(gTimer);
    gBoard = [];  
    gTimer = 0;
    gTimeCount = 0;
    document.querySelector('.winner').style.display = 'none';
    // Time count display to HTML
    var timeDisp = document.querySelector('#seconds');
    timeDisp.innerText = gTimeCount;
    // Mines count display to HTML
    var mineDisp = document.querySelector('#minecount');
    mineDisp.innerText = gLevel.MINES - gState.markedCount;
    buildBoard();
    renderBoard();
}
// This function creates a board and sets object in each cell
function buildBoard() {
    while(mines !== 0) {
    var mines = gLevel.MINES;
        for (var i =0; i < gLevel.SIZE; i++) {
            gBoard[i] = [];
            for (var j =0; j< gLevel.SIZE; j++) {
                // set mines on board in random probability of 10%
                gBoard[i][j] = {negs: 0, isFlaged: false, isClicked: false, isMine: true};    

                (Math.random() < 0.1) ? mines-- : gBoard[i][j].isMine = false;
            }
        }   
    }
    // update negs for each cell
    for (var i =0; i< gLevel.SIZE; i++) {
        for (var j =0; j< gLevel.SIZE; j++) {
            gBoard[i][j].negs = setMinesNegsCount(gBoard, i, j);
        }
    }
}

// this function checks each cell and returns neigbours in array 
function setMinesNegsCount(board, cellI, cellJ) {
    var negsCount = 0;
    for (var i = cellI-1; i <= cellI+1; i++) {
        for (var j =cellJ-1; j <= cellJ+1; j++) {
            if ( i === cellI && j === cellJ ) continue;
            if ( i < 0 || i > board.length-1) continue;
            if ( j < 0 || j > board[0].length-1) continue;
            if (board[i][j].isMine) negsCount++; 
        }
    }
    return negsCount;
}

// This function prints the board as a table to the user
function renderBoard() {
    var strHtml = '';
    gBoard.forEach(function(cells, i){
        strHtml += '<tr>';
        cells.forEach(function(cell, j){
            var cell =''; 
            var className = 'cell cell'+ i +''+j;
            var tdId = 'cell-' + i + '-' +j;
            strHtml += '<td id="'+ tdId +'" oncontextmenu="rightClicked(event, this, '+
                         i +', '+ j+')" onclick="leftClicked(this, '+ i +', '+ j+')"' +
                         'class="'+ className +'">' + cell +  '</td>';
        }); 
        strHtml += '</tr>';
    });
    var elMat = document.querySelector('tbody');
    elMat.innerHTML = strHtml;
}
function getUsers() {
    var res = null;
    var str = localStorage.getItem('user');
    res = JSON.parse(str)
    return res;
}
function renderScoresTable() {

    var users = getUsers();
    var elTable = document.querySelector(".tbody");
    var strHtml = '';
    users.forEach(function(obj) {
            strHtml += '<tr>';          
        for (var key in obj) {
            strHtml += '<td> '+ obj[key] +' </td>';
        }   
            strHtml += '</tr>';
            elTable.innerHTML = strHtml;
    });

}
// this function is called on a right click
function rightClicked(event, elCell, i, j) {
    event.preventDefault();
    var audio = new Audio('click.mp3');
    audio.play();

    var cell = document.querySelector('#cell-' + i + '-' +j);
    cellMarked(cell, i, j);
}

// this function is called on a right click
function leftClicked(elCell, i, j) {
    var audio = new Audio('click.mp3');
    audio.play();

     if(gBoard[i][j].isMine) {
        gameOver(i, j);
        return;
    } else if (gBoard[i][j].negs === 0) {
        expandShown(elCell, i, j);
    }
    // start timer when first left clicked
    if(gTimer === 0) {
        gTimeCount = 0;
        gTimer = setInterval(function() {
        gTimeCount++;
        var div = document.querySelector('#seconds');
        div.innerText = gTimeCount;
        },1000);
    }
    var cell = document.querySelector('#cell-' + i + '-' +j);
    showCells(cell, i, j)
}
// This function updates class of "flaged" and 
// updates flag counter on the display
function cellMarked(elCell, i, j) {
    if(gBoard[i][j].isReveal) return;
    var cell = document.querySelector('#cell-' + i + '-' +j);
    var dispCount = document.querySelector("#minecount");
    if(gState.markedCount === gLevel.MINES && !cell.classList.contains('flaged')) return;
    if(!cell.classList.contains('flaged') && !cell.innerHTML){
         cell.classList.add('flaged');
         gState.markedCount++;
         gBoard[i][j].isFlaged = true;    
    } else {
        cell.classList.remove('flaged');
        gState.markedCount--;
        gBoard[i][j].isFlaged = false;
    }
    dispCount.innerHTML = gLevel.MINES-gState.markedCount; 
    checkVictory();
}
// This func sets the end of game looks by revealing
// the positions of mines and wrong guesses
function gameOver(cellI, cellJ) {
    clearInterval(gTimer);var
    audio = new Audio('css/boomsound.mp3');
    audio.play();

    gTimeCount = 0;
    var bCell = document.querySelector('#cell-' + cellI + '-' +cellJ);
    bCell.classList.add('boom');
    for(var i = 0 ; i < gBoard.length ; i++) {
        for(var j = 0 ; j < gBoard[0].length ; j++) {
            var cell = document.querySelector('#cell-' + i + '-' +j);
            if (gBoard[i][j].isMine &&  !cell.classList.contains('flaged')) {
                cell.classList.remove('cell');
                cell.classList.add('mine');
            } else if (gBoard[i][j].isFlaged && !gBoard[i][j].isMine) {
                cell.classList.remove('flaged');
                cell.classList.add('wrongGuess'); 
            }
            cell.outerHTML = '<td class="'+ cell.className +'">'+cell.innerText+'</td>';
        }
    }
    document.querySelector('.level').style.display = 'block';
}
// This function checks if the game is over by winning
function checkVictory() {
    var sumCounts = gState.markedCount + gState.shownCount;
    if(sumCounts === Math.pow(gLevel.SIZE, 2) ) {
        document.querySelector('.winner').style.display = 'block';
        clearInterval(gTimer);  
        gTimeCount = 0;
    document.querySelector('.level').style.display = 'block';
    var audio = new Audio('winsound.mp3');
    audio.play();
    } 
}

function showCells(elCell, i, j) {
    // return in case that the cell is already revealed or flaged
    if(gBoard[i][j].isReveal || gBoard[i][j].isFlaged) return;
    
    var cell = document.querySelector('#cell-' + i + '-' +j);

    var num = gBoard[i][j].negs;
    if (num !== 0) cell.innerHTML = num; 
    cell.classList.add('revealed');
    gState.shownCount++;
    gBoard[i][j].isReveal = true;

    checkVictory();
}

// This function reveals the second level if there is no mine in cells
function expandLevelTwo(elCell, cellI , cellJ) {
    for (var i = cellI-1; i <= cellI+1; i++) {
        for (var j =cellJ-1; j <= cellJ+1; j++) {
            if ( i === cellI && j === cellJ ) continue;
            if ( i < 0 || i > gBoard.length-1) continue;
            if ( j < 0 || j > gBoard[0].length-1) continue;
            if (!gBoard[i][j].isMine) showCells(elCell, i, j); 
        }
    }
}
function expandShown(elCell, cellI , cellJ) {

    for (var i = cellI-1; i <= cellI+1; i++) {
        for (var j =cellJ-1; j <= cellJ+1; j++) {
            if ( i === cellI && j === cellJ ) continue;
            if ( i < 0 || gBoard.length-1 < i) continue;
            if ( j < 0 || gBoard[0].length-1 < j) continue;
            if(!gBoard[i][j].isMine) {

                expandLevelTwo(gBoard[i][j], i, j);
            };
        }
    }
}

//  This function intiates the size of the board //
//  and amount of mines acourding to users choice. //
function updateMines(num) {
    switch (num) {
        case 1:
            gLevel.MINES = 2;
            gLevel.SIZE = 4;
            document.querySelector('.level').style.display = 'none';
            initGame();
        break;

        case 2:
         gLevel.MINES = 6;
         gLevel.SIZE = 7;
         document.querySelector('.level').style.display = 'none';
         initGame();
        break;

        case 3:
         gLevel.MINES = 10;
         gLevel.SIZE = 10;
         document.querySelector('.level').style.display = 'none';
         initGame();
        break;
    }
}