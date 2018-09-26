const test = require('ava');
const axios = require('axios');

require('dotenv').config();
const {SERVER_PORT} = process.env;

const url = 'http://localhost:' + SERVER_PORT;
const user = 'testUsername';
const password = 'testUserPass';
const newUser = user + 'change';
const newPassword = password + 'change';

const removeUser = async (user, password) => {
    const res = await axios.post(url + '/getUserInfo', {user, password});
    if (res.data.info && res.data.info.secretCorrespond) {
        await axios.post(url + '/removeUser', {user, password});
    }
};

test.beforeEach(async (t) => {
    const combinations = [user, newUser].map(u => [password, newPassword].map(p => ({u, p})))
        .reduce((a, c) => {a.push(...c); return a;}, []);
    await Promise.all(combinations.map(({u, p}) => removeUser(u, p)));
});

test('testRegister', async t => {
    let res = await axios.post(url + '/registerUser', {user, password});
    t.is(res.data.message, 'success');

    res = await axios.post(url + '/getUserInfo', {user, password});
    t.is(res.data.message, 'success');
    t.is(res.data.info.status, 1);
    t.true(res.data.info.secretCorrespond);

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

test('testChangeUser', async t => {
    let res = await axios.post(url + '/registerUser', {user, password});
    t.is(res.data.message, 'success');

    res = await axios.post(url + '/getUserInfo', {user, password});
    t.is(res.data.message, 'success');
    t.true(res.data.info.secretCorrespond);
    t.is(res.data.info.status, 1);

    res = await axios.post(url + '/changeUser', {user, newUser, password});
    t.is(res.data.message, 'success');

    res = await axios.post(url + '/getUserInfo', {user: newUser, password});
    t.is(res.data.message, 'success');
    t.true(res.data.info.secretCorrespond);
    t.is(res.data.info.status, 1);

    res = await axios.post(url + '/getUserInfo', {user, password});
    t.is(res.data.message, 'success');
    t.falsy(res.data.info);
});

test('testChangePassword', async t => {
    let res = await axios.post(url + '/registerUser', {user, password});
    t.is(res.data.message, 'success');

    res = await axios.post(url + '/getUserInfo', {user, password});
    t.is(res.data.message, 'success');
    t.true(res.data.info.secretCorrespond);
    t.is(res.data.info.status, 1);

    res = await axios.post(url + '/changePassword', {user, password, newPassword});
    t.is(res.data.message, 'success');

    res = await axios.post(url + '/getUserInfo', {user, password: newPassword});
    t.is(res.data.message, 'success');
    t.true(res.data.info.secretCorrespond);
    t.is(res.data.info.status, 1);

    res = await axios.post(url + '/getUserInfo', {user, password});
    t.is(res.data.message, 'success');
    t.false(res.data.info.secretCorrespond);
});
