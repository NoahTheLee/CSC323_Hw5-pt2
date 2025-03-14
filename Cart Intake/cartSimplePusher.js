//Simple PubSub pusher to send data to the cartIngestor function

//Import the libraries
const { PubSub } = require('@google-cloud/pubsub');
const pubSubClient = new PubSub();

async function publishMessage(topicNameOrId, data) {
    //Compose a dataBuffer
    const dataBuffer = Buffer.from(data);

    // Cache topic objects (publishers) and reuse them.
    const topic = pubSubClient.topic(topicNameOrId);

    //Send the data itself and handle errors
    try {
        const messageId = await topic.publishMessage({ data: dataBuffer });
        console.log(`Message ${messageId} published.`);
    } catch (error) {
        console.error(`Received error while publishing: ${error.message}`);
        process.exitCode = 1;
    }
}
//Change to your topic name
const topic = 'projects/feisty-parity-447722-a5/topics/commerce-carts';

//The json object to be sent
const jsonObj = {
    customerId: 'CUST123456',
    items: [
        { itemId: 'SKU69420' },
    ],
    paid: true,
    priority: 'low',
    timeOnSite: -1000
}
const dat = JSON.stringify(jsonObj);

publishMessage(topic, dat);