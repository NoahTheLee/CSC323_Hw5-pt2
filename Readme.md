This is everything that I used for CSC323, Homework 5 Part 2
Everything you'll find here is pretty much exactly what I have in my GCP functions, or is something I used to make some data that I used in the project.

You'll need to set up 4 different pubsub topics for this, and connect them accordingly with the cart JS files.
I'd recommend making the function triggers FROM the topic detail page on Pubsub. The link page looks like this:
https://console.cloud.google.com/cloudpubsub/topic/detail/your-topic-name?project=your-project-123456-x9
and you should be able to find the "+TRIGGER CLOUD RUN FUNCTION" button at the top of the page.