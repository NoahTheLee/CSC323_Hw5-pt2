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

//TODO: Developers, it's recommended to "Edit & deeploy new revision" on your cart ingestor to only permit 1 concurrent instance of the function to exist at a time
//This is a purely cosmetic change, but it will make it easier to see the logs for each test case
//It might add some negligible latency to the function, but it will make it easier to demo the logs for each test case

//Custom set of objects to send to the cartIngestor function to cover all test cases
jsonObjs = [
    { //Paid+high | Expect to be sent to high-priority shipping
        customerId: 'CUST123456',
        items: [
            { itemId: 'SKU12345' },
        ],
        paid: true,
        priority: 'high',
        timeOnSite: 1000
    },
    { //Paid+low | Expect to be sent to low-priority shipping
        customerId: 'CUST654321',
        items: [
            { itemId: 'SKU54321' },
        ],
        paid: true,
        priority: 'low',
        timeOnSite: 1000
    },
    { //Unpaid+low | Expect to be sent to unpaid logging
        customerId: 'CUST789012',
        items: [
            { itemId: 'SKU67890' },
        ],
        paid: false,
        priority: 'low',
        timeOnSite: 1000
    },
    { //Unpaid+high | Expect to be sent to unpaid logging
        customerId: 'CUST210987',
        items: [
            { itemId: 'SKU09876' },
        ],
        paid: false,
        priority: 'high',
        timeOnSite: 1000
    },
    { //Missing paid | Expect "missing required fields"
        customerId: 'CUST210987',
        items: [
            { itemId: 'SKU09876' },
        ],
        priority: 'high',
        timeOnSite: 1000
    },
    { //Missing customerId | Expect "missing required fields"
        items: [
            { itemId: 'SKU09876' },
        ],
        paid: false,
        priority: 'high',
        timeOnSite: 1000
    },
]

//Expect 2 errors on fields (paid and customerId), 2 sent to unpaid logging, 2 sent to shipping

//Send all jsonObjs simultaneously using Promise.all
Promise.all(jsonObjs.map(jsonObj => publishMessage(topic, JSON.stringify(jsonObj))))
    .then(() => {
        console.log('All messages published successfully.');
    })
    .catch(error => {
        console.error(`Error publishing messages: ${error.message}`);
        process.exitCode = 1;
    });