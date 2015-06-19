/**
 * EVENTS:
 * DOWNLOADER_initialized
 * DOWNLOADER_gotFileSystem
 * DOWNLOADER_gotFolder
 * DOWNLOADER_error
 * DOWNLOADER_noWifiConnection
 * DOWNLOADER_downloadSuccess
 * DOWNLOADER_downloadError
 * DOWNLOADER_downloadProgress
 * DOWNLOADER_unzipSuccess
 * DOWNLOADER_unzipError
 * DOWNLOADER_unzipProgress
 * DOWNLOADER_fileRemoved
 * DOWNLOADER_fileRemoveError
 * DOWNLOADER_getFileError
 * DOWNLOADER_fileCheckSuccess
 * DOWNLOADER_fileCheckFailed
 * DOWNLOADER_fileCheckError
 *
 *
 * FileObject:{
 *   url: sourceURL for download
 *   name: local filename
 *   md5: md5sum of file to compare with, or null for no compare
 * }
 */
function createEvent(name, data){
  data = data || [];
  var event = document.createEvent("Event");
  event.initEvent(name);
  event.name = name;
  event.data = data;
  var log = name;
  if (data[0]) log += " : " + data[0];
  //console.log("FIRE "+ log);
  return event;
};

var Downloader = {
  /** @type {org.apache.cordova.file.FileEntry} */
  localFolder : null,
  /** @type {String} */
  fileSystemURL: null,
  /** @type {org.apache.cordova.file.FileSystem} */
  fileSystem: null,
  /** @type {Array.<FileObjects>} */
  unzipQueue: [],
  /** @type {Array.<FileObjects>} */
  downloadQueue : [],
  /** @type {Array.<FileObjects>} */
  fileObjects:[],
  /** @type {FileObject} */  
  fileObjectInProgress: null,
  /** @type {FileObject} */  
  fileObjectInUnzipProgress: null,
  /** @type {boolean} */
  wifiOnly: false,
  /** @type {boolean} */
  autoUnzip: false,
  /** @type {boolean} */
  autoDelete: true,
  /** @type {boolean} */
  autoCheck: false,
  /** @type {boolean} */
  noMedia: true,
  /** @type {boolean} */  
  loading: false,
  /** @type {boolean} */  
  unzipping: false,
  /** @type {boolean} */
  initialized: false,

  /**
   * prepare Downloader
   * @param {Object.<String>} options
   */
  initialize: function(options){
    Downloader.setFolder(options.folder);
    if (typeof options.unzip != 'undefined'){
      Downloader.setAutoUnzip(options.unzip);
    }
    if (typeof options.delete != 'undefined'){
      Downloader.setDeleteAfterUnzip(options.delete);
    }
    if (typeof options.check != 'undefined'){
      Downloader.setAutoCheck(options.check);
    }
    if (typeof options.wifiOnly != 'undefined'){
      Downloader.setWifiOnly(options.wifiOnly);
    }
    if (typeof options.noMedia != 'undefined'){
      Downloader.setNoMedia(options.noMedia);
    }
    if (typeof options.fileSystem != 'undefined'){
      Downloader.fileSystemURL = options.fileSystem;
    }

    document.addEventListener("DOWNLOADER_gotFileSystem",    Downloader.onGotFileSystem,   false);
    document.addEventListener("DOWNLOADER_gotFolder",        Downloader.onGotFolder,       false);
    document.addEventListener("DOWNLOADER_downloadSuccess",  Downloader.onDownloadSuccess, false);
    document.addEventListener("DOWNLOADER_unzipSuccess",     Downloader.onUnzipSuccess,    false);
    document.addEventListener("DOWNLOADER_fileCheckSuccess", Downloader.onCheckSuccess,    false);
    Downloader.getFilesystem();
  },

  /**
   * Adds a File to the downloadQueue and triggers the download when no file is in progress
   * @param {String} url
   * @param {?String} md5
   */
  load: function (url, md5){
    md5 = md5 || null;
    if (!Downloader.isInitialized()){
      document.addEventListener("DOWNLOADER_initialized", function onInitialized(event){
        event.target.removeEventListener("DOWNLOADER_initialized", onInitialized, false);
        Downloader.load(url, md5);
      }, false);
      return;
    }
    var fileObject = {
      url: url,
      name: url.replace(/^.*\//, ""),
      md5: md5
    };
    Downloader.downloadQueue.push(fileObject);
    if (!Downloader.isLoading()){
      Downloader.loadNextInQueue();
    }
  },

  /**
   * Adds a File to the unzipQueue and triggers the upzip when no file is in progress
   * @param {String} fileName 
   */
  unzip: function (fileName){
    Downloader.unzipQueue.push(fileName);
    if (!Downloader.isUnzipping()){
      Downloader.unzipNextInQueue();
    }
  },

  /**
   * loads the next file in the downloadQueue
   * @returns {boolean}
   */
  loadNextInQueue: function(){
    if (Downloader.downloadQueue.length > 0){
      Downloader.loading = true;
      var fileObject = Downloader.downloadQueue.shift();
      Downloader.fileObjectInProgress = fileObject;
      Downloader.transferFile(fileObject);
      return true;
    }
    return false;
  },
  /**
   * unzips the next file in the unzipQueue
   * @returns {boolean}
   */
  unzipNextInQueue: function(){
    if (Downloader.unzipQueue.length > 0){
      Downloader.unzipping = true;
      var fileObject = Downloader.unzipQueue.shift();
      Downloader.fileObjectInUnzipProgress = fileObject;
      Downloader._unzip(fileObject);
      return true;
    }
    return false;
  },

  /**
   * @param {FileObject} fileObject
   */
  transferFile : function(fileObject) {
    var filePath = Downloader.localFolder.toURL() + "/" + fileObject.name;
    var transfer = new FileTransfer();
    transfer.onprogress = function(progressEvent) {
      if (progressEvent.lengthComputable) {
        var percentage = Math.floor(progressEvent.loaded / progressEvent.total * 100);
        document.dispatchEvent(createEvent("DOWNLOADER_downloadProgress", [percentage, fileObject.name]));
      }
    };
    transfer.download(fileObject.url, filePath, function(entry) {
      document.dispatchEvent(createEvent("DOWNLOADER_downloadSuccess", [entry]));
    }, function(error) {
      document.dispatchEvent(createEvent("DOWNLOADER_downloadError", [error]));
    });
  },

  /**
   * unzips the file
   * @param {String} fileName
   */
  //TODO: full fileEntry as param? not only fileName
  _unzip : function(fileName) {
    var folderUrl = Downloader.localFolder.toURL();
    zip.unzip(folderUrl + "/" + fileName, folderUrl, function(code) {
      if (code == 0){
        document.dispatchEvent(createEvent("DOWNLOADER_unzipSuccess", [fileName]));
      }else{
        document.dispatchEvent(createEvent("DOWNLOADER_unzipError", [fileName]));
      }
    }, function(progressEvent) {
      var percentage = Math.floor(progressEvent.loaded / progressEvent.total * 100);
      document.dispatchEvent(createEvent("DOWNLOADER_unzipProgress", [percentage, fileName]));
    });
  },
  
  /**
   * compare md5sum of fileName with md5
   * @param {String} fileName
   * @param {String} md5
   */
  check: function(fileName, md5){
    var folder  = Downloader.localFolder;
    folder.getFile(fileName, {
        create : false,
        exclusive : false
      }, function onGotFileToCheck(entry){
        md5chksum.file(entry, function(md5sum){
          //console.log(md5sum + " == " + md5);
          if (md5sum == md5){
            document.dispatchEvent(createEvent("DOWNLOADER_fileCheckSuccess", [md5sum, fileName]));
          }else{
            document.dispatchEvent(createEvent("DOWNLOADER_fileCheckFailed", [md5sum, md5, fileName]));            
          }
        }, function(error){
          document.dispatchEvent(createEvent("DOWNLOADER_fileCheckError", [error]));          
        });      
      }, function onGetFileError(error) {
        document.dispatchEvent(createEvent("DOWNLOADER_getFileError", [error]));
      }
    );   
  },
  
  /**
   * removes file with name fileName from the download-directory
   * @param {String} fileName
   */
  removeFile: function(fileName){
    var folder  = Downloader.localFolder;
    folder.getFile(fileName, {
        create : false,
        exclusive : false
      }, function onGotFileToDelete(entry){
        entry.remove(function onRemoved(){
          document.dispatchEvent(createEvent("DOWNLOADER_fileRemoved", [entry]));
        }, function onRemoveError(){
          document.dispatchEvent(createEvent("DOWNLOADER_fileRemoveError", [entry]));
        });
      }, function onGetFileError(error) {
        document.dispatchEvent(createEvent("DOWNLOADER_getFileError", [error]));
      });
  },
  
/*************************************************************** state */

  /**
   * returns true if a download is in progress
   * @returns {boolean}
   */
  isLoading: function(){
    return Downloader.loading;
  },

  /**
   * returns true if a unzip is in progress
   * @returns {boolean}
   */
  isUnzipping: function(){
    return Downloader.unzipping;
  },

  /**
   * returns true if Downloader is initialized, false otherwise
   * @returns {boolean}
   */
  isInitialized: function(){
    return Downloader.initialized;
  },

  /**
   * returns true if wifiOnly is set
   * @returns {boolean}
   */
  isWifiOnly: function(){
    return Downloader.wifiOnly;
  },

  /**
   * returns true if automatic unzipping is enabled
   * @returns {boolean}
   */
  isAutoUnzip: function(){
    return Downloader.autoUnzip;
  },

  /**
   * returns true if automatic deletion after unzipping is enabled
   * @returns {boolean}
   */
  isAutoDelete: function(){
    return Downloader.autoDelete;
  },

  /**
   * returns true if automatic md5sum compare is enabled
   * @returns {boolean}
   */
  isAutoCheck: function(){
    return Downloader.autoCheck;
  },

  /**
   * returns true if wifiOnly is set
   * @returns {boolean}
   */
  isWifiConnection: function(){
    var networkState = navigator.connection.type;
    if (networkState == Connection.WIFI) {
      return true;
    }
    return false;
  },
  
  /**
   * returns true if automatic md5sum compare is enabled
   * @param {String} fileName
   * @returns {boolean}
   */
  isZipFile: function(fileName){
    if (fileName.match(/\.zip$/)){
      //console.log("ZIPFILE " + fileName);
      return true;
    }
    //console.log("NO ZIPFILE " + fileName);
    return false;
  },

  /**
   * returns true if automatic md5sum compare is enabled
   * @param {String} fileName
   * @returns {boolean}
   */
  isNoMedia: function(){
    return Downloader.noMedia;
  },

/*************************************************************** setter */

  /**
   * sets the Folder for storing the downloads
   * @param {org.apache.cordova.file.FileEntry} folder
   */
  setFolder: function(folder){
    Downloader.localFolder = folder;
  },

  /**
   * sets if it only possible to download on wifi (not on mobile connection)
   * @param {boolean} wifionly
   */
  setWifiOnly: function(wifionly){
    Downloader.wifiOnly = wifionly;
  },

  /**
   * if set, ".nomedia" file on android is generated which prevent gallery from scanning directory
   * @param {boolean} wifionly
   */
  setNoMedia: function(noMedia){
    Downloader.noMedia = noMedia;
  },

  /**
   * if set to true unzippes the downloaded file when it ends with .zip
   * @param {boolean} unzip
   */
  setAutoUnzip: function(unzip){
    Downloader.autoUnzip = unzip;
  },

  /**
   * if set to true unzippes the downloaded file when it ends with .zip
   * @param {boolean} unzip
   */
  setAutoCheck: function(check){
    Downloader.autoCheck = check;
  },

  /**
   * if set to true zip-files get removed after extracting
   * @param {boolean} unzip
   */
  setDeleteAfterUnzip: function(del){
    Downloader.autoDelete = del;
  },

/*************************************************************** getter */

  /**
   * gets the persistent FileSystem
   */
  getFilesystem : function() {
    if (Downloader.fileSystemURL){
      console.log("Using fileSystemURL:" + Downloader.fileSystemURL);
      window.resolveLocalFileSystemURI(Downloader.fileSystemURL, function(rootfolder) {
        document.dispatchEvent(createEvent("DOWNLOADER_gotFileSystem", [rootfolder]));
      }, function(error) {
        document.dispatchEvent(createEvent("DOWNLOADER_error", [error]));
      });
    }else{
      console.log("Fallback to Persistant Filesystem");
      window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
        document.dispatchEvent(createEvent("DOWNLOADER_gotFileSystem", [fileSystem.root]));
      }, function(error) {
        document.dispatchEvent(createEvent("DOWNLOADER_error", [error]));
      });
    }
  },

  

  /**
   * @param {org.apache.cordova.file.FileSystem} fileSystem
   * @param {String} folderName
   */
  getFolder : function(fileSystem, folderName) {
    fileSystem.getDirectory(folderName, {
      create : true,
      exclusive : false
    }, function(folder) {
      console.log("getFolder->Success:" + folder.fullPath + " : " + folder.name);
      document.dispatchEvent(createEvent("DOWNLOADER_gotFolder", [folder]));
    }, function(error) {
      console.log("getFolder->Error");
      document.dispatchEvent(createEvent("DOWNLOADER_error", [error]));
    });
  },
  touchNoMedia: function(){
    var folder = Downloader.localFolder;
    folder.getFile(".nomedia", {
        create : true,
        exclusive : false
      }, function onTouchNoMediaFile(entry){
        
      }, function onTouchNoMediaFileError(error) {
        document.dispatchEvent(createEvent("DOWNLOADER_getFileError", [error]));
      });  
  },
/*************************************************************** EventHandler */

  /**
   * @param {Object} event
   */
  onDownloadSuccess : function(event) {
    var entry = /** @type {org.apache.cordova.file.FileEntry} */ event.data[0];
    if (Downloader.isAutoCheck()){
      var md5 = Downloader.fileObjectInProgress.md5;
      Downloader.check(entry.name, md5);
    }else if (Downloader.isAutoUnzip() && Downloader.isZipFile(entry.name)){
      Downloader.unzip(entry.name);
    }
    if (!Downloader.loadNextInQueue()){
      Downloader.loading = false;
      Downloader.fileObjectInProgress = null;
    }
  },

  /**
   * @param {Object} event
   */
  onUnzipSuccess : function(event) {
    var fileName = /** @type {org.apache.cordova.file.FileEntry} */ event.data[0];
    if (Downloader.isAutoDelete()){
      Downloader.removeFile(fileName);
    }
		if(!Downloader.unzipNextInQueue()){
			Downloader.unzipping = false;
			Downloader.fileObjectInUnzipProgress = null;
		}
  },

  /**
   * @param {Object} event
   */
  onCheckSuccess : function(event) {
    //var md5 = /** @type {String} */ event.data[0];
    var fileName = /** @type {String} */ event.data[1];
    //console.log("CHECKED: " + md5 + ":" + fileName);
    if (Downloader.isAutoUnzip() && Downloader.isZipFile(fileName)){
      Downloader.unzip(fileName);   
    }
  },
  
  /**
   * @param {Object} event
   */
  onGotFileSystem : function(event){ 
    event.target.removeEventListener(event.name, Downloader.onGotFileSystem);
    var fileSystem = /** @type {org.apache.cordova.file.FileSystem} */ event.data[0];
    Downloader.fileSystem = fileSystem;
    Downloader.getFolder(fileSystem, Downloader.localFolder);
  },

  /**
   * @param {Object} event
   * @param {org.apache.cordova.file.FileEntry} folder
   */
  onGotFolder : function(event){ 
    event.target.removeEventListener(event.name, Downloader.onGotFolder);
    var folder = /** @type {org.apache.cordova.file.FileEntry} */ event.data[0];
    Downloader.localFolder = folder;
    Downloader.initialized = true;
    if (Downloader.isNoMedia()){
      Downloader.touchNoMedia();
    } 
    //console.log("initialized " + Downloader.localFolder.toURL());
    document.dispatchEvent(createEvent("DOWNLOADER_initialized"));
  },

/*************************************************************** API */

  interface : {
    /**
     * initializes the downloader
     * @param {Object} options
     *   - folder: sets folder to store downloads [required]
     *   - unzip: true -> unzip after download is enabled [default: false]
     *   - check: true -> md5sum of file is checked after download [default: false]
     *   - delete: true -> delete after unpack a zipfile [default: true]
     *   - wifiOnly: true -> only Download when connected to Wifi, else fire "DOWNLOADER_noWifiConnection" event [default: false]
     */
    init: function(options){
      if (!options.folder){
        console.error("You have to set a folder to store the downloaded files into.");
        return;
      }
      options = options || {};
      Downloader.initialize(options);
    },
    
    /**
     * downlaods file at url and check md5sum if enabled
     * @param {String} url
     * @param {String} md5
     * 
     */
    get: function(url, md5){
      /*if (!Downloader.isInitialized()){
        console.error("You have to initialize Downloader first");
        return;
      }*/
      if (!url){
        console.error("You have to specify a url where the file is located you wanna download");
        return;
      }
      if (Downloader.isWifiOnly() && !Downloader.isWifiConnection()){
        document.dispatchEvent(createEvent("DOWNLOADER_noWifiConnection"));
        return;
      }
      Downloader.load(url, md5);
    },
    /**
     * downloads multiple Files in a row
     * DownloadObject:{
     *   url: sourceURL for download,
     *   md5: md5sum of file to compare with, or null for no compare
     * }
     * @param {Array.<DownloadObject>} list
     */
    getMultipleFiles: function(list){
      if (Downloader.isWifiOnly() && !Downloader.isWifiConnection()){
        document.dispatchEvent(createEvent("DOWNLOADER_noWifiConnection"));
        return;
      }
      for (var i = 0; i < list.length; i++){
        var fileObject = list[i];
        Downloader.load(fileObject.url, fileObject.md5);
      }
    },
		isInitialized: function(){
			return Downloader.isInitialized();
		},
  	setWifiOnly: function(wifionly){
    	Downloader.setWifiOnly(wifionly);
  	},  
  	setNoMedia: function(noMedia){
    	Downloader.setNoMedia(noMedia);
  	},  
  	setAutoUnzip: function(unzip){
    	Downloader.setAutoUnzip(unzip);
  	},  
  	setAutoCheck: function(check){
    	Downloader.setAutoCheck(check);
  	},  
  	setDeleteAfterUnzip: function(del){
    	Downloader.setDeleteAfterUnzip(del);
  	},  

	 	
  }
};

module.exports = Downloader.interface;
