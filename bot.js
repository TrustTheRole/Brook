const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const { getToken, checkAdmin } = require('./helper');

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

const menu = {
    reply_markup: {
        inline_keyboard: [
            [
                {text: '/hi', callback_data: '/hi'},
                { text: '/help', callback_data: '/help' }
            ],
            [
                { text: '/admin', callback_data: '/admin' },
            ],
            [
                { text: '/check-frontend', callback_data: '/check-frontend' },
                { text: '/check-backend', callback_data: '/check-backend' },
            ]
            ,
            [
                { text: '/send-newsletter', callback_data: '/send-newsletter' },
            ]
        ]
    }
};

bot.on('message', async (msg) => {
    const chatID = msg.chat.id;
    const messageText = msg.text;

    if (messageText === "/start" || messageText === "/hi" || messageText === "/hello") {
        bot.sendMessage(chatID, 'Hey there! I am Brook, your personal assistant.\nHow can I help you today?\nEnter /help to get the list of commands');
    }

    if (messageText === "/help") {
        bot.sendMessage(chatID, "Here are the list of commands", menu);

    }


    if (messageText === "/admin") {
        if (admins.includes(msg.from.username)) {
            bot.sendMessage(chatID, 'You are an admin');
        } else {
            bot.sendMessage(chatID, 'You are not an admin');
        }
    }

    if (messageText === "/check-frontend") {
        fetch("https://www.trustherole.in/",{
            method: 'GET',
        }).then((res) => {
            console.log(res);
            bot.sendMessage(chatID, "Frontend is up and running!");
        }
        ).catch((e) => {
            console.log(e);
            bot.sendMessage(chatID, "Frontend is down!");
        }
        );
    }

    if (messageText === "/check-backend") {
        fetch("https://www.trustherole.in/ttrapi/health",{
            method: 'GET',
        }).then((res) => {
            console.log(res);
            bot.sendMessage(chatID, "Backend is up and running!");
        }
        ).catch((e) => {
            console.log(e);
            bot.sendMessage(chatID, "Backend is down!");
        }
        );
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

                    bot.sendMessage(chatID, `${newsletter_title}\n${topic_name}\n\n${content}`);

                    bot.sendMessage(chatID, "Please Confirm the newsletter. Type 'yes' to send the newsletter or 'no' to cancel");

                    bot.once('message', (msg) => {
                        const confirm = msg.text;
                        
                        if (confirm === 'yes') {
                            bot.sendMessage(chatID, "Please wait...Sending newsletter...");

                                fetch('https://www.trustherole.in/ttrapi/misc/send-newsletter', {
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
                        }
                        else {
                            bot.sendMessage(chatID, "Newsletter cancelled");
                        }
                    }
                    );
                }
                );

            });
        });
    }
});
