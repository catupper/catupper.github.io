function ccw(a, b, c){
		var x1 = b[0] - a[0];
		var y1 = b[1] - a[1];
		var x2 = c[0] - a[0];
		var y2 = c[1] - a[1];
		if(x1*y2-y1*x2 < 0)return -1;
		if(x1*y2-y1*x2 == 0)return 0;
		if(x1*y2-y1*x2 > 0)return 1;
}

function convexHull(points){
		points.sort(function(a, b){
				if(a[0] == b[0]) return a[1] - b[1];
				else return a[0] - b[0];
		});
		res = [];
		for(var point of points){
				r = res.length;
				while(res.length >= 2 && ccw(res[res.length-2], res[res.length-1], point) != 1){
						res.pop();
				}
				res.push(point);
		}
		var k = res.length;
		for(var i = points.length-2;i >= 0;i--){
				var point = points[i];
				while(res.length >= k + 1 && ccw(res[res.length-2], res[res.length-1], point) != 1){
						res.pop();
				}
				res.push(point);
		}
		return res;
}

var points = [];


function dict(a, b){
		x = a[0] - b[0];
		y = a[1] - b[1];
		return x*x+y*y;
}
function onClick(e){
		var canvas = document.getElementById("field");
		var x = e.clientX - canvas.offsetLeft;
		var y = e.clientY - canvas.offsetTop;
		add_or_delete = -1;
		for(var i = 0;i < points.length;i++){
				if(dict([x,y], points[i]) < 100)add_or_delete = i;
		}
		if(add_or_delete == -1){
				points = points.concat([[x,y]]);
		}
		else{
				points.splice(add_or_delete,1);
		}
		var ch = convexHull([].concat(points));
		console.log(points);
		console.log(ch);
		var ctx = canvas.getContext("2d");
		ctx.fillStyle = "white";
		ctx.fillRect(0,0,canvas.width, canvas.height);
		for(var elem of points){
				var node = canvas.getContext("2d");
				node.beginPath();
				console.log(elem);
				node.strokeStyle = "#00FF00";
				node.fillStyle = "#00FF00";
				node.globalAlpha = "1.0";
				node.arc(elem[0], elem[1], 2 ,0,  2 * Math.PI, false);
				node.stroke();
				node.fill();
		}
		for(var elem of ch){
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
		for(var i = 0;i < ch.length;i++){
				var elem = ch[i];
				if(i == 0)linect.moveTo(elem[0], elem[1]);
				else linect.lineTo(elem[0], elem[1]);
		
		}
		linect.closePath();
		linect.stroke();
}
console.log(document);
window.onload = function(){
		document.getElementById("field").addEventListener('click', onClick, false);
}
