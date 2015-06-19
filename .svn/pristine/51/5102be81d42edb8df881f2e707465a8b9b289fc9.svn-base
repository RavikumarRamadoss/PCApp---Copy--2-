//var serviceURL = "http://192.168.1.102/ParentConnect/rest/walloffame/getLatest";/
var circularServiceURL = serviceContextURL+"/rest/circular/getCircular";
var jsoncirculars;

$(document).on("pagebeforeshow","#circularsListPage",function(){ 
	getCircularList();
});


function getCircularList() {
	
	var data="dhksdfskdfhkjsdhfkjsdhfkjsdj";
	//alert("getCircularList-circularServiceURL: "+circularServiceURL);
	var ajax = new XMLHttpRequest();
	ajax.open("POST",circularServiceURL,true);
	ajax.send(data);

	ajax.onreadystatechange=function(){
	   if (ajax.readyState === 4) {
	     if (ajax.status === 200 || ajax.status === 0) {
	    	 //alert("Ajax success:responseText: "+ajax.responseText);
	    	 displayCircular(ajax.responseText)
	       } else {
	    	 //alert("Ajax error:status: "+ajax.status);
	     }
	   }
	}
	
}

function displayCircular(data) {
	jsoncirculars = JSON.parse(data);
	//alert('jsoncirculars: '+jsoncirculars);
	$('#circularList li').remove();
	$.each(jsoncirculars, function(index, circular) {
		var vCircularID = circular.id;
		var vCircularPath = circular.circularPath;
		//alert("vCircularPath: "+vCircularPath);
		$('#circularList').append('<li><a href="#" onclick="displayCircularDetails('+ vCircularID +');" data-transition="flip">' + '<h4>' + circular.circularTitle + '</h4>');
	});
	//alert("circularList-refresh");
	$('#circularList').listview('refresh');
}

function displayCircularDetails(id) {
	
	$.each(jsoncirculars, function(index, circular) {
		var vCircularID = circular.id;
		var vCircularPath = circular.circularPath;
	 	if(vCircularID == id)
		{
	 		cirDocurl = 'http://docs.google.com/viewer?url='+vCircularPath;
	 		//alert(cirDocurl);
	 		window.open(cirDocurl,'_system','location=yes');
		}
	});
}

