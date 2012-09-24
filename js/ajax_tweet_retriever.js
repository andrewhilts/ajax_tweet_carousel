/*
Copyright 2012 Andrew Hilts et al

Ajax TweetRetriever is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Ajax TweetRetriever is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

To review a copy of the GNU General Public License, see http://www.gnu.org/licenses/.
*/

function socialMediaAPIModel(params){
  this.baseURL = params.baseURL;
  this.allowedParams = params.allowedParams;
  this.responseObjectModel = params.responseObjectModel;
  this.getItems = params.getItems;
  //provide set of accepted params (but actual param values build in retriever)
}

socialMediaAPIModel.prototype.buildURL = function(URLParams){
  url = this.baseURL;
  count = 0;
  errors = [];
  for(var i in this.allowedParams){
    key = this.allowedParams[i].key;
    required = this.allowedParams[i].required;
    if(typeof URLParams[key] !== "undefined"){
      //allowedParam assigned value in URLParams
      if(typeof URLParams[key] == this.allowedParams[i]["type"]){
        //URLParam is of correct type

        value = escape(URLParams[key]);

        if(this.allowedParams[i]["type"] === "object"){
          values = [];
          for(var j in this.allowedParams[i].itemKeys){
            for(var k in URLParams[key]){
              if(k == this.allowedParams[i].itemKeys[j]){
                values.push(escape(URLParams[key][k]));
              }
            }
          }
          if(values.length >= this.allowedParams[i].itemKeys.length){
            value = values.join();
          }
          else{
            errors.push({type:"itemKeys",key:key,required:required});
            value = false;
          }
        }
        else if(typeof this.allowedParams[i].options == "object"){
          var optionFound = false;
          //check if value is one of the predefined options
          for(var l in this.allowedParams[i].options){
            if(value === this.allowedParams[i].options[l]){
              optionFound = true;
            }
          }
          if(!optionFound){
            errors.push({type:"options",key:key,required:required});
            value = false;
          }
        }
        //If array, check for required items
        //If only certain values permitted, check for them
        count++;
        if(count === 1){
          delim = "?";
        }
        else{
          delim = "&";
        }
        if(value){
          url += delim+key+"="+value;
        }
      }
      else{
        //Type error
        errors.push({type:"type",key:key,required:required});
      }
    }
    else{
      if(this.allowedParams[i].required === true){
        //Missing a required param
        errors.push({type:"missing",key:key,required:required});
      }
    }
  }
  if(errors.length > 0){
    for(var m in errors){
      if(errors[m].type === "missing" || errors[m].required){
        fatalError = true;
        window.console.log("Fatal Error: "+errors[m].key+" is required and threw a "+errors[m].type+" error.");
      }
      else{
        window.console.log("Warning: "+errors[m].key+" threw a "+errors[i].type+" error. Parameter omitted from URL");
      }
    }
  }
  if(typeof fatalError == "undefined"){
    return url;
  }
  else{
    return false;
  }
};

TwitterAPIModel = new socialMediaAPIModel({
  //See https://dev.twitter.com/docs/api/1/get/search for param descriptions
  baseURL: "http://search.twitter.com/search.json",
  allowedParams: [
    {
      key : "q",
      type : "string",
      required : true
    },
    {
      key : "geocode",
      type : "object",
      itemKeys : ["longitude","latitude","radius"],
      required : false
    },
    {
      key : "lang",
      type : "string",
      required : false
    },
    {
      key : "locale",
      type : "string",
      required : false
    },
    {
      key : "page",
      type : "number",
      required : false
    },
    {
      key : "result_type",
      type : "string",
      options: ['mixed','recent','popular'],
      required : false
    },
    {
      key : "rpp",
      type : "number",
      required : false
    },
    {
      key : "show_user",
      type : "boolean",
      required : false
    },
    {
      key : "until",
      type : "number",
      required : false
    },
    {
      key : "since_id",
      type : "number",
      required : false
    },
    {
      key : "max_id",
      type : "number",
      required : false
    },
    {
      key : "include_entities",
      type : "boolean",
      required : false
    }
  ]
});

var PinterestAPIModel = new socialMediaAPIModel({
  baseURL: "http://query.yahooapis.com/v1/public/yql?q=select%20channel%20from%20xml%20where%20url%3D'http%3A%2F%2Fpinterest.com%2F",
  getItems: function(json){
    return json.query.results.rss.channel.item;
  }
});
//Override default buildURL function because Pinterst doesn't have a real API
PinterestAPIModel.buildURL = function(username){
  return this.baseURL+username+"%2Ffeed.rss'&format=json";
};
function SocialMediaAPIRetriever(params){
  console.log(params.URLParams);
  this.model = params.model;
  this.url = this.model.buildURL(params.URLParams);
}

SocialMediaAPIRetriever.prototype.query = function(){
  $.ajax({
    crossDomain:true,
    url: this.url,
    type: 'GET',
    dataType: 'jsonp',
    timeout: 3000,
    error: function(jqXHR, textStatus, errorThrown){
      
    }.bind(this),
    success:  function(json){
      console.log(this.model.getItems(json));
    }.bind(this)
  });
}

function TweetRetriever(params){
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
    this.paintNewTweets(0);
  });
  if(this.autoStart){
    this.query();
  }
}

//Inherit event model from eventtarget.js
TweetRetriever.prototype = new EventTarget();

TweetRetriever.prototype.update = function (){
  this.timeLeft--;
  if(this.timeLeft==0){
    this.timeLeft = this.tempo/1000;
    this.query();
  }
  if(this.displayRequestStatus === true){
    this.statusElement.children('span').get(1).innerHTML = "New tweets in "+this.timeLeft;
  }
}

TweetRetriever.prototype.query = function() {
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

TweetRetriever.prototype.saveTweets = function(json, queryType){
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

TweetRetriever.prototype.compareTweetQueries = function() {
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

TweetRetriever.prototype.updateTweetTimes = function(){
  real_times = this.container.find('span.real_time');
  for(i in real_times){
    if(!isNaN(i)){
      new_time = real_times[i].innerHTML;
      old_time = $(real_times[i]).parent().children('span.date');
      $(old_time[0]).html(this.timeAgo(new_time));
    }
  }
}

TweetRetriever.prototype.addStatusElem = function(params){
  this.displayRequestStatus = params.displayRequestStatus;
  if(this.displayRequestStatus){
    this.statusElementId = params.container+"_status";
    statusElement = "<div id=\""+this.statusElementId+"\" class=\"tweet_status\"><span>Loading...</span><span>New tweets in </span></div>";
    this.container.after(statusElement);
    this.statusElement = $("#"+this.statusElementId);
  }
}

TweetRetriever.prototype.displayInit = function(){
  for(i in this.addTweets){
    this.container.prepend("<li></li>");
  }
  this.paintNewTweets(0);
  this.initialized = true;
  this.fire("displayInit");
}

TweetRetriever.prototype.timeAgo = function(dateString) {
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

TweetRetriever.prototype.tweetFormat = function(item){
  tweet = '<a href="http://www.twitter.com/'+item.user.name+'" title="'+item.user.name+'&rsquo;s Twitter page" class="profilePicLink">';
  tweet += '<img src="'+item.user.profile_image_url+'" alt="'+item.user.name+'&rsquo;s profile picture"/></a>'
  if(this.controlRetweet === true || this.controlReply === true || this.controlFavorite === true){
      tweet += '<div class="tweetControls">';

      if(this.controlReply === true){tweet += '<a href="http://twitter.com/intent/tweet?in_reply_to='+item.id_str+'" class="tweetControl reply" title="Reply"><i></i></a>';}
      if(this.controlRetweet === true){tweet += '<a href="http://twitter.com/intent/retweet?tweet_id='+item.id_str+'" class="tweetControl retweet" title="Retweet"><i></i></a>';}
      if(this.controlFavorite === true){tweet += '<a href="http://twitter.com/intent/favorite?tweet_id='+item.id_str+'" class="tweetControl favorite" title="Favourite"><i></i></a>';}

      tweet += '</div>';
  }
  tweet += '<span class="name"><a href="http://www.twitter.com/'+item.user.name+'" title="'+item.user.name+'&rsquo;s Twitter page">'+item.user.name+'</a></span>';
  tweet += '<span class="date">'+this.timeAgo(item.created_at)+'</span>';
  tweet += '<p>'+this.textFormat(item.text)+'</p>';
  tweet += '<span class="real_time">'+item.created_at+'</span>';
  return tweet;
};

TweetRetriever.prototype.textFormat = function(texto){
  /*
  This function copied from Juitter.
  BY RODRIGO FANTE - http://rodrigofante.com
  Juitter is distributed under the MIT License
  Read more about the MIT License --> http://www.opensource.org/licenses/mit-license.php
  */

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

TweetRetriever.prototype.paintTweet = function(tweet,e,i){
  e.html(tweet);
  i++;
  this.paintNewTweets(i);
}

TweetRetriever.prototype.paintNewTweets = function(i){
  if (this.addTweets.length > 0){
    tweet = this.tweetFormat(this.addTweets.shift());
    e = this.container.children('li')[i];
    this.paintTweet(tweet,$(e),i);
  }
}

TweetRetriever.prototype.removeDefaultUpdateMethod = function(){
  this.removeListener("update",this.paintNewTweets);
}

TweetRetriever.prototype.carouselUpdate = function(carousel, li_object, index, state){
  //window.console.log(this.addTweets.length + "new tweets remain");
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