/**** * Please see `Set up` in README ****/

const { BotFrameworkAdapter, ActivityTypes, ConversationState, UserState } = require('botbuilder');
const { PostgresStorage } = require('../lib/PostgresStorage');
const BotGreeting = require('botbuilder-greeting');

let server = require('restify').createServer();

const adapter = new BotFrameworkAdapter();
adapter.use(new BotGreeting(context => {
  return `Hi I'm your friendly bot`;
}));

server.listen(process.env.port || process.env.PORT || 5000, function () {
  console.log(`${server.name} listening to ${server.url}`);
});

/* Create a new PostgresStorage"
   Configuration:
    * uri - (required) url of the postgres server.*/
const postgresStorage = new PostgresStorage({
  uri: "postgresql://localhost:5432/BotFramework"
});
const conversationState = new ConversationState(postgresStorage);
const userState = new UserState(postgresStorage);

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
      // Save UserState changes to Postgres
      await userState.saveChanges(context);

      //Set Conversation State property
      await conversationProperty.set(context, conversation);
      //Save Conversation State to Postgres
      await conversationState.saveChanges(context);

    }
    // If activity type is DeleteUserData, invoke clean out userState
    else if (context.activity.type === ActivityTypes.DeleteUserData) {
      await userState.delete(context);
      await userState.saveChanges(context);
    }
  });
});
