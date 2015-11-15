// Our custom code goes here.
// Developing Locally?  Swap the comments here and start the python server.
var baseurl = "http://api.tunes.redspin.net"
//var baseurl = "http://localhost:5000"

function test(){
    return("true");
}

function testAjax () { 
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
     console.log("workd" + xhttp.responseText);
    }
  };
  xhttp.open("GET", baseurl + "/mysql/counts", true);
  xhttp.send();
}