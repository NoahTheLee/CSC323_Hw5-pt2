function getCart() {
    ///Create a customer tag
    customerId = "CUST" + String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    //Populate a SKU array
    items = [];
    for (let i = 0; i < (Math.floor(Math.random() * 8) + 2); i++) {
        items.push({
            itemId: "SKU" + String(Math.floor(Math.random() * 10000)).padStart(5, '0'),
        });
    }

    //Random paid value based off some simple math
    paid = Math.random() < 0.5;
    //Random priority value based off some simple math
    priority = Math.random() < 0.5 ? "high" : "low";

    //Random time on site value with some complicated math (source: trust me bro)
    timeOnSite = Math.floor(Math.random() * 9000000) + 1;

    //Return the json object
    return {
        customerId: customerId,
        items: items,
        paid: paid,
        priority: priority,
        timeOnSite: timeOnSite
    };
}

console.log(getCart())