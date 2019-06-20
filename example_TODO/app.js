/**** * Please see `Set up` in README ****/

const { BotFrameworkAdapter, ActivityTypes, ConversationState, UserState } = require('botbuilder');
const { MongoDbStorage } = require('../lib/MongoDbStorage');
const BotGreeting = require('botbuilder-greeting');

let server = require('restify').createServer();

const adapter = new BotFrameworkAdapter();
adapter.use(new BotGreeting(context => {
  return `Hi I'm your friendly bot`;
}));

server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log(`${server.name} listening to ${server.url}`);
});

/* Create a new MongoDbStorage"
   Configuration:
    * url - (required) url of the mongodb server.
    * database - (optional) name of the database where the collection will live, If omitted "botframework" will be used as a default.
    * collection - (optional) name of the collection to store the data. If omitted "botframeworkstate" will be used as a default.*/
const mongoStorage = new MongoDbStorage({
  url: "mongodb://localhost:27017/",
  database: "BotFramework"
});
const conversationState = new ConversationState(mongoStorage);
const userState = new UserState(mongoStorage);

// Create a Conversation State Property
let conversationProperty = conversationState.createProperty("Convo");

//Create User State properties
let countProperty = userState.createProperty("CountProperty");
let nameProperty = userState.createProperty("nameP");

server.post('/api/messages', async (req, res) => {
  adapter.processActivity(req, res, async context => {
    if (context.activity.type == ActivityTypes.Message) {
      //Get all storage items
      let conversation = await conversationProperty.get(context, {});
      let count = await countProperty.get(context, 0);
      let name = await nameProperty.get(context,"");

      // Change the data in some way
      count++;
      name = "a name" + count;
      conversation = {
        count
      };

      // Respond back 
      await context.sendActivity(`${count} - You said ${context.activity.text}`);

      // Set User State Properties
      await nameProperty.set(context, name);
      await countProperty.set(context, count);
      // Save UserState changes to MondogD
      await userState.saveChanges(context);

      //Set Conversation State property
      await conversationProperty.set(context, conversation);
      //Save Conversation State to MongoDb
      await conversationState.saveChanges(context);

    }
    // If activity type is DeleteUserData, invoke clean out userState
    else if (context.activity.type === ActivityTypes.DeleteUserData) {
      await userState.delete(context);
      await userState.saveChanges(context);
    }
  });
});
