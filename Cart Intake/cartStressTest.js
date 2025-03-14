//A script to send a bunch of unexpected cart values to the cartIngestor function

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

jsonObjs = [
    { //Good data
        customerId: 'CUST123456',
        items: [
            { itemId: 'SKU69420' },
        ],
        paid: true,
        priority: 'low',
        timeOnSite: 1000
    },
    { //Bad customerID prefix
        customerId: 'CUS123456',
        items: [
            { itemId: 'SKU123' },
        ],
        paid: true,
        priority: 'low',
        timeOnSite: 1000
    },
    { //Customer ID as int
        customerId: 1,
        items: [
            { itemId: 'SKU123' },
        ],
        paid: true,
        priority: 'low',
        timeOnSite: 1000
    },
    { //Items is empty
        customerId: 'CUST123456',
        items: [
        ],
        paid: true,
        priority: 'low',
        timeOnSite: 1000
    },
    { //Items does not have SKU
        customerId: 'CUST123456',
        items: [
            { itemId: 'abcd' },
        ],
        paid: true,
        priority: 'low',
        timeOnSite: 1000
    },
    { //Paid is invalid
        customerId: 'CUST123456',
        items: [
            { itemId: 'SKU12345' },
        ],
        paid: "Asdf",
        priority: 'low',
        timeOnSite: 1000
    },
    { //Priority is invalid
        customerId: 'CUST123456',
        items: [
            { itemId: 'SKU12345' },
        ],
        paid: true,
        priority: 'other',
        timeOnSite: 1000
    },
    { //Time on site is negative
        customerId: 'CUST123456',
        items: [
            { itemId: 'SKU12345' },
        ],
        paid: true,
        priority: 'low',
        timeOnSite: -1000
    },
    { //Time on site is zero
        customerId: 'CUST123456',
        items: [
            { itemId: 'SKU12345' },
        ],
        paid: true,
        priority: 'low',
        timeOnSite: 0
    },
    { //Time on site is string
        customerId: 'CUST123456',
        items: [
            { itemId: 'SKU12345' },
        ],
        paid: true,
        priority: 'low',
        timeOnSite: "1000"
    },
    { //items is array but invalid prefix
        customerId: 'CUST123456',
        items: [
            { something: 'SKU12345' },
        ],
        paid: true,
        priority: 'low',
        timeOnSite: 1000
    },
    { //Unexpected field
        customerId: 'CUST123456',
        items: [
            { itemId: 'SKU69420' },
        ],
        paid: true,
        priority: 'low',
        anotherField: 'unexpected',
        timeOnSite: 1000
    },
    { //Missing field
        items: [
            { itemId: 'SKU69420' },
        ],
        paid: true,
        priority: 'low',
        timeOnSite: 1000
    },
]

//Send all jsonObjs simultaneously using Promise.all
Promise.all(jsonObjs.map(jsonObj => publishMessage(topic, JSON.stringify(jsonObj))))
    .then(() => {
        console.log('All messages published successfully.');
    })
    .catch(error => {
        console.error(`Error publishing messages: ${error.message}`);
        process.exitCode = 1;
    });