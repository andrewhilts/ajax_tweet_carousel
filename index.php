<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en-us">
<head>
<title>Ajax Tweet Ticker</title>
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js">
</script>
<script type="text/javascript" src="js/jquery.jcarousel.js"></script>
<script type="text/javascript" src="js/jquery.timers.js"></script>
<script type="text/javascript" src="js/ajax_tweet_carousel.js"></script>
<!--
  jCarousel skin stylesheet
-->
<link rel="stylesheet" type="text/css" href="css/tweet-retriever-skin.css" />
<link rel="stylesheet" type="text/css" href="css/main.css" />
<script type="text/javascript">
$(document).ready(function(){
    myTweets = new TweetCarousel({
        queryString: "%23HardestThingsInLife",
        //If you want to display a single user's tweets, change queryType to "user". "search" is possible for some users; not all.
        queryType: "search",
        tempo: 40,
        tweets: 8,
        controlReply: true,
        controlRetweet: true,
        controlFavorite: true,
        displayRequestStatus: true,
        container: "tweets",
        auto: 5,
        //the below only sets the css height of the tweet container to be n*itemHeight+itemMargin*(n-1). If displayVert is false, use width/hoz instead of height/vert. ItemMargin only assigns a bottom or right margin to the item, depending on displayVert. Otherwise, delete these last params and set everything with CSS (by default, commented out in the css file)
        displayItemsNum: 3,
        itemWidth: 300,
        itemHeight: 60,
        itemMargin:10
    },
    {
      auto: 1,
      animation:500,
      scroll: 1,
      wrap: 'circular',
      vertical:false,
      itemFadeIn: true
    }
    );

    // myTweets2 = new TweetCarousel({
    //     queryString: "%23drupal",
    //     //If you want to display a single user's tweets, change queryType to "user". "search" is possible for some users; not all.
    //     queryType: "search",
    //     tempo: 120,
    //     tweets: 8,
    //     controlReply: true,
    //     controlRetweet: true,
    //     controlFavorite: true,
    //     displayRequestStatus: true,
    //     container: "tweets2",
    //     auto: 5,
    //     //the below only sets the css height of the tweet container to be n*itemHeight+itemMargin*(n-1). If displayVert is false, use width/hoz instead of height/vert. ItemMargin only assigns a bottom or right margin to the item, depending on displayVert. Otherwise, delete these last params and set everything with CSS (by default, commented out in the css file)
    //     displayItemsNum: 4,
    //     itemWidth: 300,
    //     itemHeight: 53,
    //     itemMargin:10
    // },
    // {
    //   auto: 5,
    //   animation:1000,
    //   scroll: 1,
    //   wrap: 'circular',
    //   vertical:true,
    //   itemFadeIn: false
    // }
    // );

  myTweets.query();
//  myTweets2.query();   
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
  <ul id="tweets2" class="jcarousel-skin-tweet-retriever"></ul>
  <!-- End Tweet Carousel HTML tags !-->
  

  </body>
</html>
