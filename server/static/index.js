// Our custom code goes here.
// Developing Locally?  Swap the comments here and start the python server.
var baseurl = "http://tunes.redspin.net"
//var baseurl = "http://localhost:5000"
var top_searchbar = new searchbar("search-results");

function updateSearch(){
  //empty the list
  var collection = $("#search-results");
  //get the search terms from the page
  var terms = $("#search").val();
  if(terms == ""){
    //hide search bar, it's blank.
    collection.hide();
  } else if (terms.length ==1){
    //added a letter, show it again
    collection.show();
  }
  //create callback function we can pass to our page updaters
  var callbackdb = function(values){
    var callbacksc = function(res){
      //this is the callback for the AJAX - let's update search
      //console.log(res);
      if(terms==$("#search").val()){
        var s = new searchbar("search-results");
        //the terms didnt change.
        collection.empty();

        values = JSON.parse(values);
        for(i=0;i< values.search_result.length;i++){
          s.addItem(values.search_result[i].result + " " + values.search_result[i].result2 , "db")
          if (i >=5){break;}
        }
        for(i=0;i< res.length;i++){
          s.addItem(res[i].title , "sc")
          if (i >=5){break;}
        }
        s.updateDisplay();
      }
    }
    if (terms==$("#search").val()){
      SC.get('/tracks', {
        q: terms, license: 'cc-by-sa'
      }).then(function(tracks){
        callbacksc(tracks);
      });
    }
  }
  ajax("/api/search/" + terms, callbackdb);
}

function ajax(url, callback) { 
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
     //console.log("workd" + xhttp.responseText);
     callback(xhttp.responseText);
    }
  };
  xhttp.open("GET", baseurl + url, true);
  xhttp.send();
}

function initialize(){
    //register listener for search box.
    $("#search").on('input', function(){ updateSearch(); });
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

  this.addItem = function(item, classtype){
    this.list.push([item, classtype]);
  }
  this.cl = function(){
    this.list = [];
    this.updateDisplay();
  }
  this.updateDisplay = function(){
    this.search_id.empty();
    for(i = 0; i<this.list.length; i++){
      var newli = $("<li class='collection-item "+this.list[i][1]+"'>"+ this.list[i][0] + "</li>");
      this.search_id.append(newli);
    }
  }
  this.show = function(){
    this.search_id.show();
  }
  this.hide = function(){
    this.search_id.hide();
  }
}