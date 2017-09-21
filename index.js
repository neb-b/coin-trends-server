const { send } = require('micro')
const moment = require('moment')
const { fetchTweets } = require("./src/twitter");
const { fetchPrice, pushCoinPrice } = require('./src/coin')
const redis = require("./src/redis");
const config = require('./config/config')

// the time window for everything - i don't know if it needs to be that way
// update results every 1 minute
// tweets in last 1 minute
const TIME_WINDOW_MINUTES = 5;
const TWITTER_TIME_WINDOW_MINUTES = 5;

const fetchCoinTrends = ({ token, name }) => {
  // fetch coin trends for last 10 minutes
  const date = moment().subtract(TWITTER_TIME_WINDOW_MINUTES, 'm').toISOString();

  const newRedisValues = {}

  Promise.all([
    // make two seperate fetchTweets calls because Twitter maxes at 100 repsonse
    fetchTweets(token, date),
    fetchTweets(name, date),
    fetchPrice(token)
  ])
  .then((promises) => {
    const results = promises.slice(0, 2);
    const tweetCount = results.reduce((count, val) => count + val)

    const { coin: { usd } } = promises[2];

    newRedisValues.price = usd;
    newRedisValues.tweetCount = tweetCount;
  })
  .then((coinTweet) => redis.pushTweetCount(token, newRedisValues.tweetCount))
  .then(() => redis.pushCoinPrice(token, newRedisValues.price))
  // .then(() => broadcastNewValues(newRedisValues))
  .catch((err) => {
    console.log('err', err);
  })
}

// fetch for infinity
config.coins.forEach((coin) => {

  //TODO fetches spaced out? that might help rate limiting
  //currently ... fetch fetch ............... fetch fectch
  //ideal ... fetch ... fetch ... fetch ... fetch

  const fetchInterval = 1000 * 60 * TIME_WINDOW_MINUTES;

  setInterval(() => fetchCoinTrends(coin), fetchInterval)
})

fetchCoinTrends(config.coins[1])

module.exports = (req, res) => {
  const tokens = config.coins.map(({ token }) => token)

  redis.getTrends(tokens)
    .then((trends) => send(res, 200, trends))
    .catch((err) => {
      console.log('trends err', err);
      send(res, 500, err)
    })
}
