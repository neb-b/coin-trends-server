const redis = require("redis")
const bluebird = require('bluebird')

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const REDIS_CONFIG = {};
const redisClient = redis.createClient(REDIS_CONFIG);

exports.pushTweetCount = (token, tweetCount) => {
  const redisKey = `${token}-tweetCounts`
  console.log('updating', redisKey);

  redisClient.lpushAsync([redisKey, tweetCount])
    .then((response) => {
      console.log(`success - ${token} tweet count push`, response);
    })
    .catch((err) => {
      console.log('redis err', err);
    })
}

exports.pushCoinPrice = (token, priceUSD) => {
  const redisKey = `${token}-usd`
  console.log('updating', redisKey);

  redisClient.lpushAsync([redisKey, priceUSD])
    .then((response) => {
      console.log(`success - ${token} usd push`, response);
    })
    .catch((err) => {
      console.log('redis err', err);
    })
}

exports.getTrends = (tokens) => {
  return redisClient.multi()
    .lrange('btc-usd', 0, -1)
    .lrange('btc-tweetCounts', 0, -1)
    .lrange('eth-usd', 0, -1)
    .lrange('eth-tweetCounts', 0, -1)
    .execAsync()
    .then((redisResults) => {
      const btcTrendsArr = redisResults.slice(0,2)
      const ethTrendsArr = redisResults.slice(2,4)

      const btcTrendsObj = {
        priceHistory: btcTrendsArr[0],
        tweetCountHistory: btcTrendsArr[1]
      }

      const ethTrendsObj = {
        priceHistory: ethTrendsArr[0],
        tweetCountHistory: ethTrendsArr[1]
      }

      return { btc: btcTrendsObj, eth: ethTrendsObj }
    })
}
