const Twitter = require('twitter')

const twitterClient = new Twitter({
  consumer_key: '1d0mB89rMki6l30FEnNsJb1ha',
  consumer_secret: 'BpJcGfHup3SLG4Kl85ddyLPyKCK3QafYPveCQF9TbRjAmQZN2S',
  access_token_key: '409427707-nPBSFtlQm4YJ5mR9NgZYuA9PP9VdyTgOTDZXExBG',
  access_token_secret: 'xpb7UsHCNtXgfVGlyYnGt2V159ogQaNQmx5Nq3ISTQ0AO'
})


exports.fetchTweets = (term, date) => {
  const query = `${term} since:${date}`

  return new Promise((resolve, reject) => {
    return twitterClient.get('search/tweets', {q: query, count: 500}, (error, tweets) => {
      if (error) return reject(error)

      const { statuses } = tweets;

      return resolve(statuses.length);
    });
  })
}
