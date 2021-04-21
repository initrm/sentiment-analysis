/**
 * OVERVIEW: Tweets Class provides useful methods to iteract with the tweets api
 */
class Tweets {

    /**
     * Checks if there are some cached tweets and checks the data integrity
     * 
     * @returns {Boolean}
     */
    static #areCached = () => {

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
            return typeof(created_at) !== typeof(text) || typeof(text) !== typeof(author_id) || typeof(author_id) !== typeof(id) || typeof(id) !== 'string'
        })) return false;

        return true;

    }

    /**
     * Store into the cache the array of tweets
     * 
     * @param {Array} tweets
     */
    static #cache = (tweets) => localStorage.setItem('tweets', JSON.stringify(tweets))

    /**
     * Returns an array of tweets which can come from the cache or from the api
     * 
     * @returns {Array}
     */
    static #getTweets = async () => {

        return new Promise((resolve, reject) => {

            // Checks if there are at least one tweet cached, in that case it returns the cached tweets
            if(Tweets.#areCached() && JSON.parse(localStorage.getItem('tweets')).length > 0) 
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

        let tweets = (await Tweets.#getTweets()).tweets

        // Takes the tweets and caches the other ones
        let tweet = tweets[0]
        Tweets.#cache(tweets.slice(1))

        return tweet
        
    }

}

/**
 * Hides the loading screen div
 */
const hideAppLoadingScreen = () => $('#app-loading-screen').fadeOut(500, () => $('#app-loading-screen').addClass('d-none'));

/**
 * Sets the inner html of the element with the provided id as a card containing the provided tweet informations
 * 
 * @param {String} parentId 
 * @param {Object} tweet 
 */
const displayTweet = (parentId, { id: tweetId, text, author_id, created_at }) => {

    $('#' + parentId).html(`
        <div class="card h-100 text-center">
            <div class="card-header">
                Tweet ${tweetId}
            </div>
            <div class="card-body">
                <p id="st-tweet-text" class="card-text">${text}</a>
            </div>
            <div class="card-footer text-muted">
                Created at: ${luxon.DateTime.fromISO(created_at).toFormat('hh:mm:ss dd-LL-yyyy')} from user ${author_id}
            </div>
        </div>
    `);

}

// Wait till the document is fully loaded
$(function() {

    // Verifies if the user is into the app page
    if(window.location.pathname !== '/app') return;

    // Enabling toasts close button
    toastr.options.closeButton = true;

    Tweets.pickOne()
        .then((tweet) => displayTweet('st-tweet-container', tweet))
        .catch((error) => toastr.error(error.message))
        .finally(() => hideAppLoadingScreen())

    // Sets the skip tweet classification button functionality
    const skipTweet = $('#st-skip-tweet-classification-button');
    skipTweet.click(() => {

        // Disabling the button while it loads the next tweet
        skipTweet.attr('disabled', 'true');
        skipTweet.html("<span class='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>");

        // Gets the tweet
        Tweets.pickOne()
            // Sets the tweet into the page
            .then((tweet) => displayTweet('st-tweet-container', tweet))
            // Tost the error
            .catch((error) => toastr.error(error.message))
            // Reset the skip button to be usable
            .finally(() => {
                skipTweet.removeAttr('disabled');
                skipTweet.html("<i class=\"fas fa-forward\"></i> Skip");
                $("textarea[name=st-selected-text]").val('')
            })

    })

    // Sets the classification form behavior
    $('#st-classification-form').on('submit', (event) => {

        // Prevents the form to be submitted in the "standard" way
        event.preventDefault();

        // Sets the submit button on loading
        let classificationSubmitButton = $('#st-classification-form-submit-button')
        classificationSubmitButton.attr('disabled', 'true');
        classificationSubmitButton.html("<span class='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>");

        // Sends the request to the
        fetch('/api/classifier/learn', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: $("textarea[name=st-selected-text]").val(), category: $("input[name=st-radio-classification]").val() })
        })
        // Computes the response
        .then(async (response) => {
            let data = await response.json();
            if(response.status >= 300) return toastr.error(data.message);
            toastr.success(data.message);
            skipTweet.trigger('click');
            $('#st-classification-form').trigger('reset');
        })
        // Error Handling
        .catch((error) => toastr.error("Unknown error."))
        .finally(() => {
            classificationSubmitButton.removeAttr('disabled');
            classificationSubmitButton.html("Submit");
        })

    })

    document.addEventListener('selectionchange', () => {

        // Sets the tweet selected text into the selected text input
        if($(window.getSelection().anchorNode.parentElement).attr('id') === 'st-tweet-text') {
            let val = window.getSelection().toString();
            if(val) $('#st-selected-text-input').val(val);
        }
            

    });
        
    

})