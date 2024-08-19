const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const axios = require('axios');
const { enc_data } = require('./config');

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

bot.on('message', async (msg) => {
    const chatID = msg.chat.id;
    const messageText = msg.text;

    if (messageText === "/start") {
        bot.sendMessage(chatID, 'Hey there! I am Brook, your personal assistant. How can I help you today?');
    }

    if (messageText === "/menu") {
        bot.sendMessage(chatID, "Here is the menu", menu);

    }


    if (messageText === "/admin") {
        if (admins.includes(msg.from.username)) {
            bot.sendMessage(chatID, 'You are an admin');
        } else {
            bot.sendMessage(chatID, 'You are not an admin');
        }
    }

    if (messageText === "/send-newsletter") {
        if (!checkAdmin(msg.from.username)) {
            bot.sendMessage(chatID, "You are not authorized to send newsletters.");
            return;
        }
        bot.sendMessage(chatID, "Please wait...Authenticating user...");
        const auth_token = await getToken(msg.from.username);
        if (!auth_token) {
            bot.sendMessage(chatID, "Authentication failed. Please try again later.");
            return;
        }
        bot.sendMessage(chatID, "User authenticated successfully 🎉");

        bot.sendMessage(chatID, "Please enter the newsletter title");

        bot.once('message', (msg) => {
            const newsletter_title = msg.text;

            bot.sendMessage(chatID, "Please enter the topic name");

            bot.once('message', (msg) => {
                const topic_name = msg.text;
                bot.sendMessage(chatID, "Please enter the content of the newsletter");


                bot.once('message', (msg) => {
                    const content = msg.text;

                    bot.sendMessage(chatID,"Please wait...Sending newsletter...");

                    fetch('https://trustherole.in/ttrapi/misc/send-newsletter', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${auth_token}`
                        },
                        body: JSON.stringify({
                            newsletter_title: newsletter_title,
                            title: topic_name,
                            content: content
                        })
                    }).then((res) => {
                        res.json().then((data) => {
                            console.log(data);
                            if (data.error) {
                                bot.sendMessage(chatID, data.error);
                                return;
                            }
                            else {
                                bot.sendMessage(chatID, "Newsletter sent successfully!");
                            }
                        });


                    }).catch((e) => {
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

async function getToken(username) {
    
    let data = JSON.stringify({
        "encrypted_data": enc_data[username]
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://www.trustherole.in/ttrapi/user/auth/authenticate',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    const resp  = await axios.request(config)
        .then((response) => {
            console.log(JSON.stringify(response.data));
            return response.data;
        })
        .catch((error) => {
            console.log(error);
        });

    if(resp && resp.token){
        return resp.token;
    }
    return null;
}
