//Import libraries
const functions = require('@google-cloud/functions-framework');
const { PubSub } = require('@google-cloud/pubsub');
const pubSubClient = new PubSub();

functions.cloudEvent('ingestCart', async cloudEvent => {
    //Process the data
    const data = Buffer.from(cloudEvent.data.message.data, 'base64').toString() //cloudEvent.data.message.data

    //Depreciated
    // const name = base64DecodedData
    // ? Buffer.from(base64DecodedData, 'base64').toString()
    // : 'err'

    //Break out the data for easy manipulation
    const parsedData = JSON.parse(data);
    const customerId = parsedData.customerId;
    const items = parsedData.items;
    const paid = parsedData.paid;
    const priority = parsedData.priority;
    const timeOnSite = parsedData.timeOnSite;

    //Log the data for debugging
    console.log(`Debug on cart:
        customerId: ${customerId},
        items: ${items.map(item => item.itemId).join(', ')},
        paid: ${paid},
        priority: ${priority},
        timeOnSite: ${timeOnSite}`);

    if (!customerId || !items || !paid || !priority || !timeOnSite) {
        console.error('Missing required fields:', {
            customerId, items, paid, priority, timeOnSite
        });
        return;
    }

    // Check if the data types are valid
    if (typeof customerId !== 'string') {
        console.error(`Invalid data type: customerId should be a string, received`, customerId);
        return;
    }
    if (!Array.isArray(items)) {
        console.error(`Invalid data type: items should be an array, received`, items);
        return;
    }
    if (typeof paid !== 'boolean') {
        console.error(`Invalid data type: paid should be a boolean, received`, paid);
        return;
    }
    if (typeof priority !== 'string') {
        console.error(`Invalid data type: priority should be a string, received`, priority);
        return;
    }
    if (typeof timeOnSite !== 'number') {
        console.error(`Invalid data type: timeOnSite should be a number, received`, timeOnSite);
        return;
    }

    // Ensure timeOnSite is positive
    if (timeOnSite <= 0) {
        console.error(`Invalid value: timeOnSite should be greater than 0, received`, timeOnSite);
        return;
    }

    // Check if priority is either "low" or "high"
    if (priority !== 'low' && priority !== 'high') {
        console.error(`Invalid value: priority should be either "low" or "high", received`, priority);
        return;
    }

    // Check if items array is empty
    if (items.length === 0) {
        console.error(`Invalid value: items array should not be empty, received`, items);
        return;
    }

    // Check if all items have a valid itemId
    const invalidItems = items.filter(item => !item.itemId.startsWith('SKU'));
    if (invalidItems.length > 0) {
        console.error(`Invalid value: Each itemId in items should start with "SKU", received`, invalidItems);
        return;
    }

    // Check if customerId starts with "CUST"
    if (!customerId.startsWith('CUST')) {
        console.error(`Invalid value: customerId should start with "CUST", received`, customerId);
        return;
    }




    if (paid === false) { //If paid is false, handle it
        //Console log for debugging
        console.log('Publish to notifications: unpaid cart reminder')
        //Declare topic and data for the notifications
        const topic = 'projects/feisty-parity-447722-a5/topics/commerce-notifications';
        const data = {
            message: 'unpaid',
            cart: parsedData
        }
        //Send the data to pubsub
        if (await publishMessage(topic, data)) {
            console.log('Message published to notifications succesfully');
        } else {
            console.log('Message errored, and not published');
        }

    } else { //We can assume any other value to be true

        if (priority === "high") { //If priority is high, do something
            //See previous notes
            console.log(`Publish to shipping, do nothing
                and notifications "items otw"`)
            const topic = 'projects/feisty-parity-447722-a5/topics/commerce-notifications';
            const data = {
                message: 'paid high',
                cart: parsedData
            }
            //See previous notes
            if (await publishMessage(topic, data)) {
                console.log('Message published to notifications succesfully');
            } else {
                console.log('Message errored, and not published');
            }

        } else { //We can assume any other value to be low
            console.log(`Publish to low priority shipping, counter`);

            //See previous notes2
            const topic = 'projects/feisty-parity-447722-a5/topics/commerce-low_priority_shipping';
            if (await publishMessage(topic, parsedData)) {
                console.log('Message published to low-priority shipping succesfully');
            } else {
                console.log('Message errored to low-priority, and not published');
            }
        } //No other values are possible (assuming you set it up right)
    }

});

async function publishMessage(topicNameOrId, data) {
    // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
    const dataBuffer = Buffer.from(JSON.stringify(data));

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

