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
var plots = [];

var sRnd = seedrandom("cat"); //Random Num for sites

function genVoronoi() {
  del = Delaunay.from(points);
  vor = del.voronoi([0, 0, canvas.width, canvas.height]);
  mapGen.findInfinite(vor, nonInfin);
  let cell = vor.cellPolygon(nonInfin[0]);
  if (cell.length > 2) {
    plots.push(mapGen.plotify(cell, points, nonInfin, ctx));
  }
  draw();
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

  //window.requestAnimationFrame(draw);
}

init();
