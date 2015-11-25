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
  //I'll deal with this later.
  //event.target.playVideo();
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