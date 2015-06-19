 //var fileTransfer = new FileTransfer();
		//var uri = encodeURI("http://some.server.com/download.php");



		    function downloadFileUtil(){
		    alert("downloadFileUtil");
		        window.requestFileSystem(
		                     LocalFileSystem.PERSISTENT, 0,
		                     function onFileSystemSuccess(fileSystem) {
								 alert("onfilesystemsuccess");
		                     fileSystem.root.getFile(
		                                 "dummy.html", {create: true, exclusive: false},
		                                 function gotFileEntry(fileEntry){
		                                 var sPath = fileEntry.fullPath.replace("dummy.html","");
		                                 var fileTransfer = new FileTransfer();
		                                 fileEntry.remove();

		                                 fileTransfer.download(
		                                           "http://www.datamits.com/sample.pdf",
		                                           sPath + "theFile.pdf",
		                                           function(theFile) {

		                                          alert("download complete: " + theFile.toURI());
		                                           showLink(theFile.toURI());
		                                           },
		                                           function(error) {
													   alert(error.source);
													   alert(error.target);
													   alert(error.code);

		                                           }
		                                           );
		                                 },
		                                 fail);
		                     },
		                     fail);

		    }

		    function showLink(url){
		        alert(url);
		        var divEl = document.getElementById("ready");
		        var aElem = document.createElement("a");
		        aElem.setAttribute("target", "_blank");
		        aElem.setAttribute("href", url);
		        aElem.appendChild(document.createTextNode("Ready! Click To Open."))
		        divEl.appendChild(aElem);

		    }


		    function fail(evt) {
		        console.log(evt.target.error.code);
		    }

