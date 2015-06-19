//var vID = "";
/*$(document).on("pagebeforeshow","#detailsPage",function(){ // When entering pagetwo
	alert("famedetails pagebeforeshow:jsonfames: "+jsonfames);
	vID = getUrlVars()["id"];
	
});*/
function displayFameDetails(id) {
	/*alert("displayFameDetails:id: "+id);
	alert("displayFameDetails:jsonfames: "+jsonfames);*/
	$.each(jsonfames, function(index, fame) {
		var vfameID = fame.id;
	 	//alert("vfameID: "+vfameID);
	 	if(vfameID == id)
		{
			//alert("Matching json id: " + vfameID);
	 		$('#famePic').attr('src',serviceContextURL + fame.imagePath);
			$('#fameTitle').text(fame.title);
			$('#fameDesc').text(fame.content);
		}
	});
}

/*function getUrlVars() {
	alert("in-getUrlVars");
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    alert("before return:vars: "+vars);
    return vars;
}*/
