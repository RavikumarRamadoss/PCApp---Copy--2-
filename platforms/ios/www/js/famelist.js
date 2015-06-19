//var serviceURL = "http://192.168.1.102/ParentConnect/rest/walloffame/getLatest";/
var fameserviceURL = serviceContextURL+"/rest/walloffame/getLatest";
var jsonfames;

var fames;

$(document).on("pagebeforeshow","#fameListPage",function(){ 
	  //alert("pagebeforeshow-fameListPage: "+fameserviceURL);
	getfameList();
});


function getfameList() {
	
	var data="dhksdfskdfhkjsdhfkjsdhfkjsdj";
	//alert("fameserviceURL: "+fameserviceURL);
	var ajax = new XMLHttpRequest();
	ajax.open("POST",fameserviceURL,true);
	ajax.send(data);

	ajax.onreadystatechange=function(){
	   if (ajax.readyState === 4) {
	     if (ajax.status === 200 || ajax.status === 0) {
	    	 //alert(ajax.responseText);
	    	 displayFame(ajax.responseText)
	       } else {
	    	 alert("Ajax error: "+ajax.status);
	     }
	   }
	}
	
}

function displayFame(data) {
	jsonfames =JSON.parse(data);
	//alert('jsonfames:'+jsonfames);
	$('#fameList li').remove();
	$.each(jsonfames, function(index, fame) {
		var vfameID = fame.id;
		/*$('#fameList').append('<li><a href="#detailsPage?id='+ vfameID +'" onclick="displayFameDetails('+ vfameID +')">' +
			'<img src="http://192.168.1.102/ParentConnect/' + fame.imagePath + '"/>' +
			'<h4>' + fame.title + '</h4>');*/
		$('#fameList').append('<li><a href="#detailsPage" onclick="displayFameDetails('+ vfameID +')" data-transition="flip">' +
			'<img src="'+ serviceContextURL + fame.imagePath + '"/>' +
			'<h4>' + fame.title + '</h4>');
	});
	//alert("fameList-refresh");
	$('#fameList').listview('refresh');
}