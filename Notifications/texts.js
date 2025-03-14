//Import the req library
const functions = require('@google-cloud/functions-framework');

functions.cloudEvent('helloPubSub', cloudEvent => {
    // The Pub/Sub message is passed as the CloudEvent's data payload
    //Need to parse it as bas64 for some reason
    const data = Buffer.from(cloudEvent.data.message.data, 'base64').toString();

    // Deprecated default logging function
    // console.log(`Data is: ${data}`)
    // const name = base64DecodedData
    // ? Buffer.from(base64DecodedData, 'base64').toString()
    // : 'err'

    //Parse the parsed data as json
    const parsedData = JSON.parse(data);
    const message = parsedData.message;
    //Message will either be "paid high" or "unpaid". We can break this out into a boolean so we can use it in a switch statement
    const isPaid = !message.includes("unpaid");
    //Sanity check on isPaid
    console.log(`isPaid: ${isPaid}`)

    //Cart is an... Object, but we can access it like it's json, fffforrrr some reason ig
    const cart = parsedData.cart;

    //It doesn't need parsed further??? so... W I suppose
    // try {
    //     const cartData = JSON.parse(cart);
    //     console.log('Parsed cart data:', cartData);
    // } catch (error) {
    //     console.error('Error parsing cart data:', error);
    // }

    // Breaking out cart for easy manipulation
    const customerId = cart.customerId;
    const items = cart.items;
    const paid = cart.paid;
    const priority = cart.priority;
    const timeOnSite = cart.timeOnSite;

    //Composing the log message and making it all nice and fancy becuase I'm a nerd
    console.log(`[NOTIFICATION] Customer ${customerId}, your cart (${items.map(item => item.itemId).join(', ')}) is ${paid ? "paid and being processed for shipment" : "awaiting checkout"}. Priority: ${priority}. Time spent on site: ${timeOnSite} seconds.`);

});
