
# Sentiment Analysis

A web application to train a sentiment analyzer which is powered by a Naive Bayes Classifier.

Sentiment Analysis is a project born for the "Web & Mobile Programming" class exam.

## Run Locally

Subscribe to [Twitter](https://twitter.com)

Apply for a [Developer Account](https://developer.twitter.com/en/apply-for-access)

Navigate to the [twitter developer portal dashboard](https://developer.twitter.com/en/portal/dashboard), create a new project and copy the Bearer Token which will be provided to you

Clone the project

```bash
  git clone https://github.com/initrm/sentiment-analysis.git
```

Go to the project directory

```bash
  cd sentiment-analysis
```

Install dependencies

```bash
  npm install
```

Create the config directory

```bash
  mkdir config
```

Create the config.env file

```bash
  touch config/config.env
```

Copy and paste the following lines into the config.env file

```bash
  PORT=3000
  TWITTER_BEARER_TOKEN=<YOUR_TWITTER_BEARER_TOKEN>
```

Change `<YOUR_TWITTER_BEARER_TOKEN>` with the one copied before.

Start the server

```bash
  npm run dev
```

Now the server is up and running on port `3000` (you can change it as you want) and you have access to the web application to train your own Naive Bayes Classifier.

## License

[APACHE 2.0](https://www.apache.org/licenses/LICENSE-2.0)
