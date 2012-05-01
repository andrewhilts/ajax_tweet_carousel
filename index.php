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
    tempo: 200,
    tweets: 6,
    controlReply: true,
    controlRetweet: true,
    controlFavorite: true,
    displayRequestStatus: true,
    container: "tweets",
    autoStart: true,
    profileImgSize: "bigger",
    }
  );

  myTweets2 = new TweetCarousel({
    queryType: "search",
    queryString: "%23drupal",
    tempo: 100,
    tweets: 16,
    profileImgSize: "normal",
    autoStart: true,
    container: "tweets2",
    displayRequestStatus: false,
    controlReply: true,
    controlRetweet: true,
    controlFavorite: true
    }
  );

  myTweets2.addListener("displayInit",function(){
      //remove standard listener
      this.removeDefaultUpdateMethod();
      //set animation time (used in carousel functions)
      this.animationTime = 1000;

      params = {
        auto: 1,
        animation:this.animationTime,
        scroll: 1,
        wrap: 'circular',
        vertical:true,
        itemFirstOutCallback : {
          onBeforeAnimation: carouselBefore.bind(this),
        },
        itemLastInCallback : {
          onBeforeAnimation: carouselAfter.bind(this),
          onAfterAnimation: this.carouselUpdate.bind(this)
        }
      };
      //Add jcarousel
      this.container.jcarousel(params);
    });

});
</script>
  </head>
  <body>
  <div id="wrapper" style="height:800px">
  <h1>Ajax Tweet Carousel</h1>

  <!-- Begin Tweet Carousel HTML tags !-->
  <!-- the status div is automatically hidden if you set displayRequestStatus to false !-->
  <!-- Ensure your skin's classname begins with jcarousel-skin- !-->
  <ul id="tweets" class="tweet-retriever pic-orient"></ul>

<div class="grey tweet-retriever" style="float:left">
  <ul id="tweets2" class="jcarousel-skin-tweet-retriever"></ul>
</div>
  <ul id="tweets3" class="jcarousel-skin-tweet-retriever"></ul>
  <ul id="tweets4" class="jcarousel-skin-tweet-retriever"></ul>
  <!-- End Tweet Carousel HTML tags !-->

  </body>
</html>
