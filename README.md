##Ajax Tweet Retriever

This javaScript program creates an unordered list of tweets retrieved via an AJAX call to Twitter's API for either a search string or user account name. After an interval in time, another AJAX call is triggered, and the list of tweets is updated.

Any number of tweetRetriever instances may be created. Be careful to balance the rate at which the API is queried though.

The tweetRetriever's default update method can be overwritten (as is the case for the carousel example).

It is fairly simple to customize how the tweetRetriever instance updates the list. Another example in index.html creates a custom paintTweet method that fades each item in sequence as it is updated, for a pretty effect.