//Deprecated js file I used briefly for testing

const functions = require('@google-cloud/functions-framework');

// Imports the Google Cloud client library
const { PubSub } = require('@google-cloud/pubsub');

// Creates a client; cache this for further use
const pubSubClient = new PubSub();

// Register a CloudEvent callback with the Functions Framework that will
// be executed when the Pub/Sub trigger topic receives a message.
functions.cloudEvent('helloPubSub', async cloudEvent => {
    // The Pub/Sub message is passed as the CloudEvent's data payload.
    const data = Buffer.from(cloudEvent.data.message.data, 'base64').toString() //cloudEvent.data.message.data

    //Depreciated
    // const name = base64DecodedData
    // ? Buffer.from(base64DecodedData, 'base64').toString()
    // : 'err'

    const parsedData = JSON.parse(data);
    const customerId = parsedData.customerId;
    const items = parsedData.items;
    const paid = parsedData.paid;
    const priority = parsedData.priority;
    const timeOnSite = parsedData.timeOnSite;

    console.log(`Debug on cart:
        customerId: ${customerId},
        items: ${items.map(item => item.itemId).join(', ')},
        paid: ${paid},
        priority: ${priority},
        timeOnSite: ${timeOnSite}`);

    if (paid === false) { //If paid is true, do something
        console.log('Publish to notifications: unpaid cart reminder')
        const topic = 'projects/feisty-parity-447722-a5/topics/commerce-notifications';
        const data = JSON.stringify(jsonComposer('unpaid', parsedData.toString()));
        if (await publishMessage(topic, data)) {
            console.log('Message published to notifications succesfully');
        } else {
            console.log('Message errored, and not published');
        }

    } else { //We can assume any other value to be true

        if (priority === "high") { //If priority is high, do something
            console.log(`Publish to shipping, do nothing
                and notifications "items otw"`)

        } else { //We can assume any other value to be low
            console.log(`Publish to low priority shipping, counter`);

        } //No other values are possible
    }

});

function jsonComposer(payload, data) {
    return {
        message: payload,
        cart: data
    };
}

async function publishMessage(topicNameOrId, data) {
    // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
    const dataBuffer = Buffer.from(data);

    // Cache topic objects (publishers) and reuse them.
    const topic = pubSubClient.topic(topicNameOrId);

    try {
        const messageId = await topic.publishMessage({ data: dataBuffer });
        console.log(`Message ${messageId} published.`);
        return true;
    } catch (error) {
        console.error(`Received error while publishing: ${error.message}`);
        process.exitCode = 1;
        return false;
    }
}

