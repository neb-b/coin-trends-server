const redis = require("redis")
const bluebird = require('bluebird')

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const REDIS_CONFIG = {};
const redisClient = redis.createClient(REDIS_CONFIG);

exports.pushTweetCount = ({ token, tweetCount }) => {
  const redisKey = `${token}-tweetCounts`
  console.log('updating', redisKey);

  redisClient.lpushAsync([redisKey, tweetCount])
    .then((response) => {
      console.log('success - tweetListLength: ', response);
    })
    .catch((err) => {
      console.log('redis err', err);
    })
}

exports.getTrends = (tokens) => {
  return redisClient.multi()
    .lrange('btc-tweetCounts', 0, -1)
    .lrange('eth-tweetCounts', 0, -1)
    .execAsync()
    .then((redisTweetCounts) => {
      const ethTweetCount = redisTweetCounts[0]
      const btcTweetCount = redisTweetCounts[1]

      return { ethTweetCount, btcTweetCount }
    })
}
