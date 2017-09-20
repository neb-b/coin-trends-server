const { send } = require('micro')
const moment = require('moment')
const {fetchTweets} = require("./src/twitter");
const redis = require("./src/redis");
const config = require('./config/config')

const fetchCoinTrends = ({ token, name }) => {
  // fetch coin trends for last 10 minutes
  const TIME_WINDOW_MINUTES = 10;
  const date = moment().subtract(TIME_WINDOW_MINUTES, 'm').toISOString();

  Promise.all([
    // make two seperate fetchTweets calls because Twitter maxes at 100 repsonse
    fetchTweets(token, date),
    fetchTweets(name, date)
  ])
  .then((tweetCountArr) => {
    const tweetCount = tweetCountArr.reduce((count, val) => count + val)

    return { token, tweetCount }
  })
  .then((coinTweet) => redis.pushTweetCount(coinTweet))
  .catch((err) => {
    console.log('err', err);
  })
}

// fetch for infinity
config.coins.forEach((coin) => {

  //TODO fetches spaced out? that might help rate limiting

  const fetchInterval = 1000 * 5 * 2 // 180 request / 15 min = 300 sec/request * 2 because 2 requests

  setInterval(() => fetchCoinTrends(coin), fetchInterval)
})

module.exports = (req, res) => {
  const tokens = config.coins.map(({ token }) => token)

  redis.getTrends(tokens)
    .then((trends) => send(res, 200, trends))
    .catch((err) => {
      console.log('trends err', err);
      send(res, 500, err)
    })
}
