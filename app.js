require("dotenv").config();

const { WebClient } = require("@slack/web-api");

// Create a new instance of the WebClient class with the token read from your environment variable
const web = new WebClient(process.env.SLACK_BOT_TOKEN);
// The current date
const currentTime = new Date().toTimeString();

(async () => {
    try {
        // Use the `chat.postMessage` method to send a message from this app
        await web.chat.postMessage({
            channel: "#leadgen",
            text: "Testing from inside @todo. Disregard this message.",
        });
    } catch (error) {
        console.log(error);
    }

    console.log("Message posted!");
})();
