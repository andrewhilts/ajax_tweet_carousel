<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en-us">
<head>
<title>Ajax Tweet Ticker</title>
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js">
</script>
<script type="text/javascript" src="js/jquery.jcarousel.js"></script>
<script type="text/javascript" src="js/tweetRetriever.js"></script>
<!--
  jCarousel skin stylesheet
-->
<link rel="stylesheet" type="text/css" href="css/tweet-retriever-skin.css" />
<link rel="stylesheet" type="text/css" href="css/main.css" />
<script type="text/javascript">
$(document).ready(function(){
  <?php 
  if(isset($_GET['v'])){
  if($_GET['v'] == 'f'){echo "vert=false;";}
  else {echo "vert=true;";}
  }
  else {echo "vert=false;";}
  ?>
    tweetRetriever.init({
        queryString: "%23obama",
        //If you want to display a single user's tweets, change queryType to "user". "search" is possible for some users; not all.
        queryType: "search",
        tempo: 120,
        tweets: 8,
        controlReply: true,
        controlRetweet: true,
        controlFavorite: true,
        displayRequestStatus: true,
        container: "#tweets",
        displayVert: vert,
        auto: 5,
        //the below only sets the css height of the tweet container to be n*itemHeight+itemMargin*(n-1). If displayVert is false, use width/hoz instead of height/vert. ItemMargin only assigns a bottom or right margin to the item, depending on displayVert. Otherwise, delete these last params and set everything with CSS (by default, commented out in the css file)
        displayItemsNum: 3,
        itemWidth: 300,
        itemHeight: 60,
        itemMargin:10
    });
});  
</script>
  </head>
  <body>
  <div id="wrapper">
  <h1>Ajax Tweet Carousel</h1>
      <aside><a href="https://github.com/andrewhilts/ajax_tweet_carousel" title="Fork me on Github!"><img src="https://github.com/images/modules/dashboard/bootcamp/octocat_fork.png" alt="Fork me on Github!">Fork me on Github</a></aside>
      <p>The default query search is for &ldquo;#obama&rdquo;, a hashtag that is consistently popular (so the dynamic refreshing of the list is made apparent). I would recommend the system query Twitter's API every 2 minutes for the latest <em style="font-family:serif; font-size:1.15em;">n</em> tweets (Twitter allows each IP to query no more than 100 times an hour). 
      <p>This system will check to see which of the currently displayed tweets are different from the latest ones, and replace those that are no longer in the latest <em style="font-family:serif; font-size:1.15em;">n</em> with the new tweets. 
  
      <h2>Latest Tweets from <em>InternetRadio</em></h2>
  
  <!-- Begin Tweet Carousel HTML tags !-->
  <!-- the status div is automatically hidden if you set displayRequestStatus to false !-->
  <div id="status"><span id="server">Loading...</span><span id="countdown">New tweets in </span></div>
  <!-- Ensure your skin's classname begins with jcarousel-skin- !-->
  <ul id="tweets" class="jcarousel-skin-tweet-retriever"></ul>
  <!-- End Tweet Carousel HTML tags !-->
  
   <p>Easily configure either <a href="?v=f">horizontal</a> or <a href="?v=t">vertical</a> presentations.</a>
   <div class="based-on">
   <h2>Powered by</h2>
   <h3><a href="http://sorgalla.com/jcarousel/">JCarousel</a></h3>
   <p>By Jan Sorgalla. MIT/GPL licence.
   <p class="desc">jCarousel is a jQuery plugin for controlling a list of items in horizontal or vertical order. The items, which can be static HTML content or loaded with (or without) AJAX, can be scrolled back and forth (with or without animation).
   <p><a href="http://sorgalla.com/jcarousel/">http://sorgalla.com/jcarousel/</a>
   <h2>Inspired by</h2>
   <h3><a href="http://juitter.com/">Juitter</a></h3>
   <p>By Rodrigo Fanto. MIT licence.
   <p class="desc">jQuery Plugin to put Twitter live on your website
   <p><a href="http://juitter.com/">http://juitter.com/</a></p>
   </div>
   <h2>Initializing the Tweet Retriver</h2>
   <pre>
tweetRetriever.init({
    user: "%23obama",
    queryType: "search",
    tempo: 120,
    tweets: 8,
    controlReply: true,
    controlRetweet: true,
    controlFavorite: true,
    displayRequestStatus: true,
    container: "#tweets",
    displayVert: <?php 
if(isset($_GET['v'])){
if($_GET['v'] == 'f'){echo "false";}
else {echo "true";}
}
else {echo "false";}
?>,
    displayItemsNum: 3,
    itemWidth: 300,
    itemHeight: 60,
    itemMargin:10
});

//HTML

ul id="tweets" class="jcarousel-skin-tweet-retriever"
   </pre>
   <h3>Parameters</h3>
   <ul class="params-explain">
    <li><em>user</em> Twitter user whose stream is displayed.</li>
    <p>If you want to display a single user's tweets, change queryType to "user". "search" is possible for only some users; not all.
    <li><em>queryType</em> Either "search" or "user".</li>
    <li><em>tempo</em> Rate (s) at which Twitter is queried. (Min 60 in prod env)</li>
    <li><em>tweets</em> Number of tweets requested</li>
    <li><em>controlReply</em> true/false - diplay Reply control for each tweet.
    <li><em>controlRetweet</em> true/false - diplay Retweet control for each tweet.
    <li><em>controlFavorite</em> true/false - diplay Favourite control for each tweet.
    <li><em>displayRequestStatus</em> true/false - diplay time left before refresh, any errors
    <li><em>container</em> ID of UL container for Tweet LIs.</li>
    <li><em>displayVert</em> Whether or not to display the tweet list vertically.</li>
    <p>The following are optional params that could otherwise be specified with CSS. Delete them in that case. They're just meant to simplify the sometimes tricky jCarousel config:</p>
    <li><em>displayItemsNum</em> Number of Tweets to display at once</li>
    <li><em>itemWidth</em> Width of a Tweet Item</li>
    <li><em>itemHeight</em> Height of a Tweet Item</li>
    <li><em>itemMargin</em> Margin between Tweet Items</li>
  </ul>
  </div>
  </body>
</html>
