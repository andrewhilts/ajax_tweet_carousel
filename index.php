<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en-us">
<head>
<title>Ajax Tweet Ticker</title>
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js">
</script>
<script type="text/javascript" src="js/jquery.jcarousel.js"></script>
<script type="text/javascript" src="js/jquery.timers.js"></script>
<script type="text/javascript" src="js/eventtarget.js"></script>
<script type="text/javascript" src="js/ajax_tweet_carousel.js"></script>
<!--
  jCarousel skin stylesheet
-->
<link rel="stylesheet" type="text/css" href="css/tweet-retriever-skin.css" />
<link rel="stylesheet" type="text/css" href="css/main.css" />
<script type="text/javascript">
function carouselBefore (carousel, li_object, index, state){
  $(li_object).fadeTo(this.animationTime,0.01);
}
function carouselAfter(carousel, li_object, index, state){
  if(state!=="init"){
    $(li_object).fadeTo(1,0.01).delay(this.animationTime/2).fadeTo(this.animationTime,1);
  }
}
$(document).ready(function(){
  myTweets = new TweetCarousel({
    queryString: "%23twitter",
    //If you want to display a single user's tweets, change queryType to "user". "search" is possible for some users; not all.
    queryType: "search",
    tempo: 10,
    tweets: 8,
    controlReply: true,
    controlRetweet: true,
    controlFavorite: true,
    displayRequestStatus: false,
    container: "tweets"
  }
  );

  myTweets2 = new TweetCarousel({
    queryString: "%23drupal",
    //If you want to display a single user's tweets, change queryType to "user". "search" is possible for some users; not all.
    queryType: "search",
    tempo: 300,
    tweets: 16,
    controlReply: true,
    controlRetweet: true,
    controlFavorite: true,
    displayRequestStatus: false,
    container: "tweets2",
  }
  );

myTweets3 = new TweetCarousel({
    queryString: "meteor",
    //If you want to display a single user's tweets, change queryType to "user". "search" is possible for some users; not all.
    queryType: "search",
    tempo: 30,
    tweets: 16,
    controlReply: true,
    controlRetweet: true,
    controlFavorite: true,
    displayRequestStatus: false,
    container: "tweets3"
  }
  );

myTweets4 = new TweetCarousel({
    queryString: "github",
    //If you want to display a single user's tweets, change queryType to "user". "search" is possible for some users; not all.
    queryType: "search",
    tempo: 300,
    tweets: 16,
    controlReply: true,
    controlRetweet: true,
    controlFavorite: true,
    displayRequestStatus: false,
    container: "tweets4"
  });

  myTweets.query();
  // myTweets.paintTweet = function(tweet,e){
  //        $(e).queue(function(){
  //             $(this).fadeTo(200,0.01).html(tweet).fadeTo(200,1);
  //         });
  //     }
  // myTweets2.query();
  //myTweets3.query();
  // myTweets4.query();

  // myTweets.addListener("displayInit",function(){
  //     this.animationTime = 500;
  //     params = {
  //       auto: 1,
  //       animation:700,
  //       scroll: 1,
  //       wrap: 'circular',
  //       vertical:false,
  //       itemFirstOutCallback : {
  //         onBeforeAnimation: carouselBefore.bind(this),
  //       },
  //       itemLastInCallback : {
  //         onBeforeAnimation: carouselAfter.bind(this),
  //         onAfterAnimation: this.carouselUpdate.bind(this)
  //       }
  //     };
  //     this.container.jcarousel(params);
  //   });

});
</script>
  </head>
  <body>
  <div id="wrapper">
  <h1>Ajax Tweet Carousel</h1>

  <!-- Begin Tweet Carousel HTML tags !-->
  <!-- the status div is automatically hidden if you set displayRequestStatus to false !-->
  <!-- Ensure your skin's classname begins with jcarousel-skin- !-->
  <ul id="tweets" class="jcarousel-skin-tweet-retriever"></ul>
<hr>
<div class="grey" style="float:left">
  <ul id="tweets2" class="jcarousel-skin-tweet-retriever"></ul>
</div>
  <ul id="tweets3" class="jcarousel-skin-tweet-retriever"></ul>
  <ul id="tweets4" class="jcarousel-skin-tweet-retriever"></ul>
  <!-- End Tweet Carousel HTML tags !-->


  </body>
</html>
