function RectNim(width, height, $parent, board=undefined){
		this.$parent = $parent;
		this.width = width;
		this.height = height;
		this.tokens = [];
		this.rest = [];
		this.grundy = 0;
		this.turn = 0;
		this.before = [-1,[1]];
		for(var i = 0;i < height;i++){
				if(board)this.tokens[i] = board[i];
				else this.tokens.push([0,width-1]);
				this.rest.push(this.tokens[i][1] - this.tokens[i][0]);
				this.grundy ^= this.tokens[i][1] - this.tokens[i][0];
		}

		this.isFinished = function(){
				for(var i = 0;i < this.height;i++){
						if(this.tokens[i][0] + 1 != this.tokens[i][1])return false;
				}
				return true;
		}

		this.update = function(){
				this.grundy = 0;
				for(var i = 0;i < height;i++){
						this.rest[i] = this.tokens[i][1] - this.tokens[i][0] - 1;
						this.grundy ^= this.rest[i];
				}
				this.updateBoard();
		}

		this.drawBoard = function(){
				this.$parent.empty();
				var new_table = $('<table border="1"></table>');
				for(var i = 0;i < height;i++){
						var new_raw = $("<tr></tr>");
						for(var j = 0;j < width;j++){
								var name = i + " " + j
								if(j < this.tokens[i][0])new_raw.append('<th width="20" name="' + name + '">-</th>');
								else if(j == this.tokens[i][0])new_raw.append('<th width="20" name="' + name + '">\></th>');
								else if(j < this.tokens[i][1])new_raw.append('<th width="20" name="' + name + '"></th>');								
								else if(j == this.tokens[i][1])new_raw.append('<th width="20" name="' + name + '">\<</th>');								
								else if(j > this.tokens[i][1])new_raw.append('<th width="20" name="' + name + '">-</th>');
						}
						new_raw.append('<p name="' + i + '">' + this.rest[i] + "</p>");
						new_table.append(new_raw);
				}
				this.$parent.append(new_table);
		}

		this.updateBoard = function(){
				for(var i = 0;i < height;i++){
						for(var j = 0;j < width;j++){
								var name = i + " " + j
								var $tmp = $('[name="'+name+'"]');
								if(j < this.tokens[i][0])$tmp.text("-");
								else if(j == this.tokens[i][0])$tmp.text(">");
								else if(j < this.tokens[i][1])$tmp.text("");
								else if(j == this.tokens[i][1])$tmp.text("<");
								else if(j > this.tokens[i][1])$tmp.text("-");
						}
						$('[name="'+i+'"]').text(this.rest[i]);
				}
				$('#grundy').text(this.grundy);
		}

		this.set = function(x, y){
				if(this.before[0] == -1){
						this.before = [x,this.tokens[x].concat()];
				}
				if(this.isValid(x,y)){
						this.tokens[x][this.turn] = y;
						this.update();
				}
		}

		this.undo = function(){
				this.tokens[this.before[0]] = this.before[1].concat();
				this.before = [-1,[1]];
				this.update();
		}
		
		this.isValid = function(x, y){
				var tmp = this.tokens[x][0];
				if(x == this.before[0])tmp = this.before[1];
				return (tmp[0] - y) * (tmp[1] - y) < 0;
		}
		
		this.move = function(x, y){
				if(!this.isValid(x,y))return;
				this.tokens[x][this.turn] = y;
				this.before = [-1,[1]];
				console.log([x,y]);
				this.update();
				if(this.isFinished()){
						var winner = "";
						if(this.turn == 0)winner = "Left";
						else winner = "Right";
						alert(winner + " won!!");
						location.reload();
				}
				this.turn ^= 1;
		}
}
var Game;

var board =[
		[0,9],
		[1,8],
		[2,7]
];

$(function(){
		Game = new RectNim(10, 3, $("#game-body"), board);
		Game.drawBoard();
		$("#game-body th").hover(
				function(){
						var xy = $(this).attr('name').split(' ');
						var x = Number(xy[0]);
						var y = Number(xy[1]);
						Game.set(x, y);
				},
				function(){
						Game.undo();
				}
		);

		$("#game-body th").click(
				function(){
						var xy = $(this).attr('name').split(' ');
						var x = Number(xy[0]);
						var y = Number(xy[1]);
						Game.move(x,y);
		});
});
