// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var ytplayer;

var pl_manager = new playlist();

function onYouTubeIframeAPIReady() {
  //TODO : make this universal
  player = new YT.Player('player', {
    height: '390',
    width: '640',

	videoID: currentYTSongsRIDs.getCurrent(), 
	//videoId: currentYTSongs.getNext(),
	  //pl_manager.getNext(),
	  //should return null every time, so this will fail and we will have an empty player waiting for someone to call ytLoadSong()

    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}
// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  //When the player is ready, we don't really want to do anything unless the user has addes something to the playlist queue yet.
  //I'll deal with this later.
  event.target.playVideo();
  //pl_manager.append("string");
}
// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
// var done = false;
function onPlayerStateChange(event) {
  //play the next song in the playlist queue if the current one is over.
  //later we should check that the next song is actually a youtube song, and that we dont need to switch players here
  if (event.data == YT.PlayerState.ENDED) {
    ytLoadSong(pl_manager.getNext())
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
}
function scLoadSong(id){
  url = "http://api.soundcloud.com/tracks/" + id
  options = {"show_artwork" : false};
  scplayer.load(url, options);
}
// ====================================
// ======== Universal Player ==========
// ====================================
// ......always use this.

// var player;

function initializePlayer(){
  //get soundcloud ready
  initializeSCPlayer();
  //create the universal player
  player = new uniPlayer(ytplayer, scplayer);
}

function uniPlayer(youtube, soundcloud){
  this.currentMode = "yt";
  this.yt = youtube;
  this.sc = soundcloud;
  //this player will also use pl_manager

  this.play = function(){
    if(this.mode == "yt"){
      this.yt.playVideo();
    }
    else{
      this.sc.play();
    }
  }

  this.pause = function(){
    //todo
  }
  this.onSongEnd = function(){
    //decide what song comes next and how to load it.
  }
  this.skip = function(){
    //what do we do if skip is pressed?
  }
  this.playIndexFromPlaylist = function(index){
    //what to do if a user clicks play on a particular song in the PL
  }
}

function ytCueSong(resourceid) {
  player.cueVideoById({'videoId': resourceid});
}

function ytLoadSong(resourceid) {
  player.loadVideoById({'videoId' : resourceid}); 
}

function ytCuePlaylist(plist){
	player.cuePlaylist({'playlist' : plist}); 
}

