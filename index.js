'use strict';
const line = require('@line/bot-sdk'),
  express = require('express'),
  axios = require('axios'),
  configGet = require('config');
const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");

// Line config
const configLine = {
  channelAccessToken: configGet.get("CHANNEL_ACCESS_TOKEN"),
  channelSecret: configGet.get("CHANNEL_SECRET")
};

// Azure Text Sentiment
const endpoint = configGet.get("ENDPOINT");
const apiKey = configGet.get("TEXT_ANALYTICS_API_KEY");

// create LINE client
const client = new line.Client(configLine);
const app = express();

const port = process.env.PORT || process.env.port || 3001;

app.listen(port, () => {
  console.log(`listening on ${port}`);
});

async function MS_TextSentimentAnalysis(thisEvent) {
  console.log("[MS_TextSentimentAnalysis] in");
  const analyticsClient = new TextAnalyticsClient(endpoint, new AzureKeyCredential(apiKey));
  let documents = [];
  documents.push(thisEvent.message.text);
  const results = await analyticsClient.analyzeSentiment(documents, "zh-hant", {
    includeOpinionMining: true
  });
  console.log("[results] ", JSON.stringify(results));
  // Save to JSON Server
  let newData = {
    "sentiment": results[0].sentiment,
    "confidenceScore": results[0].confidenceScores[results[0].sentiment],
    "opinionText": ""
  };

  if (results[0].sentences[0].opinions.length != 0) {
    newData.opinionText = results[0].sentences[0].opinions[0].target.text;
  }

  const echo = {
    type: 'text',
    text: `${newData.opinionText}的評價為 ${newData.sentiment}，信心指數: ${newData.confidenceScore}`
  };

  let axios_add_data = {
    method: "post",
    url: "https://camellia-20230510.azurewebsites.net/review",
    headers: {
      "content-type": "application/json"
    },
    data: newData
  };

  axios(axios_add_data)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function () {
      console.log("Error!!");
    });

  return client.replyMessage(thisEvent.replyToken, echo);
}

app.post('/callback', line.middleware(configLine), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  MS_TextSentimentAnalysis(event)
    .catch((err) => {
      console.error("Error:", err);
    });
}