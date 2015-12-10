"use strict"

// Developing Locally?  Swap the comments here and start the python server.
// var baseurl = "http://tunes.redspin.net"
var baseurl = "http://localhost:5000"
// this is set from initialize() where we instantiate the playlist.js playlist object
var pl_manager = new playlist();

//---------------------------------------
//here's the entry point for the JS file
//---------------------------------------
$(document).ready(function() {
    // Page is ready.  run this code.
    //this is the entry point for our javascript
    initialize();
    console.log("js ready");
});
function initialize(){
    window.top_searchbar = new searchbar("search-ajax");
    window.searchr = new results("search-results-table"); 
    //pl_manager was already initialized
   
    //register listener for search box.
    $("#search").on('input', function(){ updateSearch(); });
    $("#search-ajax").on('click', function(e){ generateResults(e); });
   
    //Let's create a soundcloud API connection
    SC.initialize({
      client_id : "463bb2a042fa56ed7e95c35b7bf4d615"
    });

    uniplayer = new uniPlayer();
    uniplayer.init();
}
//-------------------------------------------
// Song object that is ambuguous to source 
//-------------------------------------------
function song(songtype, songid, resourceid, artist, songtitle){
  this.songtype = songtype;
  this.songid = songid;
  this.resourceid = resourceid; //either the youtube id or the souncloud resource id.
  this.artist = artist;
  this.songtitle = songtitle;
  this.sc_url; //this param is only for soundcloud because soundcloud API is very poorly designed and I can't get this with an ID
}

//-------------------------------------------
// This is what happens when someone click's the + button next to a search result.
//-------------------------------------------
function onAdd(song_meta){
  //this is a song object (from above) - it has all the properties listed
  //it might not have a songid.  If it doesn't, this means the song is not in our database yet (it came from yt or sc)
  //basically the  youtube and soundcloud players will need to have access to a universal playlist (pl_manager currently)
  //that playlist will have a collection of songs that have the same attributes no matter where we got them from.
  console.log(song_meta);//here's whats inside.
  pl_manager.append(song_meta);
}
//------------------------------------------
// Ajax DELETE
//------------------------------------------
function ajax_delete(url, deleteinfo, callback) { 
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
     //console.log("workd" + xhttp.responseText);
     var rtext = JSON.parse(xhttp.responseText);
     if(rtext['error']){
      console.log("AJAX returned server error.")
     } else {
      callback(xhttp.responseText);
     }
    }
  };
  xhttp.open("DELETE", baseurl + url, true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(deleteinfo);
}
//------------------------------------------
// Ajax POST
//------------------------------------------
function ajax_post(url, postinfo, callback) { 
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
     //console.log("workd" + xhttp.responseText);
     var rtext = JSON.parse(xhttp.responseText);
     if(rtext['error']){
      console.log("AJAX returned server error.")
     } else {
      callback(xhttp.responseText);
     }
    }
  };
  xhttp.open("POST", baseurl + url, true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(postinfo);
}
//------------------------------------------
// Ajax GET
//------------------------------------------
function ajax(url, callback) { 
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
     //console.log("workd" + xhttp.responseText);
     var rtext = JSON.parse(xhttp.responseText);
     if(rtext['error']){
      console.log("AJAX returned server error.")
     } else {
      callback(xhttp.responseText);
     }
    }
  };
  xhttp.open("GET", baseurl + url, true);
  xhttp.send();
}

//========================================
// WARNING: Spaghetti code below this line!
//========================================

function updateSearch(){
  //empty the list
  var collection = $("#search-ajax");
  //get the search terms from the page
  var terms = $("#search").val();
  //create callback function we can pass to our page updaters
  var callbackdb = function(values){
    var callbacksc = function(res){
      //this is the callback for the AJAX - let's update search
      //console.log(res);
      if(terms==$("#search").val()){
        //var s = new searchbar("search-ajax");
        //the terms didnt change.
        collection.empty();

        values = JSON.parse(values);
        for(var i=0;i< values.search_result.length;i++){
          window.top_searchbar.addItem(values.search_result[i].artist , values.search_result[i]['title'] , "db", values.search_result[i].guid)
          if (i >=8){break;}
        }
        window.top_searchbar.addItem("" , "Search SoundCloud" , "sc", "sc");
        window.top_searchbar.addItem("" , "Search Youtube", "yt", "yt");
        window.top_searchbar.cl();
      }
    }
    if (terms==$("#search").val()){
      callbacksc({});
    }
  }
  if(terms == ""){
    //hide search bar, it's blank.
    collection.hide();
  } else {
    collection.show();
    ajax("/api/search/" + terms, callbackdb);
  }
}

function generateResults(e){
  window.top_searchbar.hide();
  //set search to the thing.
  var divid = e.target.id;
  var target = window.top_searchbar.find(divid);
  var artist;
  var title;
  var searchterms = $("#search").val();
  if (divid =="sc"){
    artist = searchterms;
    title = ""
    console.log("sc");
  } else if(divid == 'yt'){
    artist = searchterms;
    title = ""
  } else {
    artist = target.artist == "" ? "%25" : target.artist;
    title = target['title'] == "" ? "%25" : target['title']
    window.top_searchbar.set(e.target.innerHTML);
    searchterms = e.target.innerHTML;
  }
  //ajax query for those terms
  ajax("/api/search/artist/" + artist + "/title/" + title, function(res){
    //callback for when the ajax completes
    res = JSON.parse(res);
    //var rnode = new results("search-results-table");
    for(var i=0;i<res.search_result.length;i++){
      var sdata = res.search_result[i];
      //create ubiquitous song object.
      var result_song = new song(sdata.type, sdata.guid, sdata.resource_id, sdata.artist, sdata.title);
      window.searchr.addItem(result_song, "db");
    }
    window.searchr.updateDisplay();
  });
  //search soundcloud now.
  searchSC(artist + " " + title , function(tracks){
    for(var i=0;i< tracks.length;i++){
      var sdata = tracks[i];
      //create an actual song object and stop being a bad programer
      var result_song = new song("soundcloud" , null , sdata.id, sdata.genre, sdata.title);
      //add the permalink url
      result_song.sc_url = sdata.permalink_url;
      window.searchr.addItem(result_song , "sc");
      if (i >=10){break;}
    }
    window.searchr.updateSC();
  });
  //now look on youtube.
  ajax("/api/ytsearch/video/" + artist + " " + title, function(ytres){
    //callback for when the ajax completes
    ytres = JSON.parse(ytres);
    //var rnode = new results("search-results-table");
    for(var i=0;i<ytres.items.length;i++){
      var sdata = ytres.items[i];
      //create an actual song object and stop being a bad programer
      var result_song = new song("youtube" , null , sdata.id.videoId, sdata.snippet.channelTitle, sdata.snippet.title);
      window.searchr.addItem(result_song, "yt");
    }
    window.searchr.updateYT();
  });
}

function searchSC(terms, callbacksc){
  SC.get('/tracks', {
    q: terms
  }).then(function(tracks){
    callbacksc(tracks);
  });
}

function searchbar(tagid){
  this.search_id = $("#" + tagid);
  this.list = [];
  this.last = [];

  this.addItem = function(artist, title, classtype, divid){
    //0 - text,
    //1 - class
    //2 - id
    this.list.push({"artist": artist,"title" :title, "classtype":classtype, "divid":divid});
  }
  this.cl = function(){
    this.updateDisplay();
    this.last = this.list;
    this.list = [];
  }
  this.updateDisplay = function(){
    this.search_id.empty();
    for(var i = 0; i<this.list.length; i++){
      var newli = $("<a href='#" +this.list[i]["classtype"]+ "' id="+this.list[i]["divid"]+" class='collection-item "+this.list[i]["classtype"]+"'>"+ this.list[i]["artist"] + " " + this.list[i]['title'] + "</a>");
      this.search_id.append(newli);
    }
  }
  this.show = function(){
    this.search_id.show();
    
  }
  this.hide = function(){
    this.search_id.hide();
  }
  this.set = function(valu){
    $("#search").val(valu);
  }
  this.find = function(divid){
    for(var i=0;i<this.last.length;i++){
      if (this.last[i]['divid'] == divid){
        return this.last[i];
      }
    }
  }
}
//escape key should close the search bar
//clicking outside search should close search bar
//I haven't done that yet.

function results(tagid){
  this.div = $("#search-results-table");
  this.tagid = tagid;
  this.list = [];
  this.sclist = [];
  this.scdiv = $("#sc-results-table")
  this.ytlist = [];
  this.ytdiv = $("#yt-results-table")
  this.maxchars = 60;
  this.bnode = "<a class='btn-floating waves-effect waves-light blue-grey darken-1 b-small'><i class='material-icons'>+</i></a>";
  this.sr = {};

  this.addItem = function(dict_item, type){
    //console.log(dict_item);
    if (type == "sc"){
      this.sclist.push(dict_item);
      this.sr[dict_item.resourceid] = dict_item;
    }else if (type=="yt"){
      this.ytlist.push(dict_item);
      this.sr[dict_item.resourceid] = dict_item;
    }else {
      this.list.push(dict_item);
      this.sr[dict_item.resourceid] = dict_item;
    }
  }
  this.updateUI = function(){
    for(var i = 0; i< keys(this.sr); i++){
      song_obj = this.sr[i];
      if(!song_obj.wasChecked){
        //finish this later
      }
    }
  }
  this.updateDisplay = function(){
    var l = this.list;
    this.list = [];
    this.div.empty();
    //console.log(l);
    //console.log(this.list);
    for(var i=0;i<l.length;i++){
      var a = l[i];
      var newnode = "<tr id='"+a.resourceid+"'><td class='a'>" + a.artist.substring(0 , this.maxchars) + "</td><td class='b'>" + a.songtitle.substring(0 , this.maxchars) + "</td><td class='c'>"+this.bnode+"</td></tr>";
      this.div.append(newnode);
    }
    this.show();
    $("#search-results-table a").on('click',function(e){
      window.searchr.clickEvent(e);
    });
  }
  this.updateSC = function(){
    var l = this.sclist;
    //console.log(l);
    this.sclist = [];
    this.scdiv.empty();
    for(var i=0;i<l.length;i++){
      var a = l[i];
      var newnode = "<tr id='"+a.resourceid+"'><td class='a'>" + a.artist.substring(0 , this.maxchars) +"</td><td class='b'>" + a['songtitle'].substring(0 , this.maxchars) +  "</td><td class='c'>"+this.bnode+"</td></tr>";
      this.scdiv.append(newnode);
    }
    this.show();
    $("#sc-results-table a").on('click',function(e){
      window.searchr.clickEvent(e);
    });
  }
  this.updateYT = function(){
    var l = this.ytlist;
    //console.log(l);
    this.ytlist = [];
    this.ytdiv.empty();
    for(var i=0;i<l.length;i++){
      var a = l[i];
      var newnode = "<tr id='"+a.resourceid+"'><td class='a'>" + a.artist.substring(0 , this.maxchars) + "</td><td class='b'>" + a.songtitle.substring(0 , this.maxchars) + "</td><td class='c'>"+this.bnode+"</td></tr>";
      this.ytdiv.append(newnode);
    }
    this.show();
    $("#yt-results-table a").on('click',function(e){
      window.searchr.clickEvent(e);
    });
  }
  this.clickEvent = function(e){
    var i = $(e.target).closest("tr").attr("id");
    var clicked = window.searchr.sr[i];
    onAdd(clicked);
    // console.log(clicked);
    //this is sample code I'm messing with.  Right now it will only work for the youtube section.
    // pl_manager.append(clicked.id.videoId);
  }
  this.hide = function(){
    this.div.hide();
    $("#search-results").hide();
  }
  this.show = function(){
    $("#search-results").show();
    this.scdiv.show();
    this.ytdiv.show();
    this.div.show();
  }
}
