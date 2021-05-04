/**
 * Settings Logic
 */

// Wait till the document is fully loaded
$(function() {

    // Verifies if the user is into the app page
    if(window.location.pathname !== '/settings') return;

    // Enabling toasts close button
    toastr.options.closeButton = true;

    $('#clear-tweets-cache-button').click(() => {
        // Clears the local storage
        localStorage.clear();
        // Notifies the user about the successfully operation
        toastr.success("Tweets Cache successfully cleaned up.");
    });

    // Grabs the modal
    let eraseClassifierModal = new bootstrap.Modal(document.getElementById('reset-classifier-modal'), { keyboard: false });

    // Grabs then open modal button
    let eraseClassifierOpenModalButton = $('#erase-classifier-memory-open-modal-button');

    $('#erase-classifier-memory-button').click(() => {

        // Hides the modal
        eraseClassifierModal.hide()
        // Sets the ui loading
        setButtonInLoadingState(eraseClassifierOpenModalButton)

        // Resets the classifier
        Classifier.reset()
            // Notifies the user about the result of the operation
            .then(({ message }) => toastr.success(message))
            .catch((error) => toastr.error(error.message))
            // Reset the button to be usable
            .finally(() => setButtonInNotLoadingState(eraseClassifierOpenModalButton))
        
    })

})