// Require the necessary discord.js classes
const { Client,  Events, GatewayIntentBits } = require('discord.js');
const { salon_id } = require('../../config.json');
//const { workerData } = require('worker_threads');
const RiveScript = require('rivescript')

const fs = require('fs');

var bot = new RiveScript();

// Permet de communiquer avec le thread parent (le thread principal)
const {parentPort, workerData} = require('worker_threads');

let botStatus = 'online';

parentPort.on('message', (message) => {
  console.log(`Worker ${workerData.workerName} received message from parent thread: ${message}`);
  // Gestions des différents statuts du bot
  if(message == 'dnd'){
    client.user.setPresence({
      status: 'dnd',
    });
    botStatus = 'dnd';
    const channel = client.channels.cache.get(salon_id);
    channel.send(`Busy, coming back later...`);
  } if(message == 'online'){
    client.user.setPresence({
      status: 'online',
      activities: [{ name: 'with discord.js', type: 'PLAYING' }],
    });
    const channel = client.channels.cache.get(salon_id);
    if(botStatus == 'dnd'){
      channel.send(`Can be disturbed now!`);
    } else if(botStatus == 'idle'){
      channel.send(`Now CTK (Close To Keyboard)!`);
    } else if(botStatus == 'invisible'){
      channel.send(`Visible again!`);
    }
    botStatus = 'online';
  } if(message == 'idle'){
    client.user.setPresence({
      status: 'idle',
    });
    botStatus = 'idle';
    const channel = client.channels.cache.get(salon_id);
    channel.send(`Going AFK!`);
  } if(message == 'invisible'){
    client.user.setPresence({
      status: 'invisible',
    });
    botStatus = 'invisible';
  }
});

// Load a directory full of RiveScript documents (.rive files). This is for
// Node.JS only: it doesn't work on the web!
// bot.loadDirectory("brain").then(loading_done).catch(loading_error);

// Load an individual file.
// bot.loadFile("brain/testsuite.rive").then(loading_done).catch(loading_error);

// Load a list of files all at once (the best alternative to loadDirectory
// for the web!)
bot.loadFile(["brains/english.rs"]).then(loading_done).catch(loading_error);

// All file loading operations are asynchronous, so you need handlers
// to catch when they've finished. If you use loadDirectory (or loadFile
// with multiple file names), the success function is called only when ALL
// the files have finished loading.
function loading_done() {
  console.log("Bot has finished loading!");

  // Now the replies must be sorted!
  bot.sortReplies();

  // And now we're free to get a reply from the brain!

  // RiveScript remembers user data by their username and can tell
  // multiple users apart.
  let username = "local-user";

  // NOTE: the API has changed in v2.0.0 and returns a Promise now.
  bot.reply(username, "Hello, bot!").then(function(reply) {
    console.log("The bot says: " + reply);
  });
}

// It's good to catch errors too!
function loading_error(error, filename, lineno) {
  console.log("Error when loading files: " + error);
}




// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent,] });


const channel = client.channels.cache.get(salon_id);

client.on('messageCreate', async (message) => {
    if (message.channel.id === salon_id) {
        if(message.author.tag != client.user.tag){
          if(message.mentions.members.first() == client.user.id){
            writeInConversationFile(message.content.split('>')[1].replace(' ',''), message.author.tag);
            // Le bot de répond que s'il n'est ni absent, ni invisible, ni en mode ne pas déranger
            if(botStatus != 'idle' && botStatus != 'dnd' && botStatus != 'invisible'){
              const channel = client.channels.cache.get(salon_id);
              bot.reply(message.author.tag, message.content).then(function(reply) {
                channel.send(`<@${message.author.id}> : ${reply}`);
                writeInConversationFile(reply, 'Bot');
              });
            }
        }
      }
    }
}) 



client.once(Events.ClientReady, readyClient => {
console.log(`Ready! Logged in as ${readyClient.user.tag}`);
     
    const channel = client.channels.cache.get(salon_id);
    channel.send(`Chat Bot is Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(workerData.token);

function writeInConversationFile(message, sender) {
  const file = workerData.convFile;
  const now = new Date().toString().split('G')[0].slice(0, -1);
  fs.appendFile(file, '[' + now + '] ' + sender + ' : ' + message + '\n', (err) => {
    if (err) {
      console.error(`cannot write in ${file} : ${err}`);
    }
  });
}