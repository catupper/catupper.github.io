function _GET(){
    var get = new Array();
    if(location.search.length > 1){
        var search = unescape(decodeURI(location.search));
        var requests = search.substr(1).split("&");
        for(var i = 0; i < requests.length; i++){
            var r = requests[i].split("=");
            get[r[0]] = r[1];
        }
    }
    return get;
}

function str(){
    var get = _GET();
    return "「" + get['str'] + "」";
}

function judge(){
    var get = _GET();
    if('str' in get){
	var str = get['str'];
	var res = "";
	if(/^[ぁ-ゞ|ー]+$/.test(str)){
            if(str.length < 7){
res = "レギュレーション違反！";
            }
            else{
		var l = str.length;
		var ta = str.charAt(l-1);
		var ba = str.charAt(l-2);
		str = str.substr(-7);
		var ans = ba + ta + "で" + ba + ta + ba + ta;
		if(str == ans){
		    res = "おもしろい！";
		}
		else{
		    res = "レギュレーション違反";
		}
            }
	}
	else{
            res = "ひらがなでおねがい";
	}

	if(str == "西日暮里でぽりぽり"){
	    res = "最高にいいダジャレ！"
	}
	if(str == "田端でバタバタ"){
	    res = "王者の風格を感じる"
	}
    }
    else{
        res = "なんか変やで";
    }


    return res
}
