tweetRetriever = {
newTweets: [],
query: function () {
  $.ajax({
    url: "http://twitter.com/status/user_timeline/InternetRadio.json?count="+this.quantity+"&rpp=5",
    type: 'GET',
	  dataType: 'jsonp',
	  timeout: 1000,
    success:  function(json){
      $.each(json,function(i,item) {
        tweetRetriever.newTweets[i] = item;
      });
      tweetRetriever.display();
    }
  });
  this.update();    
},
update: function () {
  setTimeout("tweetRetriever.query()",this.tempo);
},
init: function (rate,quantity) {
  this.tempo = rate*1000;
  this.quantity = quantity;
  this.query();
},
display: function () {
  $.each(this.newTweets,function(i,item){
    $('#'+i).html(item.text);
  });
}
};