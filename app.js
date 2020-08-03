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

// The echo command simply echoes on command
app.command("/todo", async ({ command, ack, say }) => {
    // Acknowledge command request
    await ack();

    try {
        // CREATE RECORD
        const record = {
            TODO: command.text,
        };

        createRecord(base, record);

        await say({
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `Added *${command.text}* to AirTable :heavy_check_mark:`,
                    },
                },
            ],
        });
    } catch (error) {
        console.log(`Error while creating todo -- ${error}`);

        await say(`Error while creating todo`);
    }
});

// The echo command simply echoes on command
app.command("/todos", async ({ command, ack, say }) => {
    // Acknowledge command request
    await ack();

    let todos = await readRecord(base);

    let blocks = [];

    todos.forEach((todo, index) => {
        if (index !== 0) {
            blocks.push({
                type: "divider",
            });
        }
        blocks.push({
            type: "section",
            text: {
                type: "mrkdwn",
                text: todo.todo,
            },
            accessory: {
                type: "button",
                text: {
                    type: "plain_text",
                    text: "Done",
                },
                action_id: `btn`,
                value: todo.id,
            },
        });
    });

    await say({
        blocks: blocks,
    });
});

app.action("btn", async ({ body, ack, say }) => {
    // Acknowledge the action
    await ack();
    try {
        let todoId = body.actions[0].value;
        console.log(body.actions[0]);

        // await deleteRecord(base, todoId);

        await say({
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `Removed *${todoId}* from AirTable :heavy_check_mark:`,
                    },
                },
            ],
        });
    } catch (error) {
        console.log("Error while attempting to delete TODO.");
    }
});

(async () => {
    // Start the app
    await app.start(process.env.PORT || 3000);

    console.log("⚡️ Bolt app is running!");
})();

// https://api.slack.com/legacy/message-buttons
