import { Delaunay } from "d3-delaunay";
import { createContext } from "vm";
var seedrandom = require("seedrandom");

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var cWidth = canvas.width;
var cHeight = canvas.height;
var cPoints = 5;
var centerPoint;
var points, del, vor;
var nonInfin = [];
var nPoly = [];
var plots = [];

var sRnd = seedrandom("ca"); //Random Num for sites

function genVoronoi() {
  //beginPath, moveTo, lineTo, stroke
  del = Delaunay.from(points);
  vor = del.voronoi([0, 0, cWidth, cHeight]);
  findInfinite();
  findOffset(-0.2);
  draw();
  if (nPoly.length != 0) {
    fitBox(nPoly);
  }
}

function findOffset(offs) {
  for (var i = 0; i < nonInfin.length; i++) {
    //For each non-infinite cell
    var oPoly = vor.cellPolygon(nonInfin[i]);
    //console.log(vor.cellPolygon(nonInfin[i]));
    centerPoint = [points[nonInfin[i]][0], points[nonInfin[i]][1]];
    nPoly = [];
    for (var j = 0; j < oPoly.length; j++) {
      //x/y 1 always center point x/y2 outside point;
      var x1 = centerPoint[0];
      var y1 = centerPoint[1];
      var x2 = oPoly[j][0];
      var y2 = oPoly[j][1];

      var xMod = (x2 - x1) * offs;
      var yMod = (y2 - y1) * offs;

      nPoly[j] = [xMod + x2, yMod + y2];
    }
  }
}

//Guided by: https://martindevans.me/game-development/2015/12/27/Procedural-Generation-For-Dummies-Lots/
function OBBSubdivide(poly) {
  // 1. Fit an Object Aligned Bounding Box around the space
  var obb = fitBox(poly);

  // 2. Slice the space along the shorter axis of the OBB
  //let parts = slice( obb.shorterAxis, space );

  // 3. Check validity of all children, terminate if any are not valid
  // This is the base case
  //if ( parts.Any( IsNotValid ) )
  //  return space;

  // 4. Recursively apply this algorithm to all parts
  //for (part in parts)
  //  return obb_subdivide( part );
}

function fitBox(plot) {
  //For each side:
  ctx.strokeStyle = "red";
  console.log(plot);
  let minArea = 0;
  let top, projBase, base1, base2;
  for (let i = 0; i < 5; i++) {
    //console.log("side# " + i)
    let p1, p2;
    p1 = plot[i];
    if (i === plot.length - 1) {
      p2 = plot[0];
    } else {
      p2 = plot[i + 1];
    }

    //Project the points
    var projPoints = [];
    let heighest,
      base,
      projXs = 0,
      projYs = 0;

    var height = 0;
    for (let z = 0; z < plot.length; z++) {
      var point = projectPointToLine(plot[z], p1, p2, false);
      let dist = Math.hypot(plot[z][0] - point[0], plot[z][1] - point[1]);
      projXs += point[0];
      projYs += point[1];
      projPoints.push(point);
      if (dist > height) {
        heighest = plot[z];
        base = point;
        height = dist;
      }
    }
    //drawPoint(heighest, "red");
    //drawLine(heighest, base, "cyan", 5);

    projXs = projXs / plot.length;
    projYs = projYs / plot.length;

    let centroid = [projXs, projYs];

    //Find the furthest 2 points from the center
    var left = centroid;
    var right = centroid;
    var furthL = 0;
    var furthR = 0;
    var secondFurth = 0;

    //Check the distance of each projected point against the others.
    //Record the longest distance
    for (let q = 0; q < projPoints.length - 1; q++) {
      var xS = projPoints[q][0] - centroid[0];
      var yS = projPoints[q][1] - centroid[1];
      var dist = Math.hypot(xS, yS);

      if (dist > furthL && projPoints[q][0] < left[0]) {
        left = projPoints[q];
        furthL = dist;
      } else if (dist > furthR && projPoints[q][0] > right[0]) {
        right = projPoints[q];
        furthR = dist;
      }
    }
    //console.log(longestSide);
    //drawPoint(left, "yellow");
    //drawPoint(right, "green");
    //drawLine(left, right, "green", 2);

    var width = furthL + furthR;

    var area = height * width;
    if (minArea === 0) {
      top = heighest;
      projBase = base;
      base1 = left;
      base2 = right;
      minArea = area;
    } else if (area < minArea) {
      top = heighest;
      projBase = base;
      base1 = left;
      base2 = right;
      minArea = area;
    }
  }

  let dist1 = varDists(base1, projBase);

  let dist2 = varDists(base2, projBase);

  let newCorner1 = [top[0] + dist2[0], top[1] + dist2[1]];
  drawPoint(newCorner1, "red");

  let newCorner2 = [top[0] + dist1[0], top[1] + dist1[1]];
  drawPoint(newCorner2, "red");

  drawPoint(base1, "red");
  drawPoint(base2, "red");

  let finalOb = [base1, base2, newCorner1, newCorner2, base1];
  drawShape(finalOb);

  return finalOb;
}

function varDists(p1, p2) {
  var xDif = p1[0] - p2[0];
  var yDif = p1[1] - p2[1];
  return [xDif, yDif];
}

function drawShape(pntArr, color) {
  ctx.fillStyle = "rgba(225,225,225,0.5)";
  ctx.beginPath();
  ctx.moveTo(pntArr[0][0], pntArr[0][1]);
  for (let z = 0; z < pntArr.length; z++) {
    ctx.lineTo(pntArr[z][0], pntArr[z][1]);
  }
  ctx.fill();
}

function drawPoint(point, color) {
  ctx.fillStyle = color;
  ctx.fillRect(point[0] - 5, point[1] - 5, 10, 10);
}

function drawLine(point1, point2, color, weight) {
  ctx.lineWidth = weight;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(point1[0], point1[1]);
  ctx.lineTo(point2[0], point2[1]);
  ctx.stroke();
}

//https://math.stackexchange.com/questions/62633/orthogonal-projection-of-a-point-onto-a-line/62638
function projectPointToLine(p, v1, v2, draw) {
  let slope = (v2[1] - v1[1]) / (v2[0] - v1[0]);
  let b = v1[1] - slope * v1[0];
  var perpSlope = -(v2[0] - v1[0]) / (v2[1] - v1[1]);
  let pb = p[1] - perpSlope * p[0];

  var projX = (pb - b) / (slope - perpSlope);
  var projY = slope * projX + b;

  var pp = [projX, projY];
  if (draw) {
    drawPoint(pp, "yellow");
  }
  return pp;
}

function dotProduct(e1, e2) {
  return e1[0] * e2[1] - e1[1] * e2[0];
}

function findInfinite() {
  for (var i = 0; i < vor.vectors.length; i += 4) {
    if (vor.vectors[i] !== 0) {
      ctx.beginPath();
      ctx.fillStyle = "rgba(225," + 10 * i + ",225,0.5)";
      vor.renderCell(i / 4, ctx);
      ctx.fill();
    } else {
      nonInfin.push(i / 4);
    }
  }
}

function genPoints(callback) {
  points = [];
  var radius = function() {
    if (cWidth > cHeight) {
      return (cHeight - 100) / 2;
    } else {
      return (cWidth - 100) / 2;
    }
  };

  var centerP = [cWidth / 2, cHeight / 2];
  points.push(centerP);
  for (var i = 0; i < cPoints; i++) {
    var angle = sRnd.quick() * Math.PI * 2;
    var x = Math.cos(angle) * radius() + cWidth / 2;
    var y = Math.sin(angle) * radius() + cHeight / 2;
    points.push([x, y]);
  }
  callback();
}

function init() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  genPoints(genVoronoi);
}

function draw() {
  //ctx.globalCompositeOperation = "destination-over";
  //ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas

  ctx.beginPath();
  vor.render(ctx);
  ctx.strokeStyle = "black";
  ctx.stroke();

  for (var i = 0; i < points.length; i++) {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(points[i][0], points[i][1], 6, 0, 2 * Math.PI, false);
    ctx.fill();
  }

  if (nPoly.length > 2) {
    ctx.beginPath();
    ctx.moveTo(nPoly[0][0], nPoly[0][1]);
    for (var k = 1; k < nPoly.length; k++) {
      ctx.lineTo(nPoly[k][0], nPoly[k][1]);
    }
    ctx.stroke();
  }
  //window.requestAnimationFrame(draw);
}

window.onresize = function(event) {
  init();
};
init();
