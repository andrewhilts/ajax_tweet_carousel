function TweetCarousel(params){
  EventTarget.call(this);
  this.newTweets = [];
  this.oldTweets = [];
  this.addTweets = [];
  this.newTweetIDs = [];

  this.defaults = {
    tempo                 : 60000,
    quantity              : 8,
    queryType             : "search",
    queryString           : "%23twitter",
    controlRetweet        : true,
    controlReply          : true,
    controlFavorite       : true,
    profileImgSize        : 'normal',
    autoStart             : true,
    displayRequestStatus  : false
  };
  for(i in this.defaults){
    if(typeof params[i] !== "undefined"){
      this[i] = params[i];
    }
    else{
      this[i] = this.defaults[i];
    }
  }
  this.timeLeft = this.tempo;
  this.tempo = this.tempo*1000;

  this.container = $("#"+params.container);
  this.skin = this.container[0].className;

  if(this.queryType == "search"){
    this.url = "http://search.twitter.com/search.json?q="+this.queryString+"&rpp="+this.quantity;
  }
  else{
    this.url = "http://twitter.com/status/user_timeline/"+this.queryString+".json?count="+this.quantity;
  }
  this.addStatusElem(params);
  this.addListener("update",function(){
    this.paintNewTweets();
  })
  if(this.autoStart){
    this.query();
  }
}

//Inherit event model from eventtarget.js
TweetCarousel.prototype = new EventTarget();

TweetCarousel.prototype.update = function (){
  this.timeLeft--;
  if(this.timeLeft==0){
    this.timeLeft = this.tempo/1000;
    this.query();
  }
  if(this.displayRequestStatus === true){
    this.statusElement.children('span').get(1).innerHTML = "New tweets in "+this.timeLeft;
  }
}

TweetCarousel.prototype.query = function() {
  $.ajax({
    crossDomain:true,
    url: this.url,
    type: 'GET',
    dataType: 'jsonp',
    timeout: 3000,
    error: function(jqXHR, textStatus, errorThrown){
      if(errorThrown == "timeout" && this.displayRequestStatus !== false){
        this.statusElement.children('span').get(0).innerHTML = "No response from server. ";
        this.statusElement.children('span').get(1).innerHTML = "";
      }
    }.bind(this),
    success:  function(json){
      if(this.displayRequestStatus && this.statusElement !=="undefined"){
      this.statusElement.children('span').get(0).innerHTML = "";
      }
      this.oldTweets = this.newTweets;
      this.newTweets = [];
      this.newTweetIDs = [];
      this.saveTweets(json,this.queryType);
      this.compareTweetQueries();
      if (!this.initialized){
        this.displayInit();
        this.container.everyTime(1000, function(i) {
          this.update();
        }.bind(this));
      }
      else{
        //while we have new tweets, we haven't started updating the carousel
        this.carouselUpdateStarted = false;

        //Fire update event
        this.fire("update");
      }
      //$('.jcarousel-prev').click();
    }.bind(this)
  });
  this.update();
}

TweetCarousel.prototype.saveTweets = function(json, queryType){
  switch(queryType){
    case "search":
      json_results = json.results;
      break;
    case "user":
      json_results = json;
      break;
  }
  $.each(json_results,function(i,item) {
    switch(queryType){
      case "search":
        user = {
          name: item.from_user,
          profile_image_url: item.profile_image_url
        };
        break;
      case "user":
        user = {
          name: item.user.name,
          profile_image_url: item.user.profile_image_url
        };
        break;
    }
    switch(this.profileImgSize){
      case "mini":
        user.profile_image_url = user.profile_image_url.replace("_normal","_mini");
        break;
      case "bigger":
        user.profile_image_url = user.profile_image_url.replace("_normal","_bigger");
        break;
    }
    tweetData = {
      id: item.id,
      id_str: item.id_str,
      text: item.text,
      created_at: item.created_at,
      user: user
    }
    tweet = [item.id, tweetData];
    this.newTweets.push(tweet);
  }.bind(this));
}

TweetCarousel.prototype.compareTweetQueries = function() {
  seen = [], diff = [], newTweets = [], oldTweets = [];
  $.each(this.newTweets,function(i,item){
    newTweets.push(item[0]);
    diff.push(item[1]);
  });
  // $.each(this.oldTweets,function(i,item){
  //   oldTweets.push(item[0]);
  // });
  // return true;
  // for (var i = 0; i < oldTweets.length; i++)
  //     seen[oldTweets[i]] = true;
  // for (var i = 0; i < newTweets.length; i++)
  //     if (!seen[newTweets[i]])
  //         diff.push(this.newTweets[i][1]);
  this.addTweets = diff.reverse();
  //this.addTweets = diff;
};

TweetCarousel.prototype.updateTweetTimes = function(){
  real_times = this.container.find('span.real_time');
  for(i in real_times){
    if(!isNaN(i)){
      new_time = real_times[i].innerHTML;
      old_time = $(real_times[i]).parent().children('span.date');
      $(old_time[0]).html(this.timeAgo(new_time));
    }
  }
}

TweetCarousel.prototype.addStatusElem = function(params){
  this.displayRequestStatus = params.displayRequestStatus;
  if(this.displayRequestStatus){
    this.statusElementId = params.container+"_status";
    statusElement = "<div id=\""+this.statusElementId+"\" class=\"tweet_status\"><span>Loading...</span><span>New tweets in </span></div>";
    this.container.after(statusElement);
    this.statusElement = $("#"+this.statusElementId);
  }
}

TweetCarousel.prototype.displayInit = function(){
  $.each(this.addTweets,function(i,item){
    tweet_time = this.timeAgo(item.created_at);
    tweet = this.tweetFormat(item);
    this.container.prepend("<li></li>");
    e = this.container.children()[0];
    this.paintTweet(tweet,e);
  }.bind(this));
  this.addTweets = [];
  this.initialized = true;
  this.fire("displayInit");
}

TweetCarousel.prototype.timeAgo = function(dateString) {
  var browser = function() {
        var ua = navigator.userAgent;
        return {
          ie: ua.match(/MSIE\s([^;]*)/)
        };
      }();
  var rightNow = new Date();
  var then = new Date(dateString);
  if (browser.ie) {
    // IE can't parse these crazy Ruby dates
    then = Date.parse(dateString.replace(/( \+)/, ' UTC$1'));
  }

  var diff = rightNow - then;
  var second = 1000,
      minute = second * 60,
      hour = minute * 60,
      day = hour * 24,
      week = day * 7;

  if (isNaN(diff)) {
    return ""; // return blank string if unknown
  }
  if (diff < second * 2 || diff < 0) {
    // within 2 seconds
    return "right now";
  }
  if (diff < minute) {
    return Math.floor(diff / second) + " seconds ago";
  }
  if (diff < minute * 2) {
    return "about 1 minute ago";
  }
  if (diff < hour) {
    return Math.floor(diff / minute) + " minutes ago";
  }
  if (diff < hour * 2) {
    return "about 1 hour ago";
  }
  if (diff < day) {
    return  Math.floor(diff / hour) + " hours ago";
  }
  if (diff > day && diff < day * 2) {
    return "yesterday";
  }
  if (diff < day * 365) {
    return Math.floor(diff / day) + " days ago";
  }
  else {
    return "over a year ago";
  }
};

TweetCarousel.prototype.tweetFormat = function(item){
  tweet = '<a href="http://www.twitter.com/'+item.user.name+'" title="'+item.user.name+'&rsquo;s Twitter page">';
  tweet += '<img src="'+item.user.profile_image_url+'" alt="'+item.user.name+'&rsquo;s profile picture"/></a>'
  if(this.controlRetweet === true || this.controlReply === true || this.controlFavorite === true){
      tweet += '<div class="tweetControls">';

      if(this.controlReply === true){tweet += '<a href="http://twitter.com/intent/tweet?in_reply_to='+item.id_str+'" class="tweetControl reply" title="Reply"><i></i></a>';}
      if(this.controlRetweet === true){tweet += '<a href="http://twitter.com/intent/retweet?tweet_id='+item.id_str+'" class="tweetControl retweet" title="Retweet"><i></i></a>';}
      if(this.controlFavorite === true){tweet += '<a href="http://twitter.com/intent/favorite?tweet_id='+item.id_str+'" class="tweetControl favorite" title="Favourite"><i></i></a>';}

      tweet += '</div>';
  }
  tweet += '<span class="name"><a href="http://www.twitter.com/'+item.user.name+'" title="'+item.user.name+'&rsquo;s Twitter page">'+item.user.name+'</a></span>';
  tweet += '<span class="date">'+tweet_time+'</span>';
  tweet += '<p>'+this.textFormat(item.text)+'</p>';
  tweet += '<span class="real_time">'+item.created_at+'</span>';
  return tweet;
};

TweetCarousel.prototype.textFormat = function(texto){
  //This from Juitter
  //make links
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  texto = texto.replace(exp,"<a href='$1' class='extLink'>$1</a>");
  var exp = /[\@]+([A-Za-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF0-9-_]+)/ig;
  uri = encodeURIComponent(texto.match(exp));
  uri = uri.substring(3);
  texto = texto.replace(exp,"<a href='http://twitter.com/"+uri+"' class='profileLink'>@$1</a>");
  var exp = /[\#]+([A-Za-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF0-9-_]+)/ig;
  uri = encodeURIComponent(texto.match(exp));
  uri = uri.substring(3);
  texto = texto.replace(exp,"<a href='http://twitter.com/search?q=%23"+uri+"' class='hashLink'>#$1</a>");
  // make it bold
  return texto;
};

TweetCarousel.prototype.paintTweet = function(tweet,e){
  $(e).html(tweet);
}

TweetCarousel.prototype.paintNewTweets = function(){
  if(this.addTweets.length > 0){
    this.container.children('li').each(function(i,e){
      tweet = this.tweetFormat(this.addTweets[i]);
      this.paintTweet(tweet,e);
    }.bind(this));
  }
}

TweetCarousel.prototype.removeDefaultUpdateMethod = function(){
  this.removeListener("update",this.paintNewTweets);
}

TweetCarousel.prototype.carouselUpdate = function(carousel, li_object, index, state){
  window.console.log(this.addTweets.length + "new tweets remain");
  if(this.addTweets.length > 0){
      properIndex = carousel.index(index);
      if(properIndex === 1){
        //now the update can begin, at the first carousel item (replace with latest tweet)
        this.carouselUpdateStarted = true;
      }
      if(this.carouselUpdateStarted){
        item = this.addTweets[0];
        tweet_time = this.timeAgo(item.created_at);
        tweet = this.tweetFormat(item);
        //add newest tweet to carousel
        carousel.add(properIndex,tweet);
        //remove newest tweet from array
        this.addTweets.splice(0,1);
      }
  }
  else{
    this.carouselUpdateStarted = false;
  }
}