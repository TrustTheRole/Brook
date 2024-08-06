const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
// const bot = new TelegramBot(token, { polling: true });
const bot = new TelegramBot(token, { polling: false });

const menu = {
    reply_markup: {
        keyboard: [
            ['Avatar'],
            ['Settings']
        ]
    }
};


bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    
    
    if (messageText === '/start') {
        bot.sendMessage(chatId, 'Hey there! I am Brook, your personal assistant. How can I help you today?');
    }


    if(messageText === "/send-newsletter"){
        bot.sendMessage(chatId, "Please enter the title of the newsletter.");

        bot.once('message', (msg) => {
            const newsletter_title = msg.text;

            bot.sendMessage(chatId, "Please enter the topic name");

            bot.once('message', (msg) => {
                const topic_name = msg.text;
                bot.sendMessage(chatId, "Please enter the content of the newsletter");


                bot.once('message', (msg) => {
                    const content = msg.text;

                    fetch('http://localhost:8080/misc/send-newsletter', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            newsletter_title:newsletter_title,
                            title:topic_name,
                            content:content
                        })
                    }).then((res)=>{
                        res.json().then((data)=>{
                            console.log(data);
                        });

                        bot.sendMessage(chatId, "Newsletter sent successfully!");
                    }).catch((e)=>{
                        console.log(e);
                        bot.sendMessage(chatId, "An error occured while sending the newsletter. Please try again later.");
                    });

                });

            });
        });
    }


});
