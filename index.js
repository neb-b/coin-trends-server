const { send } = require("micro");
const moment = require("moment");
const { fetchTweets } = require("./src/twitter");
const { fetchPrice, pushCoinPrice } = require("./src/coin");
const { addTrendDataPoint } = require("./src/firebase");
const config = require("./config/config");

// the time window for everything - i don't know if it needs to be that way
// update results every 1 minute
// tweets in last 1 minute
const TIME_WINDOW_MINUTES = 3;
const TWITTER_TIME_WINDOW_MINUTES = 3;

const fetchCoinTrends = ({ token, name }) => {
  // fetch coin trends for last 10 minutes
  const twitterSearchBeginDate = moment()
    .subtract(TWITTER_TIME_WINDOW_MINUTES, "m")
    .toISOString();

  Promise.all([
    // make two seperate fetchTweets calls because Twitter maxes at 100 repsonse
    fetchTweets(token, twitterSearchBeginDate),
    fetchTweets(name, twitterSearchBeginDate),
    fetchPrice(token)
  ])
    .then(promises => {
      const results = promises.slice(0, 2);
      const tweetCount = results.reduce((count, val) => count + val);
      const { coin: { usd } } = promises[2];

      return { usd, tweetCount, token, time: Date.now() };
    })
    .then(addTrendDataPoint)
    .catch(err => {
      console.log("\nerr", err);
    });
};

// fetch for infinity
config.coins.forEach(coin => {
  //TODO fetches spaced out? that might help rate limiting
  //currently ... fetch fetch ............... fetch fectch
  //ideal ... fetch ... fetch ... fetch ... fetch

  const fetchInterval = 1000 * 60 * TIME_WINDOW_MINUTES;

  setInterval(() => fetchCoinTrends(coin), fetchInterval);
});

fetchCoinTrends(config.coins[0]);
fetchCoinTrends(config.coins[1]);

module.exports = (req, res) => {
  send(res, 200, "OK");
};
