//Importin the requied libraries
const { v1 } = require('@google-cloud/pubsub');
const subClient = new v1.SubscriberClient();

async function synchronousPull(projectId, subscriptionNameOrId) {
    //Compose subscription address
    const formattedSubscription =
        subscriptionNameOrId.indexOf('/') >= 0
            ? subscriptionNameOrId
            : subClient.subscriptionPath(projectId, subscriptionNameOrId);

    // The maximum number of messages returned for this request.
    // This is set to an arbitrarily high number to try and catch many messages
    const request = {
        subscription: formattedSubscription,
        maxMessages: 100,
    };

    //Change the size of numPulls to increase the number of simultaneous requests
    //Higher numPulls = more messages?
    const numPulls = 8;
    console.log(`Pulling messages from ${formattedSubscription}...\nTrying ${numPulls} times...`);
    //PubSub may not return every single message (bruh) that is stored in the subscription
    //A promise is used to try and catch all messages from the pubsub client
    const responses = await Promise.all(
        Array(numPulls).fill(0).map(() => subClient.pull(request))
    );
    console.log(`\n\nDone pulling. Processing...`)

    //Filtering out repeated carts from the multiple requests
    const messages = responses.flatMap(response => response[0].receivedMessages);
    const uniqueMessages = new Map();
    messages.forEach(message => {
        const messageId = message.message.messageId;
        if (!uniqueMessages.has(messageId)) uniqueMessages.set(messageId, message);
    });

    // The final response is composed out of the unique messages
    const uniqueResponse = { receivedMessages: Array.from(uniqueMessages.values()) };

    //Spruce up the returned messages from counting
    console.log(`\n\nDone processing! Printing...\n\n\nLow-priority messages in queue: ${uniqueResponse.receivedMessages.length}\n`);
    for (const { message: { data }, parsedContent = JSON.parse(data) } of uniqueResponse.receivedMessages) {
        console.log(`\tCustomer: ${parsedContent.customerId}`);
        console.log(`Items purchased: ${parsedContent.items.length}`);
        console.log(`Time on site: ${parsedContent.timeOnSite}\n`);
    }


    console.log('Done.');
}

//Replace this with your project ID and subscription name
const projectId = 'feisty-parity-447722-a5';
const subscriptionNameOrId = 'projects/feisty-parity-447722-a5/subscriptions/commerce-low_priority_shipping-sub';
synchronousPull(projectId, subscriptionNameOrId)