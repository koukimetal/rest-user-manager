const test = require('ava');
const axios = require('axios');

require('dotenv').config();
const {SERVER_PORT} = process.env;

const url = 'http://localhost:' + SERVER_PORT;
const user = 'testUsername';
const password = 'testUserPass';

test.before(async (t) => {
    const res = await axios.post(url + '/getUserInfo', {user, password});
    if (res.data.info) {
        const result = await axios.post(url + '/removeUser', {user, password});
        t.is(result.data.message, 'success');
    }
});

test('testRegister', async t => {
    let res = await axios.post(url + '/registerUser', {user, password});
    t.is(res.data.message, 'success');

    res = await axios.post(url + '/removeUser', {user, password});
    t.is(res.data.message, 'success');

    res = await axios.post(url + '/getUserInfo', {user, password});
    t.is(res.data.message, 'success');
    t.is(res.data.info, null);
});

test('testPreRegister', async t => {
    let res = await axios.post(url + '/preRegisterUser', {user, password});
    t.is(res.data.message, 'success');
    const {verifyId} = res.data;

    res = await axios.post(url + '/getUserInfo', {user, password});
    t.is(res.data.info.status, 0);
    t.true(res.data.info.secretCorrespond);

    res = await axios.post(url + '/verifyUser', {user, password, verifyId});
    t.is(res.data.message, 'success');

    res = await axios.post(url + '/getUserInfo', {user, password});
    t.is(res.data.message, 'success');
    t.true(res.data.info.secretCorrespond);
    t.is(res.data.info.status, 1);
});


