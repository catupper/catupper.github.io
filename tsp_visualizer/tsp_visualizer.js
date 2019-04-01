function parsePoints(input){
	return input.split('\n').map(x=>x.split(' ').map(x=>parseInt(x,10)));
}

function parseRoute(route){
	return route.split('\n').map(x=>parseInt(x,10));
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

window.onload = function(){
		document.getElementById("visualize").addEventListener('click', draw, false);
}
