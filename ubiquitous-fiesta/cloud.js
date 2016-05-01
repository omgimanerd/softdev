

//creates svg
var dem = ["CLINTON", "SANDERS", "OMALLEY"]
var cloudH = 400; //height of svg window
var cloudW = 600; //width of svg window
var svg = d3.select("body").append("svg")
    .attr("id","cloud") //for future styling
    .attr("width", cloudW) //idk what a good size is
    .attr("height",cloudH)
    .style("width", cloudW)
    .style("height", cloudH);


/*
  returns an [X,Y] pair containing
  possible locations for a word
  takes size(int) of word for placement purposes

  it's supposed to make sure words don't get cut off,
  if that does happen say something
 */
var ranXY = function(size){
    var y = Math.floor(Math.random() * (cloudH - 30)) + 15; //ran y within svg
    var x = Math.floor(Math.random() * (cloudW - size)); //ran x within svg

    //returns x,y integer pair
    return [x,y];
}

var linearScale = function(x, a1, a2, b1, b2) {
    return ((x - a1) * (b2 - b1) / (a2 - a1)) + b1;
};



var getWordsByCand = function(name,numWords){
    if (dem.indexOf(name) != -1){
        color = "#162856";
    }
    else{
        color = "#550000";
    }
    var newD = [];
    var data = wordFrequencies[name];
    if (numWords > data.length){
	numWords = data.length;
    }

    for(var i=0;i< numWords;i++){
	var freq = data[i][1];
  var size = linearScale(freq, 25, 350, 10, cloudW / 3);
	var coords = ranXY(size);
	newD.push({
	    "word":data[i][0],
	    "x":coords[0],
	    "y":coords[1],
	    "size":size + "px",
	    "opacity":linearScale(freq, 25, 350, 0.4, 1),
      "color":color,
	});
    }
    return newD;
};


/*
  adds text to svg box
  dataset should contain the following
   [ {"word":WORD(string),"x":X-COORDINATE(int),"y":Y-COORDINATE(int),
     "size":SIZE(px),opacity:OPACITY(0-1)}, ... ]
*/
var writeWords = function(dataset){
    //creates text tags
    var words = svg.selectAll("text")
	.data(dataset)
	.enter()
	.append("text");

    //styles
    words.attr("class", "word") //for future styling
	.attr("font-size", function(d) { return d.size; })
	      .attr("fill", function(d){ return d.color }) //just for now
	.attr("fill-opacity", function(d) { return d.opacity })
	.attr("x", function(d) { return d.x; })
	      .attr("y", function(d) { return d.y; })
	.text(function(d) { return d.word; });
}


//example dataset for testing purposes
var words = [
    {"word":"row","x":0,"y":50, size:"40px", opacity:"0.4"},
    {"word":"your","x":100,"y":25, size:"50px", opacity: "1"},
    {"word":"boat","x":200,"y":56, size:"10px", opacity:"0.8"}
]

var main = function(name){
    $("svg").empty();
    console.log(name);
    writeWords(getWordsByCand(name,15));

}
