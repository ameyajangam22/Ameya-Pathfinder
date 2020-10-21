const algos = document.getElementById("algos");
const randomize=document.getElementById("randomize"); 
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var start_move = false;
var finish_move = false;
var clicking = false;
var stopfiddling=0;
ctx.fillStyle = "#FFFFFF";
var grid = new Array(36);
for(var i=0;i<36;i++)
  {
    grid[i]=[];
  }
const start_img = new Image();
start_img.onload = function () {
  ctx.drawImage(start_img, 0, 0, 24, 24);
};
start_img.src = "start.png";
const finish_img = new Image();
finish_img.onload = function () {
  ctx.drawImage(finish_img, 35 * 25, 19 * 25, 24, 24);
};
var prev_start_x = 0;
var prev_start_y = 0;
var prev_end_x = 35 * 25;
var prev_end_y = 19 * 25;
finish_img.src = "finish.jpg";

ctx.fillRect(0, 0, 900, 500);
var p = 0;
var bh = 500;
var bw = 900;
var grid = new Array(36);
ctx.fillStyle = "black";
document.getElementById("clearbtn").addEventListener("click", function () {
  window.location.reload();
});
function drawBoard() {
  for (var i = 0; i < 36; i++) {
    grid[i] = new Array(20);
  }
  for (var i = 0; i < 36; i++) {
    for (var j = 0; j < 20; j++) {
      ctx.strokeRect(i * 25, j * 25, 25, 25);
    }
  }
}
$(document).ready(function(){
drawBoard();
})
var xx, yy;
// click and drag mousedown function--------------------------------------------------------
canvas.addEventListener("mousedown", function () {
  if (click == 0) {
    return false;
  }
  clicking = true;
  find_location(event);
  console.log(xx + " " + yy);
  if (prev_start_x == xx && prev_start_y == yy) {
    start_move = true;
    console.log("You touched start");
  }
  if (prev_end_x == xx && prev_end_y == yy) {
    finish_move = true;
    console.log("You touched end");
  }
  var imgData = ctx.getImageData(xx + 1, yy + 1, 24, 24);
  var red = imgData.data[0];
  var green = imgData.data[1];
  var blue = imgData.data[2];
  console.log(red + " " + blue + " " + green);
  if (start_move == false) {
    if (finish_move == false) {
      if (red == 0 && green == 0 && blue == 0) {
        clearwalls(xx, yy);
      } else if (red == 255 && blue == 255 && green == 255) {
        ctx.fillStyle = "black";
        fillWalls(event);
      }
    }
  }
});

canvas.addEventListener("mousemove", function (event) {
  find_location(event);
  // console.log(xx + " " + yy);
  if (clicking == true && start_move == false && finish_move == false) {
    if (
      (prev_start_x != xx || prev_start_y != yy) &&
      (prev_end_x != xx || prev_end_y != yy)
    ) {
      console.log("sdsad");
      fillWalls(event);
    }
  } else if (start_move == true) {
    move_start(xx, yy);
  } else if (finish_move == true) {
    move_end(xx, yy);
  }
});
canvas.addEventListener("mouseup", function () {
  var point_x_in_doc = event.offsetX;
  var point_y_in_doc = event.offsetY;

  if (start_move == false) {
    if (prev_start_x != xx || prev_start_y != yy) {
      fillWalls(event);
      console.log("yems");
    }
  }
  if (finish_move == false) {
    if (prev_end_x != xx || prev_end_y != yy) {
      fillWalls(event);
      console.log("yems");
    }
  }
  clicking = false;
  if (start_move == true) {
    move_start(xx, yy);
    canvas.removeEventListener("mousemove", move_start);
  }
  if (finish_move == true) {
    move_end(xx, yy);
    canvas.removeEventListener("mousemove", move_end);
  }
  finish_move = false;
  start_move = false;
  canvas.removeEventListener("mousemove", fillWalls);
});
canvas.addEventListener("mouseout", function () {
  clicking = false;
  if (start_move == true) {
    start_move = false;
  }
  if (finish_move == true) {
    finish_move = false;
  }
  if (clicking == false) {
    canvas.removeEventListener("mousemove", fillWalls);
  }
});

function randomizer()
{
  for(var i=0;i<36;i++)
  {
    for(var j=0;j<20;j++)
    {
      if(i!=prev_start_x/25 || j!==prev_start_y/25)
      {
        if(i!=prev_end_x/25 || j!=prev_end_y/25)
        {
          if(Math.random()<0.3)
          {
              ctx.fillStyle = "black";
              ctx.strokeStyle="black";
              ctx.fillRect(i * 25, j * 25, 25, 25);
              ctx.strokeRect(i * 25, j * 25, 25, 25);
          }
        }
      }
    }
  }
}
// whenever I click randomize! button
randomize.addEventListener("click", function(){
  randomizer();
})
// data structures for BFS----------------------------------------------------

class queue {
  constructor() {
    this.items = [];
  }
  enqueue(element) {
    this.items.push(element);
  }
  isEmpty() {
    return this.items.length == 0;
  }
  pop(element) {
    if (this.isEmpty()) return Underflow;
    return this.items.shift();
  }
  front() {
    return this.items[0];
  }
}
var qx = new queue();
var qy = new queue();
var dis = new Array(36);
for (var i = 0; i < 36; i++) {
  dis[i] = [];
}
var vis = new Array(36);
for (var i = 0; i < 36; i++) {
  vis[i] = [0];
}
var pathx = [];
var pathy = [];
// --------------------------------
function isValid(nodex, nodey) {
  var checkx = nodex * 25;
  var checky = nodey * 25;
  var imgData = ctx.getImageData(checkx + 1, checky + 1, 24, 24);
  var red = imgData.data[0];
  var green = imgData.data[1];
  var blue = imgData.data[2];
  var alpha = imgData.data[3];
  // console.log(red + " " + blue + " " + green);
  if (
    nodex > 35 ||
    nodex < 0 ||
    nodey > 19 ||
    nodey < 0 ||
    vis[nodex][nodey] == 1 ||
    (red == 0 && green == 0 && blue == 0)
  ) {
    return false;
  }
  return true;
}
var dx = [1, 0, -1, 0];
var delay = 50;
var click = 1;
var dy = [0, 1, 0, -1];
function doBfs(srcx, srcy) {
  console.log("lol");
  click = 0;
  srcx = srcx / 25;
  srcy = srcy / 25;
  // console.log(qx.isEmpty());
  qx.enqueue(srcx);
  qy.enqueue(srcy);
  vis[srcx][srcy] = 1;
  dis[srcx][srcy] = 0;
  // console.log(currx);
  // console.log(curry);
  // console.log(qx.isEmpty());

  var newX;
  var newY;
  var currx;
  var curry;
  while (qx.isEmpty() != true) {
    currx = qx.front();
    curry = qy.front();
    qx.pop();
    qy.pop();

    for (var j = 0; j < 4; j++) {
      if (isValid(currx + dx[j], curry + dy[j]) == true) {
        newx = currx + dx[j];
        newy = curry + dy[j];
        dis[newx][newy] = dis[currx][curry] + 1;
        vis[newx][newy] = 1;
        if (vis[prev_end_x / 25][prev_end_y / 25] == 1) {
          return;
        }
        anim(newx, newy);
        qx.enqueue(newx);
        qy.enqueue(newy);
        console.log(newx + " " + newy);
      }
    }
  }
}
var x=0;
function doDfs(srcx, srcy)
{
  click=0; //prevents clicking when the pathfinder algorithm is initiated
  vis[srcx][srcy]=1;
  if(srcx*25!=prev_start_x || srcy*25!=prev_start_y)
  anim(srcx, srcy);
  
  if (vis[prev_end_x / 25][prev_end_y / 25] == 1) {
    x=1;
    
  }
  if(x==1)
  return;
  if(isValid(srcx+1,srcy)==true)
  {
    doDfs(srcx+1,srcy);
  }
  if(x==1)
  return;
  if(isValid(srcx,srcy+1)==true)
  {
    doDfs(srcx,srcy+1);
  }
  if(x==1)
  return;
  if(isValid(srcx,srcy-1)==true)
  {
    doDfs(srcx,srcy-1);
  }
  if(x==1)
  return;
  if(isValid(srcx-1,srcy)==true)
  {
      doDfs(srcx-1,srcy);
  }
  if(x==1)
  return;
}

var openset=[];
var closeset=[];
function cell(i,j)
{
  this.i=i;
  this.j=j;
  this.f=0;
  this.g=0;
  this.h=0;
  this.neighbours=[];
  this.previous=0;

  this.addNeighbours=function(){
  if(isValid(i+1,j)==true)
  {
    this.neighbours.push(grid[i+1][j]);
  }
  if(isValid(i,j+1)==true)
  {
   this.neighbours.push(grid[i][j+1]); 
  }
  if(isValid(i-1,j)==true)
  {
    this.neighbours.push(grid[i-1][j]);
  }
  if(isValid(i,j-1)==true)
  {
    this.neighbours.push(grid[i][j-1]);
  }
}
}
function removeCurrentfromArray(openset,current)
{
  for(var i=0;i<openset.length;i++)
  {
    if(openset[i]===current)
    {
      openset.splice(i,1);
      break;
    }
  }
}

function doAstar(srcx,srcy)
{
  click=0;
  
  for(var i=0;i<36;i++)
  {
    for(var j=0;j<20;j++)
    {
      grid[i][j]=new cell(i,j);
    }
  }
  openset.push(grid[srcx][srcy]);
  while(true)
  {
      //find minimum fcost
      if(openset.length>0)
      {
        var lowestcost=0;
        for(var i=0;i<openset.length;i++)
        {
          if(openset[i].f<openset[lowestcost].f)
          {
            lowestcost=i;
          }
        }
     
      var current=openset[lowestcost];
      // make a current node for iteration (I ALSO NEED TO REMOVE THIS CURRENT LATER FROM THE ARRAY)
      
      if(current.i!==srcx || current.j!=srcy)
      anim(current.i,current.j);
         //check if we reached our goal cell
       if(current==grid[prev_end_x/25][prev_end_y/25])
      {
        console.log("done");
        vis[prev_end_x/25][prev_end_y/25]=1;
        //print path(left)
        var pathforAstar=[];
        var backtrack_node= current;
        while(backtrack_node.previous)
        {
          
          if(backtrack_node.previous.i!=srcx || backtrack_node.previous.j!=srcy)
          {
            console.log(backtrack_node.previous.i+","+backtrack_node.previous.j);
            pathforAstar.push(backtrack_node.previous);
          }
          
          
          backtrack_node=backtrack_node.previous;
          
          console.log("assas");  
          delay+=20; 
        }
          for(var k=pathforAstar.length-1;k>=0;--k)
          {
           fillpath(pathforAstar[k].i,pathforAstar[k].j);
          }
          change_the_end_flag_to_success_flag();
        return;
      }
      // removing current from the array
      removeCurrentfromArray(openset,current);
      // add to closed list
      closeset.push(current);
      // add neighbours
      current.addNeighbours();  
      //explore neighbours of current
      var neighbours=current.neighbours;
      // console.log(neighbours);
      for(var i=0;i<neighbours.length;i++)
      {
        // if not closed else search for next neighbour
        if(!closeset.includes(neighbours[i]))
        {
          var tempoG= current.g+1;
          // check if already in open, look for better path
          if(openset.includes(neighbours[i]))
          {
            if(tempoG<neighbours[i].g)
            { 
              neighbours[i].g=tempoG; 
              console.log("Idhar kia");
         
            }
          }
          else
          {
            // check if not in open, if not add then
            neighbours[i].g=tempoG;
            openset.push(neighbours[i]);
          }
          // set heuristic
          neighbours[i].h= Math.abs(prev_end_x/25-neighbours[i].i)+Math.abs(prev_end_y/25-neighbours[i].j);
          
          //setting f cost
          neighbours[i].f= neighbours[i].g+neighbours[i].h;
              //setting parent (later required for path)
            neighbours[i].previous=current;
        }
      }
      }
      else
      {
        break;
      }
      
  }
}
document.addEventListener("mouseup",function(){
  console.log("prev_start_x= "+prev_start_x+"prev_start_y= "+prev_start_y);
});

document.getElementById("findbtn").addEventListener("click", function () {
  disablebtns();
  var imgData = ctx.getImageData(1, 1, 24, 24);
  var r = imgData.data[0];
  var g = imgData.data[1];
  var b = imgData.data[2];
  var alpha = imgData.data[3];
  ctx.lineWidth = 1;
  if (r + g + b != 0 && algos.value=="BFS") {
    doBfs(prev_start_x, prev_start_y);
  }
  else if(r + g + b != 0 && algos.value=="DFS")
  {
    doDfs(prev_start_x/25, prev_start_y/25);
    change_the_end_flag_to_success_flag();
  }
  else if(r + g + b != 0 && algos.value=="A-star")
  {
    doAstar(prev_start_x/25, prev_start_y/25);
  }
  setTimeout(() => {
    if (vis[prev_end_x / 25][prev_end_y / 25] != 1 || r + g + b == 0) {
      alert("No sol");
      enablebtns();
    } else {
      if(algos.value=='BFS')
      printPath(dis);
    }
  }, delay);

});

function printPath() {
  var distance = dis[prev_end_x / 25][prev_end_y / 25];
  console.log("Distance " + dis[35][prev_end_y / 25]);
  var px = prev_end_x / 25;
  var py = prev_end_y / 25;
  ctx.fillStyle = "green";
  while (distance > 0) {
    if (
      px - 1 < 36 &&
      py < 20 &&
      px - 1 >= 0 &&
      py >= 0 &&
      dis[px - 1][py] == distance
    ) {
      // path[x - 1][y] = '*';
      pathx.push(px - 1);
      pathy.push(py);
      px = px - 1;
    } else if (
      px + 1 < 36 &&
      py < 20 &&
      px + 1 >= 0 &&
      py >= 0 &&
      dis[px + 1][py] == distance
    ) {
      // path[x + 1][y] = "*";
      pathx.push(px + 1);
      pathy.push(py);
      px = px + 1;
    } else if (
      px < 36 &&
      py - 1 < 20 &&
      px >= 0 &&
      py - 1 >= 0 &&
      dis[px][py - 1] == distance
    ) {
      // path[x][y - 1] = "*";
      pathx.push(px);
      pathy.push(py - 1);
      py = py - 1;
    } else if (
      px < 36 &&
      py + 1 < 20 &&
      px >= 0 &&
      py + 1 >= 0 &&
      dis[px][py + 1] == distance
    ) {
      // path[x][y + 1] = "*";
      pathx.push(px);
      pathy.push(py + 1);
      py = py + 1;
    }

    distance = distance - 1;
  }
  for (var i = pathx.length - 1; i >= 0; i--) {
    fillpath(pathx[i], pathy[i]);
  }

  change_the_end_flag_to_success_flag();
}
function change_the_end_flag_to_success_flag()
{
    setTimeout(() => {
    enablebtns();
    const success_img = new Image(); // makes the flag to success flag
      success_img.onload = function () {
      ctx.drawImage(success_img, prev_end_x,prev_end_y, 24, 24);
    };
    success_img.src="successflag.png";
  }, delay);
}
function fillpath(pathx, pathy) {
  console.log("pathy");
  setTimeout(() => {
    ctx.fillStyle = "green";
    ctx.strokeStyle = "black";
    ctx.fillRect(pathx * 25, pathy * 25, 25, 25);
    ctx.strokeRect(pathx * 25, pathy * 25, 25, 25);
  }, delay);
  delay += 50;
}
function anim(newx, newy) {
  setTimeout(() => {
    var vibex = newx * 25;
    var vibey = newy * 25;

    // ctx.fillStyle = "#f0a500";
    // ctx.strokeStyle = "black";

    if (vibex != prev_end_x || vibey != prev_end_y) {
      ctx.fillStyle = "Indigo";
      ctx.strokeStyle = "black";
      ctx.fillRect(vibex, vibey, 25, 25);
      ctx.strokeRect(vibex, vibey, 25, 25);
      setTimeout(() => {
        ctx.fillStyle = "#f0a500";
        ctx.strokeStyle = "black";
        ctx.fillRect(vibex, vibey, 25, 25);
        ctx.strokeRect(vibex, vibey, 25, 25);
      }, 50);
    }
  }, delay);
  if(algos.value=="BFS")
  delay = delay + 2; // increasing delay for each tile------------------------
  else if(algos.value=="DFS")
  delay+=15;
  else if(algos.value=="A-star")
  {
    delay+=3;
  }
}

// fills walls ---------------------------------------------------------------------------
function fillWalls(event) {
  if (click == 0) {
    return false;
  }
  find_location(event);
  var imgData = ctx.getImageData(xx + 1, yy + 1, 24, 24);
  var red = imgData.data[0];
  var green = imgData.data[1];
  var blue = imgData.data[2];
  var alpha = imgData.data[3];

  ctx.fillRect(xx, yy, 25, 25);
  ctx.strokeRect(xx, yy, 25, 25);
}
function clearwalls(xx, yy) {
  if (click == 0) {
    return false;
  }
  console.log("culprit");
  ctx.fillStyle = "white";
  ctx.fillRect(xx, yy, 25, 25);
  ctx.strokeRect(xx, yy, 25, 25);
}
function find_location(event) {
  var x = event.offsetX;
  var y = event.offsetY;
  xx = x - (x % 25);
  if (xx < 25) xx = 0;
  yy = y - (y % 25);
  if (yy < 25) yy = 0;
}
function move_start(xx, yy) { //moving start icon
  if (xx <= 875 && yy <= 475 && xx >= 0 && yy >= 0) {
    ctx.fillStyle = "white";
    ctx.fillRect(prev_start_x, prev_start_y, 25, 25);
    ctx.strokeRect(prev_start_x, prev_start_y, 25, 25);
    ctx.drawImage(start_img, xx, yy, 25, 25);
    prev_start_y = yy;
    prev_start_x = xx;
  } else {
    return false;
  }
}
function move_end(xx, yy) { //moving end icon
  if (xx <= 875 && yy <= 475 && xx >= 0 && yy >= 0) {
    ctx.fillStyle = "white";
    ctx.fillRect(prev_end_x, prev_end_y, 25, 25);
    ctx.strokeRect(prev_end_x, prev_end_y, 25, 25);
    ctx.drawImage(finish_img, xx, yy, 25, 25);
    prev_end_y = yy;
    prev_end_x = xx;
  } else {
    return false;
  }
}
function disablebtns()
{
   document.getElementById("clearbtn").disabled=true; //disabling clearing
   document.getElementById("clearbtn").classList.add("disab");
  document.getElementById("findbtn").disabled=true;
   document.getElementById("findbtn").classList.add("disab");
  document.getElementById("randomize").disabled=true;
   document.getElementById("randomize").classList.add("disab");
}
function enablebtns()
{
   document.getElementById("clearbtn").disabled=false; //disabling clearing
   document.getElementById("clearbtn").classList.remove("disab");
   document.getElementById("findbtn").disabled=false;
   document.getElementById("findbtn").classList.remove("disab");
   document.getElementById("randomize").disabled=false;
   document.getElementById("randomize").classList.remove("disab");
}