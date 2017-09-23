const firebase = require("firebase");

if (!firebase.apps.length) {
  // eh i'll make a new app once this sort of works
  firebase.initializeApp({
    apiKey: "AIzaSyAZoMg2GRrrJ3eA1s-DenvusisuTe479DI",
    authDomain: "coin-trends.firebaseapp.com",
    databaseURL: "https://coin-trends.firebaseio.com",
    projectId: "coin-trends",
    messagingSenderId: "469995805611"
  });
}

const database = firebase.database();

exports.addTrendDataPoint = dataPointValues => {
  const token = dataPointValues.token;
  delete dataPointValues.token;

  const ref = database.ref(token);

  ref.once("value").then(snapshot => {
    const trends = snapshot.val() || {};
    const newTrends = Object.assign({}, trends, {
      [dataPointValues.time]: dataPointValues
    });
    console.log("adding trend point");
    ref.set(newTrends);
  });
};
