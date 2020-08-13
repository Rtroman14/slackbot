require("dotenv").config();

const { App } = require("@slack/bolt");
const Airtable = require("airtable");

const readRecord = require("./src/readRecord");
const createRecord = require("./src/createRecord");
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

        for (let i = 0; i < todos.length; i++) {
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
                        text: ":heavy_check_mark:",
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
                    block_id: "block_input",
                    element: {
                        type: "plain_text_input",
                        action_id: "input_id",
                        placeholder: {
                            type: "plain_text",
                            text: "Add todo here",
                        },
                    },
                    label: {
                        type: "plain_text",
                        text: "What do you need to do?",
                        emoji: true,
                    },
                });
                break;
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
                callback_id: "modal",
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
    } catch (error) {
        console.log(error);
    }
});

// Listen for a button invocation with action_id `todoDone` (assume it's inside of a modal)
app.action("todoDone", async ({ ack, body, context }) => {
    // Acknowledge the button request
    await ack();

    const reactions = [
        "https://media.giphy.com/media/87NS05bya11mg/giphy.gif",
        "https://media.giphy.com/media/Is1O1TWV0LEJi/giphy.gif",
        "https://media.giphy.com/media/doPrWYzSG1Vao/giphy.gif",
        "https://media.giphy.com/media/hVJMypEGoupddzNFM9/giphy.gif",
        "https://media.giphy.com/media/OmGtCYLH9uSd2/giphy.gif",
        "https://media.giphy.com/media/yhekrBGjZhs2I/giphy.gif",
        "https://media.giphy.com/media/3oz8xLAfBkbiO8Xzxe/giphy.gif",
        "https://media.giphy.com/media/BlVnrxJgTGsUw/giphy.gif",
        "https://media.giphy.com/media/RIuHHNa7UgFKo/giphy.gif",
        "https://media.giphy.com/media/xUPGcJaL5ODxniWMNO/giphy.gif",
        "https://media.giphy.com/media/JrvTJ3i6vnyuxanVa2/giphy.gif",
        "https://media.giphy.com/media/rjkJD1v80CjYs/giphy.gif",
        "https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif",
        "https://media.giphy.com/media/3oEdv03JAv74J6KGTS/giphy.gif",
        "https://media.giphy.com/media/ddHhhUBn25cuQ/giphy.gif",
        "https://media.giphy.com/media/aTwppoKsH6mpq/giphy.gif",
        "https://media.giphy.com/media/LMtvnOIzinYp9l2vIH/giphy.gif",
    ];

    var reaction = reactions[Math.floor(Math.random() * reactions.length)];

    try {
        let todoId = body.actions[0].value;

        await deleteRecord(base, todoId);
    } catch (error) {
        console.log("Error while delete todo ---", error);
    }

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
                        type: "image",
                        image_url: reaction,
                        alt_text: "Yay! The modal was updated",
                    },
                ],
            },
        });
        console.log("body -----", body);
    } catch (error) {
        console.log(error);
    }
});

// Handle a view_submission event
app.view("modal", async ({ ack, body, view, context }) => {
    // Acknowledge the view_submission event
    await ack();

    let inputVal = body.view.state.values.block_input.input_id.value;

    // CREATE RECORD
    const record = {
        TODO: inputVal,
    };

    createRecord(base, record);

    try {
    } catch (error) {
        console.log("Error while adding TODO ---", error);
    }
});

app.error((error) => {
    // Check the details of the error to handle cases where you should retry sending a message or stop the app
    console.log("There was an error ----", error);
});

(async () => {
    // Start the app
    await app.start(process.env.PORT);
    // await app.start(process.env.PORT || 3000);
    console.log("process.env.PORT =", process.env.PORT);

    console.log("⚡️ Bolt app is running!");
})();

// https://devcenter.heroku.com/articles/deploying-nodejs
