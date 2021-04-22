/**
 * Functions
 */

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

/**
 * Initializes the Simple Training tab
 */
const initSimpleTraining = () => {

    // Gets the tweet and shows it into the Simple Training tweet container
    Tweets.pickOne()
        .then((tweet) => displayTweet('st-tweet-container', tweet))
        .catch((error) => toastr.error(error.message))
        .finally(() => hideAppLoadingScreen());

    // Sets the skip tweet classification button functionality
    $('#st-skip-tweet-classification-button').click(function(event) {

        // Disabling the button while it loads the next tweet
        $(this).attr('disabled', 'true');
        $(this).html("<span class='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>");

        // Gets the tweet
        Tweets.pickOne()
            // Sets the tweet into the page
            .then((tweet) => displayTweet('st-tweet-container', tweet))
            // Toast the error
            .catch((error) => toastr.error(error.message))
            // Reset the skip button to be usable and resets the selected text input textarea
            .finally(() => {
                $(this).removeAttr('disabled');
                $(this).html("<i class=\"fas fa-forward\"></i> Skip");
                $("textarea[name=st-selected-text]").val('');
            });

    });

    // Sets the classification form behavior
    $('#st-classification-form').on('submit', function(event) {

        // Prevents the form to be submitted in the "standard" way
        event.preventDefault();

        // Sets the submit button on loading
        let classificationSubmitButton = $('#st-classification-form-submit-button');
        classificationSubmitButton.attr('disabled', 'true');
        classificationSubmitButton.html("<span class='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>");

        // Sends the request to the
        fetch('/api/classifier/learn', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: $("textarea[name=st-selected-text]").val(), category: $("input[name=st-radio-classification]:checked").val() })
        })
            // Computes the response
            .then(async (response) => {
                // Reads the response content as a JSON
                let data = await response.json();
                // Checks if the request has been completed without errors
                if(response.status >= 300) return toastr.error(data.message);
                // Notifies the user, resets the form and goes to the next tweet
                toastr.success(data.message);
                $('#st-skip-tweet-classification-button').trigger('click');
                $(this).trigger('reset');
            })
            // Error Handling
            .catch((error) => toastr.error("Unknown error."))
            .finally(() => {
                classificationSubmitButton.removeAttr('disabled');
                classificationSubmitButton.html("Submit");
            });

    });

    // Sets the listener on text selection inside the tweet card
    document.addEventListener('selectionchange', () => {

        // Sets the tweet selected text into the selected text input
        if(window.getSelection && window.getSelection().anchorNode && $(window.getSelection().anchorNode.parentElement).attr('id') === 'st-tweet-text') {
            let val = window.getSelection().toString();
            if(val) $('#st-selected-text-input').val(val);
        }

    });

}

/**
 * Loads a tweet and the classifier choosen category for that tweet
 * 
 * @returns {Promise}
 */
const loadNewGuidedTrainingTweet = () => {

    return new Promise((resolve, reject) => {

        // Gets the tweet
        Tweets.pickOne().then((tweet) => {

            // Gets the classification for the tweet
            fetch('/api/classifier/categorize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: tweet.text })
            })
            .then(async (response) => {

                // Parses the response as a JSON
                let data = await response.json();
                // Verifies if the request has been completed succesfully
                if(response.status >= 300) return reject(new Error(data.message));

                resolve({...data, tweet });
        
            })
            .catch((error) => reject(error));

        })
        .catch((error) => reject(error));

    })

}

/**
 * Initializes the content of the Guided Training Tab
 */
const initGuidedTraining = () => {

    // Removes the click listener which is going to be resetted below
    $('#gt-skip-tweet-classification-button').off('click');

    // Sets the skip tweet classification button functionality
    $('#gt-skip-tweet-classification-button').click(function(event) {

        // Sets the UI Loading
        $(this).attr('disabled', true);
        $(this).html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>");

        // Loads the tweet and the classification
        loadNewGuidedTrainingTweet()
            .then(({ classifications, tweet }) => {

                // Creates and insert into the dom the tweet card
                displayTweet('gt-tweet-container', tweet);
                // Sets the classifier choosen category data
                $('#gt-classification-tweet-category').html(classifications[0].label);
                let percentage = $('#gt-classification-tweet-percentage');
                let pValue = Math.round(classifications[0].value * 100);
                percentage.attr('style', `width: ${pValue}%`);
                percentage.attr('aria-valuenow', pValue);
                percentage.html(pValue + "%");

                // Shows the row
                $('#gt-row').removeClass('d-none');

            })
            // Notifies the user of the error
            .catch((error) => toastr.error(error.message))
            // Sets the skip button to be usable
            .finally(() => {
                $(this).removeAttr('disabled');
                $(this).html("<i class=\"fas fa-forward\"></i> Skip");
            });

    });

    // Loads the tweet data
    $('#gt-skip-tweet-classification-button').trigger('click');

}

/**
 * App Logic
 */

// Wait till the document is fully loaded
$(function() {

    // Verifies if the user is into the app page
    if(window.location.pathname !== '/app') return;

    // Enabling toasts close button
    toastr.options.closeButton = true;

    // Initializes the Simple Training Tab content
    initSimpleTraining();

    // Sets a click listener on the Guided Training tab which initializes the tab content
    $('#pills-guided-training-tab').click(() => {
        // Initializes the Guided Training Tab content
        initGuidedTraining();
    })

})