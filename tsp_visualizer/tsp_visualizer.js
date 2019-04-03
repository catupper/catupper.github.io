function readTxt(url, elem){
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.send("");
	var res;
	request.onreadystatechange = function(){
		//var text = document.createTextNode(decodeURI(request.responseText));
		var text = decodeURI(request.responseText);
		elem.value = text;
		var n = text.trim().split("\n").length;
		var route = Array.from({length: n}, (v, k) => k);
		setRoute(route);
	}
}
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function dist(point1, point2){
	var x =point1[0]-point2[0];
	var y =point1[1]-point2[1];
	return Math.sqrt(x*x+y*y);
}

function distsum(points, route){
	var n = route.length;
	var ret = 0;
	for(var i = 0;i < n;i++){
		var nxti = (i + 1) % n;
		ret += dist(points[route[i]], points[route[nxti]]);
	}
	return ret;
}

function update_route(prob){
	var points = parsePoints(document.getElementById("input").value);
	var route = parseRoute(document.getElementById("route").value);
	var n = route.length;
	for(var i = 0;i < 100;i++){
		a = getRandomInt(0, n-1);
		b = getRandomInt(0, n-1);
		if(a > b)b = [a,a=b][0];
		if(a == b || a == 0 && b == n-1)continue;
		var tmp = distsum(points, route);
		var diff =-dist(points[route[(a+n-1)%n]], points[route[a]])
						+dist(points[route[(a+n-1)%n]], points[route[b]])
						-dist(points[route[b]], points[route[(b+1)%n]])
						+dist(points[route[a]], points[route[(b+1)%n]]);
		if(diff < 0 || Math.random() < prob){
			while(a < b){
				route[b] = [route[a],route[a] = route[b]][0];
				a += 1;
				b -= 1;
			}
			setRoute(route);
			return;
		}
	}
}

var input_data = [
	"https://catupper.github.io/spring2019/ja_JP/sourcecode/point_euclid_input1.txt",
	"https://catupper.github.io/spring2019/ja_JP/sourcecode/point_euclid_input2.txt",
	"https://catupper.github.io/spring2019/ja_JP/sourcecode/point_euclid_input3.txt",
	"https://catupper.github.io/spring2019/ja_JP/sourcecode/point_euclid_input4.txt"
];

function parsePoints(input){
	return input.split('\n').map(x=>x.split(' ').map(x=>parseInt(x,10)));
}

function parseRoute(route){
	return route.replace(/\n/g,' ').trim().split(' ').map(x=>parseInt(x,10));
}

function setRoute(route){
	document.getElementById("route").value = route.join(" ");
}


function clearCanvas(){
		var canvas = document.getElementById("field");
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "white";
	ctx.fillRect(0,0,canvas.width, canvas.height);
}

function draw(e){
		var canvas = document.getElementById("field");
		var points = parsePoints(document.getElementById("input").value);
		var route = parseRoute(document.getElementById("route").value);
		for(var elem of points){
				var node = canvas.getContext("2d");
				node.beginPath();
				node.strokeStyle = "#FF0000";
				node.fillStyle = "#FF0000";
				node.globalAlpha = "1.0";
				node.arc(elem[0], elem[1], 2 ,0,  2 * Math.PI, false);
				node.stroke();
				node.fill();
		}
		var linect = canvas.getContext("2d")
		linect.beginPath();
		linect.strokeStyle = "#0000FF";
		linect.globalAlpha ="1.0";
		for(var i = 0;i < route.length;i++){
				var elem = points[route[i]];
				if(i == 0)linect.moveTo(elem[0], elem[1]);
				else linect.lineTo(elem[0], elem[1]);
		}
		linect.closePath();
		linect.stroke();
		document.getElementById("dist").innerHTML = distsum(points, route);
}

function draw_route(route, color="#0000FF"){
		var canvas = document.getElementById("field");
		var points = parsePoints(document.getElementById("input").value);
		var linect = canvas.getContext("2d")
		linect.beginPath();
		linect.strokeStyle = color;
		linect.globalAlpha ="1.0";
		for(var i = 0;i < route.length;i++){
				var elem = points[route[i]];
				if(i == 0)linect.moveTo(elem[0], elem[1]);
				else linect.lineTo(elem[0], elem[1]);
		}
		linect.closePath();
		linect.stroke();
}

function setinput(){
	var points = document.getElementById("input");
	var val = document.getElementById("sample_input").selectedIndex;
	readTxt(input_data[val], points, route);
}

function two_opt(){
	var trial = 100000.0;
	var i = trial;
	var best_route = parseRoute(document.getElementById("route").value);
	var points = parsePoints(document.getElementById("input").value);
	var best_dist = distsum(points, best_route);
	var timer = setInterval(function(){
		update_route(i / trial / 100000);
		if(i < 0)clearInterval(timer);
		var now_dist = distsum(points, parseRoute(document.getElementById("route").value));
		if(now_dist < best_dist){
			best_dist = now_dist;
			best_route = parseRoute(document.getElementById("route").value);
			document.getElementById("best").innerHTML = best_dist;
		}
		clearCanvas();
		draw_route(best_route, "#FF0000");
		draw();
		i-=1;
		document.getElementById("trial").innerHTML = i;
	}, 1);
	setRoute(best_route);
}

window.onload = function(){
		document.getElementById("visualize").addEventListener('click', draw, false);
		document.getElementById("setinput").addEventListener('click', setinput, false);
		document.getElementById("annealing").addEventListener('click', two_opt, false);
}
