var TwitterUtils = {};
TwitterUtils.textFormat = function(texto){
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
TwitterUtils.template = '<li><a href="{{userLink}}" title="{{name}}&rsquo;s Twitter page" class="profilePicLink"><img src="{{image}}" alt="{{name}}&rsquo;s profile picture"></a><div class="tweetControls"><a href="{{tweet_replyLink}}" class="tweetControl reply" title="Reply"><i></i></a><a href="{{tweet_reTweetLink}}" class="tweetControl retweet" title="Retweet"><i></i></a><a href="{{tweet_favouriteLink}}" class="tweetControl favorite" title="Favourite"><i></i></a></div><span class="name"><a href="{{userLink}}" title="{{name}}&rsquo;s Twitter page">{{name}}</a></span><span class="date">{{timeAgo}}</span><p>{{{text}}}</p></li>';


function socialMediaAPIModel(params){
  this.baseURL = params.baseURL || false;
  this.allowedParams = params.allowedParams || false;
  this.responseObjectModel = params.responseObjectModel || false;
  this.getItems = params.getItems || false;
  this.template = params.template || false;
  this.parseData = params.parseData || false;
  //provide set of accepted params (but actual param values build in retriever)
}
socialMediaAPIModel.prototype.init = function(){
  return this;
};
socialMediaAPIModel.prototype.addQuantityParam = function(quantity,URLParams){
  return URLParams;
};
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

        value = encodeURIComponent(URLParams[key]);

        if(this.allowedParams[i]["type"] === "object"){
          values = [];
          for(var j in this.allowedParams[i].itemKeys){
            for(var k in URLParams[key]){
              if(k == this.allowedParams[i].itemKeys[j]){
                values.push(encodeURIComponent(URLParams[key][k]));
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
function TwitterSearchAPIModel(){}
TwitterSearchAPIModel.prototype = new socialMediaAPIModel({
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
  ],
  getItems: function(json){
    return json.results;
  },
  template: TwitterUtils.template,
  parseData: function(data,parent){
    newData = {
      name: data.from_user,
      username: data.from_user_name,
      userLink: "http://www.twitter.com/"+data.from_user_name,
      image: data.profile_image_url,
      tweet_id: data.id_str,
      tweet_replyLink: "http://twitter.com/intent/tweet?in_reply_to="+data.id_str,
      tweet_reTweetLink: "http://twitter.com/intent/retweet?tweet_id="+data.id_str,
      tweet_favouriteLink: "http://twitter.com/intent/favorite?tweet_id="+data.id_str,
      timestamp: data.created_at,
      timeAgo: parent.timeAgo(data.created_at),
      text: this.textFormat(data.text)
    };
    return newData;
  }
});
TwitterSearchAPIModel.prototype.addQuantityParam = function(quantity,URLParams){
  URLParams['rpp'] = quantity;
  return URLParams;
};
TwitterSearchAPIModel.prototype.textFormat = TwitterUtils.textFormat;

function TwitterUserAPIModel(){}
TwitterUserAPIModel.prototype = new socialMediaAPIModel({
  // see https://dev.twitter.com/docs/api/1/get/statuses/user_timeline
  baseURL: "http://twitter.com/status/user_timeline/",
  allowedParams: [
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
      key : "page",
      type : "number",
      required : false
    },
    {
      key : "count",
      type : "number",
      required : false
    },
    {
      key : "show_user",
      type : "boolean",
      required : false
    },
    {
      key : "contributor_details",
      type : "boolean",
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
  ],
  getItems: function(json){
    return json;
  },
  template: TwitterUtils.template,
  parseData: function(data,parent){
    newData = {
      name: data.user.name,
      username: data.user.screen_name,
      userLink: "http://www.twitter.com/"+data.user.screen_name,
      image: data.user.profile_image_url,
      tweet_id: data.id_str,
      tweet_replyLink: "http://twitter.com/intent/tweet?in_reply_to="+data.id_str,
      tweet_reTweetLink: "http://twitter.com/intent/retweet?tweet_id="+data.id_str,
      tweet_favouriteLink: "http://twitter.com/intent/favorite?tweet_id="+data.id_str,
      timestamp: data.created_at,
      timeAgo: parent.timeAgo(data.created_at),
      text: this.textFormat(data.text)
    };
    return newData;
  }
});
TwitterUserAPIModel.prototype.init = function(URLParams){
  this.baseURL = this.baseURL + URLParams.username + '.json';
};
TwitterUserAPIModel.prototype.addQuantityParam = function(quantity,URLParams){
  URLParams['count'] = quantity;
  return URLParams;
};
TwitterUserAPIModel.prototype.textFormat = TwitterUtils.textFormat;
function PinterestAPIModel (){}
PinterestAPIModel.prototype = new socialMediaAPIModel({
  baseURL: "http://query.yahooapis.com/v1/public/yql?q=select%20channel%20from%20xml%20where%20url%3D'http%3A%2F%2Fpinterest.com%2F",
  getItems: function(json){
    return json.query.results.rss.channel.item;
  },
  template: '<li><a href="{{link}}"><span class="img" style="background:url({{image}}); background-size:45px; background-repeat:no-repeat; position:relative; display:block; width:45px; height:45px;">&nbsp;</span><span class="date">{{timeAgo}}</span><p>{{{description}}}</p></a></li>',
  parseData: function(data,parent){
    var data2parse = $(data.description);
    data.image = $(data2parse.get(0)).children('a').children('img').attr('src');
    data.description = data2parse[1].innerHTML;
    data.timestamp = data.pubDate;
    data.timeAgo = parent.timeAgo(data.pubDate);
    return data;
  }
});

//Override default buildURL function because Pinterst doesn't have a real API
PinterestAPIModel.prototype.buildURL = function(URLParams){
  return this.baseURL+URLParams.username+"%2Ffeed.rss'&format=json";
};

function YelpSearchAPIModel(){}
YelpSearchAPIModel.prototype = new socialMediaAPIModel({
  //See http://www.yelp.com/developers/documentation/v2/search_api for param descriptions
  baseURL: "http://api.yelp.com/business_review_search",
  allowedParams: [
    {
      key: "ywsid",
      type: "string",
      required: true
    },
    {
      key : "location",
      type : "string",
      required : true
    },
    {
      key : "term",
      type : "string",
      required : false
    },
    {
      key : "limit",
      type : "number",
      required : false
    },
    {
      key : "cc",
      type : "number",
      required : false
    },
    {
      key : "category",
      type : "string",
      required : false
    },
    {
      key : "radius",
      type : "number",
      required : false
    }
  ],
  getItems: function(json){
    return json.businesses;
  },
  template: '<li><img src="{{photo_url_small}}"/><div>{{name}}<br>{{address1}},{{city}}</div><div><img src="{{rating_img_url_small}}" alt="{{avg_rating}}"/></div><div>{{review_count}} reviews</div></li>',
  parseData: function(data,parent){
    newData = data;
    return newData;
  }
});
YelpSearchAPIModel.prototype.addQuantityParam = function(quantity,URLParams){
  URLParams['limit'] = quantity;
  return URLParams;
};

function SocialMediaAPIWidget(params){
  this.el = params.el;
  this.model = params.model;
  this.quantity = params.displayQuantity | false;
  var that = this;
  if(this.quantity){
    params.URLParams = this.model.addQuantityParam(this.quantity,params.URLParams);
  }
  this.model.init(params.URLParams);
  this.url = this.model.buildURL(params.URLParams);
  this.quantity = 8;
  this.updateInterval = params.updateInterval | false;
  this.autoStart = params.autoStart | false;
  this.timer_id = 0;
  this.initialized = 0;
  if(this.autoStart){
    this.start();
  }
  $(this).bind('receive',function(){
    if(!this.initialized){
      this.displayInit();
    }
    else{
      this.paintItems(0);
    }
  });
}
SocialMediaAPIWidget.prototype.displayInit = function(){
  for(var i = 0; i < this.quantity; i++){
    this.el.prepend("<li></li>");
  }
  this.initialized = true;
  $(this).trigger('receive');
};
SocialMediaAPIWidget.prototype.start = function(){
  var self = this;
  this.query();
  if(this.updateInterval){
    this.timer_id = setInterval(function(){
      self.update();
    },this.updateInterval);
  }
};
SocialMediaAPIWidget.prototype.update = function(){
  this.query();
};
SocialMediaAPIWidget.prototype.query = function(){
  $.ajax({
    crossDomain:true,
    url: this.url,
    type: 'GET',
    dataType: 'jsonp',
    timeout: 3000,
    error: function(jqXHR, textStatus, errorThrown){
      $(this).trigger('error');
    }.bind(this),
    success:  function(json){
      this.data = this.model.getItems(json);
      $(this).trigger('receive');
    }.bind(this)
  });
};
SocialMediaAPIWidget.prototype.paintItem = function(item,e,i){
  e.html(item);
  i++;
  this.paintItems(i);
};

SocialMediaAPIWidget.prototype.paintItems = function(i){
  if (typeof this.data[i] !== "undefined" && i < this.quantity){
    var that = this;
    e = this.el.children('li')[i];
    item = this.model.parseData(this.data[i],that);
    item = Mustache.render(this.model.template,item);
    this.paintItem(item,$(e),i);
  }
  else if(i < this.quantity){
    item = "";
    e = this.el.children('li')[i];
    this.paintItem(item,$(e),i);
  }
};
SocialMediaAPIWidget.prototype.timeAgo = function(dateString) {
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
