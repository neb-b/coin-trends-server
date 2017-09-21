const fetch = require("node-fetch");

const BASE_URL = 'https://coinbin.org'

exports.fetchPrice = (token) => {
  return fetch(`${BASE_URL}/${token}`)
    .then((res) => res.json())
}
