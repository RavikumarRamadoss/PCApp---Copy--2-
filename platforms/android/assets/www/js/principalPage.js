var principalPageserviceURL = serviceContextURL+"/rest/principalpage/getLatest";
var jsonprincipalPage;

$(document).on("pagebeforeshow","#principalPage",function(){ 
	//alert("pagebeforeshow..");
	getprincipalPage();
});


function getprincipalPage() {
	//alert("getprincipalPage:principalPageserviceURL: "+principalPageserviceURL);
	var data="dhksdfskdfhkjsdhfkjsdhfkjsdj";

	var ajax = new XMLHttpRequest();
	ajax.open("POST",principalPageserviceURL,true);
	ajax.send(data);

	ajax.onreadystatechange=function(){
	   if (ajax.readyState === 4) {
	     if (ajax.status === 200 || ajax.status === 0) {
	    	 //alert(ajax.responseText);
	    	 displayprincipalPage(ajax.responseText)
	       } else {
	    	 alert("Ajax error: "+ajax.status);
	     }
	   }
	}
	
}

function displayprincipalPage(data) {
	jsonprincipalPage =JSON.parse(data);
	//alert('jsonprincipalPage:'+jsonprincipalPage);
	$('#PrincipalMsgPic').attr('src',serviceContextURL + jsonprincipalPage.imagePath);
	$('#PrincipalMsgTitle').text(jsonprincipalPage.title);
	//alert("content: "+jsonprincipalPage.content);
	$('#PrincipalMsgDesc').text(jsonprincipalPage.content);
}