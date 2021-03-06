// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var ytplayer;

function onYouTubeIframeAPIReady() {
  ytplayer = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: null, //should return null every time, so this will fail and we will have an empty player waiting for someone to call ytLoadSong()
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}
// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  //When the player is ready, we don't really want to do anything unless the user has addes something to the playlist queue yet.
  pl_manager.youtubeReady();
}


// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
// var done = false;
function onPlayerStateChange(event) {
  //play the next song in the playlist queue if the current one is over.
  //later we should check that the next song is actually a youtube song, and that we dont need to switch players here
  if (event.data == YT.PlayerState.ENDED) {
    //ytLoadSong(pl_manager.getNext())
    pl_manager.loadSong();
  }
}
function stopVideo() {
  ytplayer.stopVideo();
}
function ytLoadSong(songid){
  ytplayer.loadVideoById({'videoId': songid});
}

// ====================================
// ========Soundcloud Player===========
// ====================================
var scplayer;
//now initialize the soundcloud player
function initializeSCPlayer(){
  scplayer = SC.Widget("scplayer");
  scplayer.bind(SC.Widget.Events.FINISH, pl_manager.loadSong); 
}
function scLoadSong(id){
  url = "http://api.soundcloud.com/tracks/" + id
  options = {"show_artwork":false, "auto_play":true};
  scplayer.load(url, options);
} 
// ====================================
// ======== Universal Player ==========
// ====================================
// ......always use this.

var pl_manager; 

function uniPlayer() {

  this.yt = null;
  this.sc = null;
  this.currentSong = null;
  
  this.initializePlayer = function() {
	  initializeSCPlayer();
	  this.sc = scplayer;
  }
  
  this.play = function() {
    if(this.currentSong.songtype == "youtube"){
      this.yt.playVideo();
    } else {
      this.sc.play();
    }
  }
  
  this.loadSong = function() { 
	this.currentSong = window.current_pld.pl.getNext(); 
    if (this.currentSong.songtype == "youtube") {
		ytLoadSong(this.currentSong.resourceid); 
	} else { 
		scLoadSong(this.currentSong.resourceid); 
	}
  }

  this.youtubeReady = function() { 
	  this.yt = ytplayer; 
  }
  
  this.playIndex = function(id, type) {
	  stopVideo(); 
	  this.sc.pause(); 
	  this.resourceid = id; 
	  this.resourcetype = type; 
	  if (this.resourcetype == "youtube") {
		  //stopVideo();  
		  ytLoadSong(this.resourceid);  
	  } else { 
		  //this.sc.pause(); 
		  scLoadSong(this.resourceid);  
	  }
  }

 /* this.pause = function(){
    //todo
  }
  this.onSongEnd = function(){
    //decide what song comes next and how to load it.
  }
  
  this.skip = function(){
	  
  }
  
  this.playerReady = function(){
    //move shit here.
  }*/
  
  
}
