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
    try {
        // Acknowledge command request
        await ack();
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

// Listen for a slash command invocation
app.command("/todos", async ({ ack, body, context }) => {
    // Acknowledge the command request
    await ack();

    let blocks = [];

    try {
        let todos = await readRecord(base);

        for (let i = 0; i < 5; i++) {
            blocks.push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: todos[i].todo,
                },
                accessory: {
                    type: "button",
                    text: {
                        type: "plain_text",
                        text: "Done!",
                    },
                    action_id: `todoDone`,
                    value: todos[i].id,
                },
            });
            blocks.push({
                type: "divider",
            });
            if (i === 4) {
                blocks.push({
                    type: "input",
                    element: {
                        type: "plain_text_input",
                    },
                    label: {
                        type: "plain_text",
                        text: "Add TODO",
                        emoji: true,
                    },
                });
            }
        }
    } catch (error) {
        console.log("Error retrieving TODOs from AirTable ---", error);
    }

    try {
        const result = await app.client.views.open({
            token: context.botToken,
            // Pass a valid trigger_id within 3 seconds of receiving it
            trigger_id: body.trigger_id,
            // View payload
            view: {
                type: "modal",
                // View identifier
                callback_id: "view_1",
                title: {
                    type: "plain_text",
                    text: "TODO List",
                },
                blocks: blocks,
                submit: {
                    type: "plain_text",
                    text: "Submit",
                },
            },
        });
        console.log(result);
    } catch (error) {
        console.error(error);
    }
});

// Listen for a button invocation with action_id `todoDone` (assume it's inside of a modal)
app.action("todoDone", async ({ ack, body, context }) => {
    // Acknowledge the button request
    await ack();

    try {
        const result = await app.client.views.update({
            token: context.botToken,
            // Pass the view_id
            view_id: body.view.id,
            // View payload with updated blocks
            view: {
                type: "modal",
                // View identifier
                callback_id: "view_1",
                title: {
                    type: "plain_text",
                    text: "TODO Done!",
                },
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "plain_text",
                            text: "Way to go!!",
                        },
                    },
                    {
                        type: "image",
                        image_url: "https://media.giphy.com/media/SVZGEcYt7brkFUyU90/giphy.gif",
                        alt_text: "Yay! The modal was updated",
                    },
                ],
            },
        });
        console.log(result);
    } catch (error) {
        console.error(error);
    }
});

app.action("btn", async ({ body, ack, say }) => {
    // Acknowledge the action
    try {
        await ack();
        let todoId = body.actions[0].value;
        console.log(body.actions[0]);

        // await deleteRecord(base, todoId);

        await say({
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `Removed "*${todoId}*" from AirTable :heavy_check_mark:`,
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
// https://slack.dev/bolt-js/concepts#creating-modals
