/**
 * Util Functions
 */

/**
 * Sets the provided jQuery selected button disabled and shows a loading ui
 * 
 * @param {Object} jQueryObject 
 */
 const setButtonInLoadingState = (jQueryObject) => {
    jQueryObject.attr('disabled', 'true');
    jQueryObject.html(`<span class="d-none">${jQueryObject.html()}</span><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`);
}

/**
 * Sets the provided jQuery selected button enabled and restore the default content
 * Should only be called after the setButtonInLoadingState function
 * 
 * @param {Object} jQueryObject 
 */
const setButtonInNotLoadingState = (jQueryObject) => {
    jQueryObject.removeAttr('disabled');
    jQueryObject.html($(jQueryObject.children('span')[0]).html());
}