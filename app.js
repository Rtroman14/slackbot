require("dotenv").config();

const { App } = require("@slack/bolt");

const app = new App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
});

/* Add functionality here */

// Listens to incoming messages that contain "hello"
app.message("hello", async ({ message, say }) => {
    // say() sends a message to the channel where the event was triggered
    await say(`Hey there <@${message.user}>!`);
});

(async () => {
    // Start the app
    await app.start(process.env.PORT || 3000);

    console.log("⚡️ Bolt app is running!");
})();

// https://slack-airtable-todo.herokuapp.com/
// https://slack.dev/bolt-js/tutorial/getting-started
// https://github.com/mattcreager/starbot/blob/master/src/index.js
