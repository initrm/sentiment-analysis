/**
 * OVERVIEW: Tweets Class provides useful methods to iteract with the tweets api
 */
class Tweets {
    
    /**
     * Checks if there are some cached tweets and checks the data integrity
     * 
     * @returns {Boolean}
     */
    static areCached = () => {

        // Check if cache contains tweets list data
        let tweets = localStorage.getItem('tweets');

        // Checks the integrity of the data
        try {
            var tweetsArray = JSON.parse(tweets);
        }
        catch(error) {
            return false;
        }
        if(!tweetsArray || tweetsArray.some(({ created_at, text, author_id, id }) => {
            return (
                typeof(created_at) !== typeof(text) || 
                typeof(text) !== typeof(author_id) || 
                typeof(author_id) !== typeof(id) || 
                typeof(id) !== 'string'
            )
        })) return false;

        return true;

    }

    /**
     * Store into the cache the array of tweets
     * 
     * @param {Array} tweets
     */
    static cache = (tweets) => localStorage.setItem('tweets', JSON.stringify(tweets))

    /**
     * Returns an array of tweets which can come from the cache or from the api
     * 
     * @returns {Array}
     */
    static getTweets = async () => {

        return new Promise((resolve, reject) => {

            // Checks if there are at least one tweet cached, in that case it returns the cached tweets
            if(Tweets.areCached() && JSON.parse(localStorage.getItem('tweets')).length > 0) 
                return resolve({ tweets: JSON.parse(localStorage.getItem('tweets')), source: 'cache' })
    
            // No tweets cached, retrieves them from the api
            fetch('/api/tweets')
                // Converts the response into a JSON object
                .then((response) => response.json())
                .then((data) => {
                    // Returns the tweets list
                    resolve({ tweets: data, source: 'api' })
                })
                // Returns the error
                .catch((error) => reject(error));
            
        });

    }

    /**
     * Returns the first tweet available and updates the cache removing the returned tweet
     * 
     * @returns {Object}
     */
    static pickOne = async () => {

        let tweets = (await Tweets.getTweets()).tweets

        // Takes the tweets and caches the other ones
        let tweet = tweets[0]
        Tweets.cache(tweets.slice(1))

        return tweet
        
    }

}