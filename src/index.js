import { Delaunay } from "d3-delaunay";
import * as mapGen from "./mapGen.js";
var seedrandom = require("seedrandom");

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
mapGen.setContext(ctx);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var cPoints = 5;
var points, del, vor;
var nonInfin = [];
var plots, plotDel;
var cellSites = [];
var mouseX, mouseY;

var sRnd = seedrandom("ca"); //Random Num for sites

function genVoronoi() {
  del = Delaunay.from(points);
  vor = del.voronoi([0, 0, canvas.width, canvas.height]);
  mapGen.findInfinite(vor, nonInfin);
  let cell = vor.cellPolygon(nonInfin[0]);
  if (cell.length > 2) {
    plots = mapGen.plotify(cell, points, nonInfin, ctx);
    plots.forEach(function(cell) {
      cellSites.push(mapGen.centroidOf(cell));
    });
    plotDel = Delaunay.from(cellSites);
    plotDel.render(ctx);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  //console.log(cellSites.length);
  draw();
}

canvas.addEventListener(
  "mousemove",
  function(evt) {
    var mousePos = getMousePos(canvas, evt);
    mouseX = mousePos.x;
    mouseY = mousePos.y;
    var it = findFromPoint(mouseX, mouseY, false);
  },
  false
);

function findFromPoint(x, y) {
  //console.log(plotDel.find(x,y));
  mapGen.fillShape(plots[plotDel.find(x, y)], "0,255,0,1");
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function init() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  points = mapGen.genPoints(cPoints, sRnd, canvas, genVoronoi);
  genVoronoi();
}

function draw() {
  //ctx.globalCompositeOperation = "destination-over";
  //ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas
  ctx.beginPath();
  vor.render(ctx);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.stroke();

  mapGen.drawPlots(plots);
  //window.requestAnimationFrame(draw);
}

init();
