tweetRetriever = {
  newTweets: [],
  oldTweets: [],
  addTweets: [],
  newTweetIDs: [],
  initialized: false,
  //function that queries Twitter periodically and updates the Tweet arrays
  query: function () {
    $.ajax({
      crossDomain:true,
      url: "http://twitter.com/status/user_timeline/"+this.user+".json?count="+this.quantity+"&rpp=5",
      type: 'GET',
  	  dataType: 'jsonp',
  	  timeout: 3000,
  	  error: function(jqXHR, textStatus, errorThrown){alert(errorThrown);},
      success:  function(json){
        tweetRetriever.oldTweets = tweetRetriever.newTweets;
        tweetRetriever.newTweets = [];
        tweetRetriever.newTweetIDs = [];
        $.each(json,function(i,item) {
          tweetRetriever.newTweets.push([item.id,item]);
        });
        tweetRetriever.compareTweetQueries();
        if (!tweetRetriever.initialized){
          tweetRetriever.displayInit();
        }
      }   
    });
    this.update();
  },
  //Period at which the query function is called; hence when the tweets will be updated. Don't do more than one per minute, or Twitter's API will kick your IP out for an hour.
  update: function () {
    setTimeout("tweetRetriever.query()",this.tempo);
  },
  //Function that sets up the TweetRetriever object, launches the first query
  init: function (params) {
    this.tempo = params.tempo*1000;
    this.quantity = params.tweets;
    this.user = params.user;
    this.container = params.container;
    this.skin =$(params.container)[0].className;
    this.controlRetweet = params.controlRetweet;
	this.controlReply = params.controlReply;
	this.controlFavorite = params.controlFavorite;
    if(params.displayVert == null){
        this.displayVert = true;
    }
    else{
        this.displayVert = params.displayVert;
    }
    totalMarginSpace = params.itemMargin*(params.displayItemsNum-1);
    if(params.itemWidth !== null && params.itemHeight !== null && this.displayVert === true){
       containerHeight = params.itemHeight*params.displayItemsNum+totalMarginSpace;
       $("<style type='text/css'>\
            ."+this.skin+" .jcarousel-container-vertical,\
            .jcarousel-skin-tweet-retriever .jcarousel-clip-vertical{\
                width:"+params.itemWidth+"px;\
                height:"+containerHeight+"px;\
                }\
            ."+this.skin+" .jcarousel-item{\
                width:"+params.itemWidth+"px;\
                height:"+params.itemHeight+"px;\
                }\
            ."+this.skin+" .jcarousel-item-vertical{\
                margin-bottom:"+params.itemMargin+"px;\
                }\
          </style>").appendTo("head");
    }
    else if(params.itemWidth !== null && params.itemHeight !== null && this.displayVert === false){
       containerWidth = params.itemWidth*params.displayItemsNum+totalMarginSpace;
       $("<style type='text/css'>\
            ."+this.skin+" .jcarousel-container-horizontal,\
            ."+this.skin+" .jcarousel-clip-horizontal{\
                width:"+containerWidth+"px;\
                height:"+params.itemHeight+"px;\
                }\
            ."+this.skin+" .jcarousel-item{\
                width:"+params.itemWidth+"px;\
                height:"+params.itemHeight+"px;\
                }\
            ."+this.skin+" .jcarousel-item-horizontal{\
                margin-right:"+params.itemMargin+"px;\
                margin-left:0\
                }\
          </style>").appendTo("head");
    }
    this.query();
  },
  //Function that sets up how the TweetRetriever is displayed. In this case it's a JCarousel
  displayInit: function () {
    $.each(this.addTweets,function(i,item){
      tweet_time = tweetRetriever.timeAgo(item.created_at);
      tweet = tweetRetriever.tweetFormat(item);
      $(tweetRetriever.container).prepend(tweet);
    });
    this.initialized = true;
    displayVert = this.displayVert;
    $(tweetRetriever.container).jcarousel({
      auto: 5,
      animation:1000,
      scroll: 1,
      wrap: 'circular',
      vertical:displayVert,
      initCallback: mycarousel_initCallback,
      itemLoadCallback: display,
      itemFirstOutCallback: {
	      onBeforeAnimation: callback1
	    },
	    itemLastInCallback: {
	      onBeforeAnimation: callback2
	    }
    });  
  },
  //Compares the old and new tweet sets, to find new ones to place in the addTweets array
  compareTweetQueries: function () {
    seen = [], diff = [], newTweets = [], oldTweets = [];
    $.each(this.newTweets,function(i,item){
      newTweets.push(item[0]);
    });
    $.each(this.oldTweets,function(i,item){
      oldTweets.push(item[0]);
    });
    for (var i = 0; i < oldTweets.length; i++)
        seen[oldTweets[i]] = true;
    for (var i = 0; i < newTweets.length; i++)
        if (!seen[newTweets[i]])
            diff.push(this.newTweets[i][1]);
    this.addTweets = diff.reverse();
  },
  //Format the tweet text, create links. Taken from Juitter.
  textFormat: function(texto){
		//This from Juitter
		//make links
		var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
		texto = texto.replace(exp,"<a href='$1' class='extLink'>$1</a>"); 
		var exp = /[\@]+([A-Za-z0-9-_]+)/ig;
		texto = texto.replace(exp,"<a href='http://twitter.com/$1' class='profileLink'>@$1</a>"); 
		var exp = /[\#]+([A-Za-z0-9-_]+)/ig;
		texto = texto.replace(exp,"<a href='http://twitter.com/search?q=%23#$1'' class='hashLink'>#$1</a>"); 
		// make it bold
		return texto;
	},
	//Render the tweet contents for display.
	tweetFormat: function(item){
	  tweet = '<li>'+'<a href="http://www.twitter.com/'+item.user.name+'" title="'+item.user.name+'&rsquo;s Twitter page">';
    tweet += '<img src="'+item.user.profile_image_url+'" alt="'+item.user.name+'&rsquo;s profile picture"/></a>'
    tweet += '<span class="name"><a href="http://www.twitter.com/'+item.user.name+'" title="'+item.user.name+'&rsquo;s Twitter page">'+item.user.name+'</a></span>';
    tweet += '<span class="date">'+tweet_time+'</span>';
	tweet += '<div class="tweetControls"><a href="http://twitter.com/intent/tweet?in_reply_to='+item.id_str+'" class="tweetControl reply" title="Reply"><i></i></a><a href="http://twitter.com/intent/retweet?tweet_id='+item.id_str+'" class="tweetControl retweet" title="Retweet"><i></i></a><a href="http://twitter.com/intent/favorite?tweet_id='+item.id_str+'" class="tweetControl favorite" title="Favourite"><i></i></a></div>';
    tweet += '<p>'+tweetRetriever.textFormat(item.text)+'</p>';
    tweet += '<span class="real_time">'+item.created_at+'</span></li>';
    return tweet;
	},
	//Calculate the relative time of the tweet
	timeAgo : function(dateString) {
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

      if (isNaN(diff) || diff < 0) {
        return ""; // return blank string if unknown
      }

      if (diff < second * 2) {
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

    }
  };
  function callback1(jcarousel_object, li_object, index, state){
	  	$(li_object).fadeTo(500,0.01);
	}
	function callback2(jcarousel_object, li_object, index, state){
	    //initial last visible item doesn't do the fade IN animation
	    if(state!=="init"){
	    	$(li_object).fadeTo(1,0.01).delay(500).fadeTo(500,1);
	    }
	}
	var index = "";
	function display(carousel,state){
	  if (state == 'init') { 
      orig_size = carousel.size();
      index = orig_size;
    }
	  else{
	    real_times = $(tweetRetriever.container).find('span.real_time');
       for(i in real_times){
         if(!isNaN(i)){
           new_time = real_times[i].innerHTML;
           old_time = $(real_times[i]).parent().children('span.date');
           $(old_time[0]).html(tweetRetriever.timeAgo(new_time));
         }
       }
      if(tweetRetriever.addTweets.length > 0){
  	     $.each(tweetRetriever.addTweets,function(i,item){
  	        tweet_time = tweetRetriever.timeAgo(item.created_at);
            tweet = tweetRetriever.tweetFormat(item);
            carousel.add(index,tweet);
            index-=1;
            if(index==0){index=orig_size;} 
  	     });
  	     tweetRetriever.addTweets = [];
  	  }
    }
	}
function mycarousel_initCallback(carousel)
{
    // Pause autoscrolling if the user moves with the cursor over the clip.
    carousel.clip.hover(function() {
        carousel.stopAuto();
    }, function() {
        carousel.startAuto();
    });
};
