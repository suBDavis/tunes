// Our custom code goes here.
// Developing Locally?  Swap the comments here and start the python server.
var baseurl = "http://tunes.redspin.net"
//var baseurl = "http://localhost:5000"

function addSearchResult(origin, string, cssclass){
  // var newres = $("<a class='result'></a>");
  // newres = "<a class='result'></a>";
  // var newcontent = $("<div class='content'></div>");
  // newcontent = "<div class='content'></div>";
  // var newtitle = $("<div class='title'>"+string+"</div>")
  // newtitle = "<div class='title'>"+string+"</div>";
  var newli = $("<li class='collection-item "+cssclass+"'>"+ string + "</li>");
  $("#search-results").append(newli);
  //newres.append(newcontent);
  //newcontent.append(newtitle);
  
  console.log(string);
}

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
        //the terms didnt change.
        collection.empty();
        //var collection = $("#search-results");
        values = JSON.parse(values);
        for(i=0;i< values.search_result.length;i++){
            console.log(values.search_result[i])
            //var newli = $("<li class='collection-item db'>"+ values.search_result[i].result + " " + values.search_result[i].result2 + "</li>");
            addSearchResult(collection,values.search_result[i].result + " " + values.search_result[i].result2, "db");
            //collection.prepend(newli);
            if (i >=5){break;}
        }
        for(i=0;i< res.length;i++){
            //console.log(values.search_result[i])
            //var newli = $("<li class='collection-item sc'>"+ res[i].title + " " + res[i].permalink + "</li>");
            //collection.append(newli);
            addSearchResult(collection, res[i].title + " " + res[i].permalink, "sc");
            if (i >=5){break;}
        }
      }
    }
    if (terms==$("#search").val()){
      SC.get('/tracks', {
        q: terms, license: 'cc-by-sa'
      }).then(function(tracks){
        callbacksc(tracks);
        console.log(tracks);
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