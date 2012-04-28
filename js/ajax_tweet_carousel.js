function TweetCarousel(params,jcarouselParams){
  EventTarget.call(this);
  this.newTweets = [];
  this.oldTweets = [];
  this.addTweets = [];
  this.newTweetIDs = [];
  this.tempo = params.tempo*1000;
  this.timeLeft = params.tempo;
  this.quantity = params.tweets;
  this.queryString = params.queryString;
  this.container = $("#"+params.container);
  this.skin = this.container[0].className;
  this.controlRetweet = params.controlRetweet;
  this.controlReply = params.controlReply;
  this.controlFavorite = params.controlFavorite;
  this.queryType = params.queryType;
  if(params.queryType == "search"){
    this.url = "http://search.twitter.com/search.json?q="+this.queryString+"&rpp="+this.quantity;
  }
  else{
    this.url = "http://twitter.com/status/user_timeline/"+this.queryString+".json?count="+this.quantity;
  }
  this.stylize(params);
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

TweetCarousel.prototype.stylize = function(params,jcarouselParams){
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
    this.container.prepend(tweet);
  }.bind(this));
  this.addTweets = [];
  this.initialized = true;
  if(typeof this.jcarouselParams !== "undefined"){
    this.animationTime = this.jcarouselParams.animation/2;
    this.jcarouselParams.initCallback = this.carouselInit.bind(this);
    this.jcarouselParams.itemLoadCallback = this.carouselDisplay.bind(this);
    this.jcarouselParams.itemFirstOutCallback = {
        onBeforeAnimation: this.carouselBefore.bind(this)
      };
    this.jcarouselParams.itemLastInCallback = {
          onBeforeAnimation: this.carouselAfter.bind(this)
    };
    this.carouselItemFadeIn = this.jcarouselParams.itemFadeIn;
    delete this.jcarouselParams.itemFadeIn;
    this.container.jcarousel(this.jcarouselParams);
    this.carouselUpdateStarted = false;
  }
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
  tweet = '<li>'+'<a href="http://www.twitter.com/'+item.user.name+'" title="'+item.user.name+'&rsquo;s Twitter page">';
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
  tweet += '<span class="real_time">'+item.created_at+'</span></li>';
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

TweetCarousel.prototype.carouselBefore = function(carousel, li_object, index, state){
  if(this.carouselItemFadeIn !== false){
    $(li_object).fadeTo(this.animationTime,0.01);
  }
}
TweetCarousel.prototype.carouselAfter = function(carousel, li_object, index, state){
  //initial last visible item doesn't do the fade IN animation
  if(state!=="init" && this.carouselItemFadeIn !== false){
    $(li_object).fadeTo(1,0.01).delay(this.animationTime).fadeTo(this.animationTime,1);
  }
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
  var index = "";
TweetCarousel.prototype.carouselDisplay = function(carousel,state){
  if (state == 'init') { 
    orig_size = carousel.size();
    index = orig_size;
  }
  else{
    this.updateTweetTimes();
  }
}
TweetCarousel.prototype.carouselInit = function(carousel)
{
    // Pause autoscrolling if the user moves with the cursor over the clip.
    carousel.clip.hover(function() {
        carousel.stopAuto();
    }, function() {
        carousel.startAuto();
    });
    function tweetnext() {carousel.next()};
};

TweetCarousel.prototype.createCSS = function(selector, declaration) {
  //Copyright 2005, 2006 Bobby van der Sluis
  //This software is licensed under the CC-GNU LGPL <http://creativecommons.org/licenses/LGPL/2.1/>
  
  // test for IE
  var ua = navigator.userAgent.toLowerCase();
  var isIE = (/msie/.test(ua)) && !(/opera/.test(ua)) && (/win/.test(ua));

  // create the style node for all browsers
  var style_node = document.createElement("style");
  style_node.setAttribute("type", "text/css");
  style_node.setAttribute("media", "screen"); 

  // append a rule for good browsers
  if (!isIE) style_node.appendChild(document.createTextNode(selector + " {" + declaration + "}"));

  // append the style node
  document.getElementsByTagName("head")[0].appendChild(style_node);

  // use alternative methods for IE
  if (isIE && document.styleSheets && document.styleSheets.length > 0) {
    var last_style_node = document.styleSheets[document.styleSheets.length - 1];
    if (typeof(last_style_node.addRule) == "object") last_style_node.addRule(selector, declaration);
  }
};