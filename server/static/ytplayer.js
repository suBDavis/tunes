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
  //tell the universal player that the youtube player is ready.
  uniplayer.alertYoutubeReady();
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
    //tell the uniplayer that a song has ended and it should take action
    uniplayer.songEnded();
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
function initializeSCPlayer(){
  return SC.Widget("scplayer");
}

// ====================================
// ======== Universal Player ==========
// ====================================
var uniplayer;

function uniPlayer(){
  this.currentSong = null;
  this.youtube = null;
  this.soundcloud = null;

  //youtube specific variables
  this.youtubeReady = false;
  this.soundcloudReady = false;

  this.init = function(){
    this.soundcloud = initializeSCPlayer();
    this.soundcloudReady = true;
    this.soundcloud.bind(SC.Widget.Events.FINISH, this.songEnded);
  }
  
  this.play = function(){
    if (this.currentSong.songtype == 'youtube'){
      this.youtube.playVideo();
    } else {
      this.soundcloud.play();
    }
  }

  this.loadSong = function(){
    if (this.youtubeReady && this.soundcloudReady){
      //play whatever's in the queue
      this.currentSong = pl_manager.getNext();
      if (this.currentSong.songtype == 'youtube'){
        //youtube song 
        ytLoadSong(this.currentSong.resourceid);
      } else {
        this.scLoadSong(this.currentSong.resourceid);
      }
    }
  }

  this.pause = function(){
    if (this.currentSong.songtype == 'youtube'){
      this.youtube.pauseVideo();
    } else {
      this.soundcloud.pause();
    }
  }

  this.songEnded = function(){
    uniplayer.loadSong();
  }

  this.skip = function(){
    this.pause();
    this.loadSong();
  }

  //youtube functions
  this.alertYoutubeReady = function(){
    this.youtubeReady = true;
    this.youtube = ytplayer;
  }

  //soundcloud functions
  this.scLoadSong = function(id){
    url = "http://api.soundcloud.com/tracks/" + id
    options = {"show_artwork" : false, "auto_play" : true };
    this.soundcloud.load(url, options);
  }

}