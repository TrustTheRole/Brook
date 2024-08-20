const { enc_data, admins } = require('./config');
const axios = require('axios');
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

    const resp = await axios.request(config)
        .then((response) => {
            console.log(JSON.stringify(response.data));
            return response.data;
        })
        .catch((error) => {
            console.log(error);
        });

    if (resp && resp.token) {
        return resp.token;
    }
    return null;
}

module.exports = { checkAdmin, getToken };