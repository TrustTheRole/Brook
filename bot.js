const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

const admins = ['animeshshukla01'];

const bot = new TelegramBot(token, { polling: true });

const menu = {
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: 'Send Newsletter',
                    callback_data: 'send-newsletter'
                }
            ],
            [
                {
                    text: 'Admin',
                    callback_data: 'admin'
                }
            ]
        ]
    }
};

bot.on('message', (msg) => {
    const chatID = msg.chat.id;
    const messageText = msg.text;

    if (messageText === "/start") {
        bot.sendMessage(chatID, 'Hey there! I am Brook, your personal assistant. How can I help you today? Hit /menu to see the menu.', menu);
    }

    if(messageText === "/menu"){
        bot.sendMessage(chatID, "Here is the menu", menu);

    }


    if (messageText==="/admin") {
        if (admins.includes(msg.from.username)) {
            bot.sendMessage(chatID, 'You are an admin');
        } else {
            bot.sendMessage(chatID, 'You are not an admin');
        }
    }

    if(messageText === "/send-newsletter"){
        if(!checkAdmin(msg.from.username)){
            bot.sendMessage(chatID, "You are not authorized to send newsletters.");
            return;
        }
        bot.sendMessage(chatID, "Please enter the title of the newsletter.");

        bot.once('message', (msg) => {
            const newsletter_title = msg.text;

            bot.sendMessage(chatID, "Please enter the topic name");

            bot.once('message', (msg) => {
                const topic_name = msg.text;
                bot.sendMessage(chatID, "Please enter the content of the newsletter");


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

                        bot.sendMessage(chatID, "Newsletter sent successfully!");
                    }).catch((e)=>{
                        console.log(e);
                        bot.sendMessage(chatID, "An error occured while sending the newsletter. Please try again later.");
                    });

                });

            });
        });
    }
});

function checkAdmin(username) {
    return admins.includes(username);
}
