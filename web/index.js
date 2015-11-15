// Our custom code goes here.
var baseurl = "localhost:5000"

function test(){
    return("true");
}

function testAjax(){
    $.ajax({
        url: baseurl + "/mysql/counts",
        context: document.body
    });
}