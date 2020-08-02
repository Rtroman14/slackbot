require("dotenv").config();

const { App } = require("@slack/bolt");
const Airtable = require("airtable");

const readRecord = require("./src/readRecord");
const createRecord = require("./src/createRecord");
const updateRecord = require("./src/updateRecord");
const deleteRecord = require("./src/deleteRecord");

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base("appuT8iZkPUprzCaI");

const app = new App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
});

/* Add functionality here */

// Listens to incoming messages that contain "hello"
app.message("hello", async ({ message, say }) => {
    // say() sends a message to the channel where the event was triggered
    await say({
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `Hey there <@${message.user}>!`,
                },
                accessory: {
                    type: "button",
                    text: {
                        type: "plain_text",
                        text: "Click Me",
                    },
                    action_id: "button_click",
                },
            },
        ],
        text: `Hey there <@${message.user}>!`,
    });
});

app.action("button_click", async ({ body, ack, say }) => {
    // Acknowledge the action
    await ack();
    await say(`<@${body.user.id}> clicked the button`);
});

// The echo command simply echoes on command
app.command("/todo", async ({ command, ack, say }) => {
    // Acknowledge command request
    await ack();

    // CREATE RECORD
    const record = {
        TODO: command.text,
    };

    createRecord(base, "TODO", record);

    await say(`Added "${command.text}" to AirTable`);
});

(async () => {
    // Start the app
    await app.start(process.env.PORT || 3000);

    console.log("⚡️ Bolt app is running!");
})();

// https://slack-airtable-todo.herokuapp.com/
// https://slack.dev/bolt-js/tutorial/getting-started
// https://github.com/mattcreager/starbot/blob/master/src/index.js
// https://slack.dev/bolt-js/concepts#commands
