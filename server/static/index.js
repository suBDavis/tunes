"use strict"
// Our custom code goes here.
// Developing Locally?  Swap the comments here and start the python server.
var baseurl = "http://tunes.redspin.net"
// var baseurl = "http://localhost:5000"

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
      window.searchr.addItem(res.search_result[i], "db");
    }
    window.searchr.updateDisplay();
  });
  //search soundcloud now.
  searchSC(artist + " " + title , function(tracks){
    for(var i=0;i< tracks.length;i++){
      window.searchr.addItem(tracks[i] , "sc")
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
      window.searchr.addItem(ytres.items[i], "yt");
    }
    window.searchr.updateYT();
  });
}

function searchSC(terms, callbacksc){
  SC.get('/tracks', {
    q: terms, license: 'cc-by-sa'
  }).then(function(tracks){
    callbacksc(tracks);
  });
}

function ajax(url, callback) { 
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
     //console.log("workd" + xhttp.responseText);
     var rtext = JSON.parse(xhttp.responseText);
     if(rtext['error']){
      ajax("/api/mysql" , function(){
        ajax(url, callback);
      });
     } else {
      callback(xhttp.responseText);
     }
    }
  };
  xhttp.open("GET", baseurl + url, true);
  xhttp.send();
}

function onAdd(e){

}

function initialize(){
    window.top_searchbar = new searchbar("search-ajax");
    window.searchr = new results("search-results-table"); 
    //register listener for search box.
    $("#search").on('input', function(){ updateSearch(); });
    $("#search-ajax").on('click', function(e){ generateResults(e); });
    //Let's create a soundcloud API connection
    SC.initialize({
      client_id : "463bb2a042fa56ed7e95c35b7bf4d615"
    });
}

$(document).ready(function() {
    // Page is ready.  run this code.
    initialize();
    console.log("js ready");
});

/* ----------------------------
Brandon is writing code here.  Avoid merge conflicts: make your own header section.
------------------------------*/
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
  this.finished = 0;

  this.addItem = function(dict_item, type){
    if (type == "sc"){
      this.sclist.push(dict_item);
      this.sr[dict_item['id']] = dict_item;
    }else if (type=="yt"){
      this.ytlist.push(dict_item);
      this.sr[dict_item['id'].videoId] = dict_item;
    }else {
      this.list.push(dict_item);
      this.sr[dict_item.guid] = dict_item;
    }
  }
  this.updateDisplay = function(){
    var l = this.list;
    this.list = [];
    this.div.empty();
    console.log(l);
    //console.log(this.list);
    for(var i=0;i<l.length;i++){
      var a = l[i];
      var newnode = "<tr id='"+a.guid+"'><td class='a'>" + a.artist.substring(0 , this.maxchars) + "</td><td class='b'>" + a.title.substring(0 , this.maxchars) + "</td><td class='c'>"+this.bnode+"</td></tr>";
      this.div.append(newnode);
    }
    this.show();
    this.finished++;
    this.registerEvents();
  }
  this.updateSC = function(){
    var l = this.sclist;
    console.log(l);
    this.sclist = [];
    this.scdiv.empty();
    for(var i=0;i<l.length;i++){
      var a = l[i];
      var newnode = "<tr id='"+a.id+"'><td class='a'>" + a.genre.substring(0 , this.maxchars) +"</td><td class='b'>" + a['title'].substring(0 , this.maxchars) +  "</td><td class='c'>"+this.bnode+"</td></tr>";
      this.scdiv.append(newnode);
    }
    this.show();
    this.finished++;
    this.registerEvents();
  }
  this.updateYT = function(){
    var l = this.ytlist;
    console.log(l);
    this.ytlist = [];
    this.ytdiv.empty();
    for(var i=0;i<l.length;i++){
      var a = l[i];
      var newnode = "<tr id='"+a['id'].videoId+"'><td class='a'>" + a.snippet.channelTitle.substring(0 , this.maxchars) + "</td><td class='b'>" + a.snippet.title.substring(0 , this.maxchars) + "</td><td class='c'>"+this.bnode+"</td></tr>";
      this.ytdiv.append(newnode);
    }
    this.show();
    this.finished++;
    this.registerEvents();
  }
  this.registerEvents = function(){
    if (this.finished == 3){
      $("#search-results a").on('click',function(e){console.log(e);});
    }
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
//escape key should close the search bar
//clicking outside search should close search bar