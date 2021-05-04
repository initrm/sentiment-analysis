/**
 * OVERVIEW: Classifier Class provides useful methods to iteract with the classifier api
 */
class Classifier {

    /**
     * Calls the api to instruct the classifier with a new text-category association
     * 
     * @param {String} text 
     * @param {String} category 
     * @returns {Promise}
     */
    static learn(text, category) {

        return new Promise((resolve, reject) => {

            // Sends the request to the api to let the classifier learn a new association
            fetch('/api/classifier/learn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, category })
            })
            // Computes the response
            .then(async (response) => {

                // Reads the response content as a JSON
                let data = await response.json();
                // Checks if the request has been completed without errors
                if(response.status >= 300) return reject(new Error(data.message));
                // Returns the data
                resolve(data.message);
                
            })
            // Error Handling
            .catch((error) => reject(new Error("Unknown error.")));

        })

    }

    /**
     * Calls the api to retrieve the classifier classification of the provided text
     * 
     * @param {String} text 
     * @returns {Promise}
     */
    static categorize(text) {

        return new Promise((resolve, reject) => {

            // Sends the request to the api to let the classifier learn a new association
            fetch('/api/classifier/categorize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            })
            // Computes the response
            .then(async (response) => {

                // Reads the response content as a JSON
                let data = await response.json();
                // Checks if the request has been completed without errors
                if(response.status >= 300) return reject(new Error(data.message));
                // Returns the data
                resolve(data);
                
            })
            // Error Handling
            .catch((error) => reject(new Error("Unknown error.")));

        })

    }

    /**
     * Calls the api to reset the classifier
     * 
     * @returns {Promise}
     */
    static reset() {

        return new Promise((resolve, reject) => {

            // Sends the request to the api to let the classifier learn a new association
            fetch('/api/classifier/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
            // Computes the response
            .then(async (response) => {

                // Reads the response content as a JSON
                let data = await response.json();
                // Checks if the request has been completed without errors
                if(response.status >= 300) return reject(new Error(data.message));
                // Returns the data
                resolve(data);
                
            })
            // Error Handling
            .catch((error) => reject(new Error("Unknown error.")));

        })

    }

}