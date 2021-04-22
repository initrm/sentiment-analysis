// Requests to Twitter API
const axios = require('axios');
// Router
const express = require('express');
// Naive-Bayes Classifier 
var BayesClassifier = require('bayes-classifier');
// File System 
const fs = require('fs');
// Path Creation
const path = require('path');

// Initializes the router
const router = new express.Router();

// Path to the file which contains the bayes configuration
const bayesConfigPath = path.join(__dirname, './../../data/bayes-config.json');
const dataPath = path.join(__dirname, './../../data');

// Parses the incoming requests body as a JSON
router.use(express.json());

// Serves a JSON array containing the latest tweets which talks about the popular trends in NYC area
router.get('/api/tweets', async (req, res) => {

    // Retrieves public trends on Twitter right now in New York City area
    try {
        var trends = (await axios({
            url: 'https://api.twitter.com/1.1/trends/place.json?id=2459115',
            headers: {
                'authorization': 'Bearer ' + process.env.TWITTER_BEARER_TOKEN
            }
        })).data[0].trends;
    }
    catch(error) {
        return res.status(503).send({ message: "Unable to retrieve trends from Twitter." });
    }

    // Creates the query string to pass to the twitter api to retrieve last tweets based on the popular trends
    let queryString = trends.map((trend) => trend.name.includes(' ') ? `"${trend.name}"` : trend.name ).join(' OR ');
    // Removes some trends to do not let the query string exceed the 512 chars limit of the api
    while(`(${queryString}) -is:reply -is:retweet lang:en`.length > 512) queryString = queryString.substring(0, queryString.lastIndexOf(' OR '));
    // Completes the query with the desired lang of the tweets
    queryString = `(${queryString}) -is:reply -is:retweet lang:en`;

    // Retrieves the latest tweets that match the trends
    try {
        var tweets = (await axios({
            method: 'get',
            url: 'https://api.twitter.com/2/tweets/search/recent',
            headers: {
                'authorization': 'Bearer ' + process.env.TWITTER_BEARER_TOKEN
            },
            params: {
                query: queryString,
                max_results: 100
            }
        })).data.data;
        
    }
    catch(error) {
        return res.status(503).send({ message: "Unable to retrieve latest Tweets from Twitter." });
    }

    // Retrieves the latests tweets with the complete text
    try {
        var scoopedTweets = (await axios({
            method: 'get',
            url: 'https://api.twitter.com/2/tweets',
            headers: {
                'authorization': 'Bearer ' + process.env.TWITTER_BEARER_TOKEN
            },
            params: {
                ids: tweets.map((tweet) => tweet.id).join(','),
                'tweet.fields': 'text,created_at',
                'expansions': 'author_id'
            }
        })).data.data;
    }
    catch(error) {
        return res.send({ message: "Unable to retrieve latest fulll text Tweets from Twitter." })
    }

    // Ritorno i tweet ottenuti
    return res.send(scoopedTweets)

})

// Instructs the Bayes classifier with the submitted text associated to the provided classification
router.post('/api/classifier/learn', async (req, res) => {

    // Accepted classifications
    const acceptedClassifications = [ 'positive', 'negative', 'nature', 'finance', 'politic' ];

    // Checks if all data have been correctly provided
    if(typeof(req.body.text) !== 'string' || req.body.text.length < 4 || typeof(req.body.category) !== 'string' || !acceptedClassifications.includes(req.body.category))
        return res.status(400).send({ message: "One or more needed data are missing or invalid." });

    // Creates the bayes
    let classifier = new BayesClassifier();
    if(fs.existsSync(bayesConfigPath)) classifier.restore(JSON.parse(fs.readFileSync(bayesConfigPath)));

    // Instructs the bayes classifier with the received data
    classifier.addDocument(req.body.text, req.body.category);
    classifier.train();

    // Saves the classifier state
    if(!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);
    fs.writeFileSync(bayesConfigPath, JSON.stringify(classifier), { flag: "w" });

    // Returns the success of the operation
    return res.send({ message: "Succesfully learned." });

})

// Serves a Json containing the category which the classifier identified the provided text belongs to
router.post('/api/classifier/categorize', async (req, res) => {

    // Checks if all data have been correctly provided
    if(typeof(req.body.text) !== 'string' || req.body.text.length < 4)
        return res.status(400).send({ message: "One or more needed data are missing or invalid." });

    // Creates the bayes
    if(!fs.existsSync(bayesConfigPath)) return res.status(400).send({ message: "The classifier has no data, retry when you trained the classifier a little bit." });
    let classifier = new BayesClassifier();
    classifier.restore(JSON.parse(fs.readFileSync(bayesConfigPath)));

    // Classify the text
    let classifications = classifier.getClassifications(req.body.text);

    // Returns the success of the operation
    return res.send({ classifications });

})

// Completely erase the Bayes classifier
router.post('/api/classifier/reset', async (req, res) => {

    // Verifies if the bayes configuration file exists and deletes it
    if(fs.existsSync(bayesConfigPath)) fs.unlinkSync(bayesConfigPath);

    // Verifies if the bayes configuration dir exists and deletes it
    if(fs.existsSync(dataPath)) fs.rmdirSync(dataPath);

    // Returns the success of the operation
    return res.send()

})

// Esporto il router contenente le api
module.exports = { apiRouter: router }