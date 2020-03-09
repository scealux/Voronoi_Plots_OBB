let ctx;

export function setContext(context) {
  ctx = context;
}

export function offsetCell(cell, offs, center) {
  let oCell = [];
  for (var j = 0; j < cell.length; j++) {
    //x/y 1 always center point x/y2 outside point;
    var x1 = center[0];
    var y1 = center[1];
    var x2 = cell[j][0];
    var y2 = cell[j][1];

    var xMod = (x2 - x1) * offs;
    var yMod = (y2 - y1) * offs;

    oCell[j] = [xMod + x2, yMod + y2];
  }
  return oCell;
}

export function plotOffset(pntArr, offs) {
  let cent = centroidOf(pntArr);
  let offPoly = [];
  for (let i = 0; i < pntArr.length; i++) {
    //x/y 1 always center point x/y2 outside point;

    var x1 = cent[0];
    var y1 = cent[1];
    var x2 = pntArr[i][0];
    var y2 = pntArr[i][1];
    let dist = Math.hypot(x1 - x2, y1 - y2);

    var xMod = ((x2 - x1) * offs) / dist;
    var yMod = ((y2 - y1) * offs) / dist;

    offPoly[i] = [xMod + x2, yMod + y2];
  }
  return offPoly;
}

export function plotify(cell, points, nonInfin, ctx) {
  let parts = [];
  let plots = [];
  let center = [points[nonInfin[0]][0], points[nonInfin[0]][1]];
  let oCell = offsetCell(cell, -0.02, center);

  if (oCell.length !== 0) {
    OBBSubdivide(oCell, parts);
  }
  //console.log(parts);

  for (let i = 0; i < parts.length; i++) {
    let offs = plotOffset(parts[i], -3);
    plots.push(offs);
    fillShape(offs, i * 7 + ",0,0.25");
  }
  return plots;
}

//Guided by: https://martindevans.me/game-development/2015/12/27/Procedural-Generation-For-Dummies-Lots/
export function OBBSubdivide(poly, arr) {
  // 1. Fit an Object Aligned Bounding Box around the space
  let obb = fitBox(poly);

  //fillShape(obb[0], "100,100,100,0.1");
  // 2. Slice the space along the shorter axis of the OBB
  //let parts = slice( obb.shorterAxis, space );
  let parts = slicePoly(poly, obb[1]); //Returns 2 polygons

  // 3. Check validity of all children, terminate if any are not valid
  // This is the base case
  //if ( parts.Any( IsNotValid ) )
  //  return space;
  if (areaOf(parts[0]) < 700 || areaOf(parts[1]) < 700) {
    arr.push(poly);
    return poly;
  }

  // 4. Recursively apply this algorithm to all parts
  //for (part in parts)
  //  return obb_subdivide( part );
  OBBSubdivide(parts[0], arr);
  OBBSubdivide(parts[1], arr);
}

//Guided by: https://www.mathopenref.com/coordpolygonarea.html
export function areaOf(piece) {
  let dividend = 0;
  for (let i = 0; i < piece.length - 1; i++) {
    let p1 = piece[i];
    let p2 = piece[i + 1];
    dividend += p1[0] * p2[1] - p1[1] * p2[0];
  }
  //(xn*y1)-(yn*x1)
  dividend +=
    piece[piece.length - 1][0] * piece[0][1] -
    piece[piece.length - 1][1] * piece[0][0];

  return dividend / 2;
}

export function slicePoly(poly, line) {
  var whole = [...poly];

  for (let i = 0; i < whole.length; i++) {
    //For each side
    let p1 = whole[i];
    let p2;
    if (i === whole.length - 1) {
      p2 = whole[0];
    } else {
      p2 = whole[i + 1];
    }
    let interPoint = lineIntersect([p1, p2], line);
    if (interPoint) {
      //If there is an intersection
      //splice in the points
      whole.splice(i + 1, 0, interPoint, interPoint);
      i += 2;
    }
  }
  whole.pop(); //remove repeated point at the end
  return polyArraySplitter(whole);
}

export function polyArraySplitter(polyArray) {
  //Loop through points, find where points are duplicated and split there
  let left = [],
    right = [];
  let addingToLeft = true;
  //fillShape(polyArray, "0,0,0");
  for (let i = 0; i < polyArray.length; i++) {
    if (polyArray[i] === polyArray[i + 1]) {
      if (addingToLeft) {
        addingToLeft = false;
        left.push(polyArray[i]);
        i++;
      } else {
        addingToLeft = true;
        right.push(polyArray[i]);
        i++;
      }
    }
    if (addingToLeft) {
      left.push(polyArray[i]);
    } else {
      right.push(polyArray[i]);
    }
  }
  left.push(left[0]);
  right.push(right[0]);

  return [left, right];
}

export function lineIntersect(pLine, cLine) {
  //Slopes
  let m1 = (pLine[1][1] - pLine[0][1]) / (pLine[1][0] - pLine[0][0]);
  let m2 = (cLine[1][1] - cLine[0][1]) / (cLine[1][0] - cLine[0][0]);
  //
  let b1 = pLine[0][1] - m1 * pLine[0][0];
  let b2 = cLine[0][1] - m2 * cLine[0][0];

  let intX = (b2 - b1) / (m1 - m2);
  let intY = m1 * intX + b1;

  if (isPointOnLineSeg([intX, intY], pLine)) {
    return [intX, intY];
  } else {
    return false;
  }
}

function isPointOnLineSeg(pt, line) {
  let xIn = false,
    yIn = false;
  let xMax, xMin, yMax, yMin;
  if (line[0][0] > line[1][0]) {
    xMax = line[0][0];
    xMin = line[1][0];
  } else {
    xMax = line[1][0];
    xMin = line[0][0];
  }
  if (line[0][1] > line[1][1]) {
    yMax = line[0][1];
    yMin = line[1][1];
  } else {
    yMax = line[1][1];
    yMin = line[0][1];
  }
  if (pt[0] < xMax && pt[0] > xMin) {
    xIn = true;
  }
  if (pt[1] < yMax && pt[1] > yMin) {
    yIn = true;
  }
  if (xIn && yIn) {
    return true;
  } else {
    return false;
  }
}

export function fitBox(plot, other) {
  ctx.strokeStyle = "red";
  let minArea = 0;
  let top, projBase, base1, base2, h, w, asp;
  //For each side...
  for (let i = 0; i < plot.length - 1; i++) {
    let p1, p2;
    p1 = plot[i];
    if (i === plot.length - 1) {
      p2 = plot[0];
    } else {
      //...including the end to the beginning...
      p2 = plot[i + 1];
    }

    //...project the other points sum the x's and y's & record the one projected the furthest...
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

    //Find the furthest 2 points from the centroid
    var left = centroid;
    var right = centroid;
    var furthL = 0;
    var furthR = 0;

    //Check the distance of each projected point against the others.
    //Record the longest distance
    for (let q = 0; q < projPoints.length - 1; q++) {
      var xS = projPoints[q][0] - centroid[0];
      var yS = projPoints[q][1] - centroid[1];
      var dist = Math.hypot(xS, yS);

      if (dist >= furthL && projPoints[q][0] <= left[0]) {
        left = projPoints[q];
        furthL = dist;
      } else if (dist >= furthR && projPoints[q][0] >= right[0]) {
        right = projPoints[q];
        furthR = dist;
      } //Need elses in case points are on exact same X?
    }

    //drawLine(left, right, "green", 2);
    //drawPoint(left, "yellow");
    //drawPoint(right, "green");

    var width = furthL + furthR;

    let aspTest;

    if (height / width <= 1) {
      aspTest = width / height;
    } else {
      aspTest = height / width;
    }

    var area = height * width;

    if (minArea === 0) {
      top = heighest;
      projBase = base;
      base1 = left;
      base2 = right;
      minArea = area;
      asp = aspTest;
      h = height;
      w = width;
    } else if (area < minArea && area !== 0) {
      top = heighest;
      projBase = base;
      base1 = left;
      base2 = right;
      minArea = area;
      asp = aspTest;
      h = height;
      w = width;
    }
  }

  //console.log({base1});

  let dist1 = varDists(base1, projBase);
  let dist2 = varDists(base2, projBase);

  let newCorner1 = [top[0] + dist2[0], top[1] + dist2[1]];
  let newCorner2 = [top[0] + dist1[0], top[1] + dist1[1]];
  let topMid, botMid;
  let boundBox = [base1, base2, newCorner1, newCorner2, base1];

  //Make the midline split the longest side.
  if (h > w) {
    topMid = centroidOf([base2, newCorner1]);
    botMid = centroidOf([base1, newCorner2]);
  } else {
    topMid = centroidOf([newCorner1, newCorner2]);
    botMid = centroidOf([base1, base2]);
  }
  let midline = [topMid, botMid];

  //fillShape(boundBox, "100,100,100, 0.5");
  //drawLine(midline[0], midline[1], "cyan", 2);

  return [boundBox, midline, asp];
}

export function centroidOf(points) {
  let totX = 0,
    totY = 0;
  for (let i = 0; i < points.length; i++) {
    totX += points[i][0];
    totY += points[i][1];
  }
  totX = totX / points.length;
  totY = totY / points.length;
  return [totX, totY];
}

export function varDists(p1, p2) {
  var xDif = p1[0] - p2[0];
  var yDif = p1[1] - p2[1];
  return [xDif, yDif];
}

export function fillShape(pntArr, color) {
  ctx.fillStyle = "rgba(" + color + ")";
  ctx.beginPath();
  ctx.moveTo(pntArr[0][0], pntArr[0][1]);
  for (let z = 0; z < pntArr.length; z++) {
    ctx.lineTo(pntArr[z][0], pntArr[z][1]);
  }
  ctx.closePath();
  ctx.fill();
}

export function drawPoint(point, color, rad) {
  if (rad === undefined) {
    rad = 4;
  }
  if (color === undefined) {
    color = "red";
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(point[0], point[1], rad, 0, 2 * Math.PI, false);
  ctx.fill();
}

export function drawLine(point1, point2, color, weight) {
  ctx.lineWidth = weight;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(point1[0], point1[1]);
  ctx.lineTo(point2[0], point2[1]);
  ctx.stroke();
}

//https://math.stackexchange.com/questions/62633/orthogonal-projection-of-a-point-onto-a-line/62638
export function projectPointToLine(p, v1, v2, draw) {
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

//Loops through voronoi cells and separates non-infinite cells out.
export function findInfinite(vor, nonInfin) {
  for (var i = 0; i < vor.vectors.length; i += 4) {
    if (vor.vectors[i] !== 0) {
      //If cell is infinite, color it.
      // ctx.beginPath();
      // ctx.fillStyle = "rgba(225," + 10 * i + ",225,0.5)";
      // vor.renderCell(i / 4, ctx);
      // ctx.fill();
    } else {
      nonInfin.push(i / 4);
    }
  }
}

export function genPoints(cPoints, sRnd, canvas, callback) {
  let cWidth = canvas.width;
  let cHeight = canvas.height;
  let points = [];
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
  return points;
}
