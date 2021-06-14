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
const displayTweet = (parentId, { id: tweetId, text, author_id, created_at }, idPrefix) => {

    $('#' + parentId).html(`
        <div class="card h-100 text-center">
            <div class="card-header">
                Tweet ${tweetId}
            </div>
            <div class="card-body">
                <p id="${idPrefix}-tweet-text" class="card-text">${text}</a>
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
        .then((tweet) => displayTweet('st-tweet-container', tweet, 'st'))
        .catch((error) => toastr.error(error.message))
        .finally(() => hideAppLoadingScreen());

    // Sets the skip tweet classification button functionality
    $('#st-skip-tweet-classification-button').click(function(event) {

        // Disabling the button while it loads the next tweet
        setButtonInLoadingState($(this));

        // Gets the tweet
        Tweets.pickOne()
            // Sets the tweet into the page and resets the input which displays the selected text and the classification form
            .then((tweet) => {
                displayTweet('st-tweet-container', tweet, 'st');
                $("textarea[name=st-selected-text]").val('');
                $('#st-classification-form').trigger('reset');
            })
            // Toast the error
            .catch((error) => toastr.error(error.message))
            // Reset the skip button to be usable and resets the selected text input textarea
            .finally(() => setButtonInNotLoadingState($(this)));

    });

    // Sets the classification form behavior
    $('#st-classification-form').on('submit', function(event) {

        // Prevents the form to be submitted in the "standard" way
        event.preventDefault();

        // Sets the submit button on loading
        let classificationSubmitButton = $('#st-classification-form-submit-button');
        setButtonInLoadingState(classificationSubmitButton);

        // Submit the new classification
        Classifier.learn($("textarea[name=st-selected-text]").val(), $("input[name=st-radio-classification]:checked").val())
            .then((message) => {

                // Notifies the user and goes to the next tweet
                toastr.success(message);
                $('#st-skip-tweet-classification-button').trigger('click');

            })
            // Notifies the user about the error
            .catch((error) => toastr.error(error.message))
            // Resets the button
            .finally(() => setButtonInNotLoadingState(classificationSubmitButton));
            
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
const loadTweetAndClassification = () => {

    return new Promise((resolve, reject) => {

        // Gets the tweet
        Tweets.pickOne().then((tweet) => {

            // Gets the category for the tweet
            Classifier.categorize(tweet.text)
                // Returns tweet and category
                .then((data) => resolve({...data, tweet }))
                // Returns the error
                .catch((error) => reject(error));

        })
        .catch((error) => reject(error));

    })

}

/**
 * Initializes the content of the Guided Training Tab
 */
const initGuidedTraining = () => {

    // Removes the click listener which is going to be resetted below since switching the tabs will althought set more click listeners
    $('#gt-skip-tweet-classification-button').off('click');
    $('#gt-confirm-choosen-category-button').off('click');
    $('.gt-change-choosen-category-btn-option').off('click');

    // Sets the click listeners for the classification
    $('#gt-confirm-choosen-category-button').click(function(event) {

        // Sets the button in a loading state
        setButtonInLoadingState($(this));
        
        // Sends the request to learn the classification because it is correct
        Classifier.learn($('#gt-tweet-text').html(), $('#gt-classification-tweet-category').html())
            .then((message) => {
                
                // Notifies the user that the operation has been completed succesfully
                toastr.success(message);
                // Goes to the next tweet
                $('#gt-skip-tweet-classification-button').trigger('click');

            })
            // Notifies the user about the error
            .catch((error) => toastr.error(error.message))
            // Reset the button to be clickable
            .finally(() => setButtonInNotLoadingState($(this)));

    });
    $('.gt-change-choosen-category-btn-option').click(function(event) {

        // Gets the dropdown button and sets it in a loading state
        let mainButton = $('#gt-change-choosen-category-button');
        setButtonInLoadingState(mainButton);

        // Sends the request to learn the right classification
        Classifier.learn($('#gt-tweet-text').html(), $(this).attr('data-value'))
            .then((message) => {
                
                // Notifies the user that the operation has been completed succesfully
                toastr.success(message);
                // Goes to the next tweet
                $('#gt-skip-tweet-classification-button').trigger('click');

            })
            // Notifies the user about the error
            .catch((error) => toastr.error(error.message))
            // Reset the button to be clickable
            .finally(() => setButtonInNotLoadingState(mainButton));
        
    });

    // Sets the skip tweet classification button functionality
    $('#gt-skip-tweet-classification-button').click(function(event) {

        // Sets the UI Loading
        setButtonInLoadingState($(this));

        // Loads the tweet and the classification
        loadTweetAndClassification()
            .then(({ classifications, tweet }) => {

                // Creates and insert into the dom the tweet card
                displayTweet('gt-tweet-container', tweet, 'gt');
                // Sets the classifier choosen category data
                $('#gt-classification-tweet-category').html(classifications[0].label);
                let percentage = $('#gt-classification-tweet-percentage');
                let pValue = (classifications[0].value * 100).toFixed(2);
                percentage.attr('style', `width: ${pValue}%`);
                percentage.attr('aria-valuenow', pValue);
                percentage.html(pValue + "%");

                // Shows the row
                $('#gt-row').removeClass('d-none');

            })
            // Notifies the user of the error
            .catch((error) => toastr.error(error.message))
            // Sets the skip button to be usable
            .finally(() => setButtonInNotLoadingState($(this)));

    });

    // Loads the tweet data
    $('#gt-skip-tweet-classification-button').trigger('click');

}

/**
 * Initializes the content of the Automatic Classification Tab
 */
const initAutomaticClassification = () => {

    // Removes the click listener which is going to be resetted below since switching the tabs will althought set more click listeners
    $('#ac-next-tweet-classification-button').off('click');

    // Sets the next tweet automatic classification button functionality
    $('#ac-next-tweet-classification-button').click(function(event) {

        // Sets the UI Loading
        setButtonInLoadingState($(this));

        // Loads the tweet and the classification
        loadTweetAndClassification()
            .then(({ classifications, tweet }) => {

                // Creates and insert into the dom the tweet card
                displayTweet('ac-tweet-container', tweet, 'ac');
                // Sets the classifier choosen category data
                $('#ac-classification-tweet-category').html(classifications[0].label);
                $('#ac-classification-affidability').html((classifications[0].value * 100).toFixed(2));

                // Sets all the values
                $('#ac-classifications-container').empty()
                classifications.forEach((classification, index) => {
                    let percentage = (classification.value * 100).toFixed(2)
                    $('#ac-classifications-container').append(`
                        <p><small>${classification.label.charAt(0).toUpperCase() + classification.label.slice(1)}</small></p>
                        <div class="mb-3 progress">
                            <div 
                                id="ac-classification-tweet-percentage-${index}" 
                                class="progress-bar"
                                role="progressbar" 
                                style="width: ${percentage}%;" 
                                aria-valuenow="${percentage}" 
                                aria-valuemin="0" 
                                aria-valuemax="100">${percentage}%</div>
                        </div>
                    `)
                })

                // Shows the row
                $('#ac-row').removeClass('d-none');

            })
            // Notifies the user of the error
            .catch((error) => toastr.error(error.message))
            // Sets the skip button to be usable
            .finally(() => setButtonInNotLoadingState($(this)));

    });

    // Classifies the next tweet
    $('#ac-next-tweet-classification-button').trigger('click');
    
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

    // Sets a click listener on the Automatic Classification tab which initializes the tab content
    $('#pills-automatic-classification-tab').click(() => {
        // Initializes the Automatic Classification Tab content
        initAutomaticClassification();
    })

})