// Our custom code goes here.
// Developing Locally?  Swap the comments here and start the python server.
var baseurl = "http://tunes.redspin.net"
//var baseurl = "http://localhost:5000"

function updateSearch(){
    var terms = $("#search").val();
    var callback = function(values){
        //this is the callback for the AJAX - let's update search
        values = JSON.parse(values);
        //console.log(values);
        var collection = $("#search-results");
        collection.empty();
        for(i=0;i< values.search_result.length;i++){
            //console.log(values.search_result[i])
            var newli = $("<li class='collection-item'>"+ values.search_result[i].result + " " + values.search_result[i].result2 + "</li>");
            collection.append(newli);
        }
    }
    ajax("/api/search/" + terms, callback);
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
}

$(document).ready(function() {
    // Page is ready.  run this code.
    initialize();
    console.log("js ready");
});