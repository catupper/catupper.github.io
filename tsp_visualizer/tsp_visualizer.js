function readTxt(url, elem){
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.send("");
	var res;
	request.onreadystatechange = function(){
		//var text = document.createTextNode(decodeURI(request.responseText));
		var text = decodeURI(request.responseText);
		elem.value = text;
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

function draw(e){
		var canvas = document.getElementById("field");
		var points = parsePoints(document.getElementById("input").value);
		var route = parseRoute(document.getElementById("route").value);
		var ctx = canvas.getContext("2d");
		ctx.fillStyle = "white";
		ctx.fillRect(0,0,canvas.width, canvas.height);
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
}

function setinput(){
	var points = document.getElementById("input");
	var val = document.getElementById("sample_input").selectedIndex;
	console.log(val);
	readTxt(input_data[val], points);
}

window.onload = function(){
		document.getElementById("visualize").addEventListener('click', draw, false);
		document.getElementById("setinput").addEventListener('click', setinput, false);
}
