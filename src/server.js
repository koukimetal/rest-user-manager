const restify = require('restify');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const {SERVER_PORT, MONGO_URL} = process.env;
const UserManager = require('./back');

let client = null;
let back = null;

const preRegisterUser = async (req, res, next) => {
    const {user, password} = req.body;
    try {
        const verifyId = await back.preRegisterUser(user, password);
        // console.log(result);
        res.json({'message': 'success', verifyId});
    } catch (e) {
        console.error(e);
        res.status(400);
        res.json({'message': 'failed', 'error': e.toString()});
    }
};

const verifyUser = async (req, res, next) => {
    const {user, password, verifyId} = req.body;
    try {
        await back.verifyUser(user, password, verifyId);
        res.json({'message': 'success'});
    } catch (e) {
        console.error(e);
        res.status(400);
        res.json({'message': 'failed', 'error': e.toString()});
    }
};

const changeUser = async (req, res, next) => {
    const {user, password, newUser} = req.body;
    try {
        await back.changeUser(user, newUser, password);
        res.json({'message': 'success'});
    } catch (e) {
        console.error(e);
        res.status(400);
        res.json({'message': 'failed', 'error': e.toString()});
    }
};

const changePassword = async (req, res, next) => {
    const {user, password, newPassword} = req.body;
    try {
        await back.changePassword(user, password, newPassword);
        res.json({'message': 'success'});
    } catch (e) {
        console.error(e);
        res.status(400);
        res.json({'message': 'failed', 'error': e.toString()});
    }
};

const removeUser = async (req, res, next) => {
    const {user, password} = req.body;
    try {
        await back.removeUser(user, password);
        res.json({'message': 'success'});
    } catch (e) {
        console.error(e);
        res.status(400);
        res.json({'message': 'failed', 'error': e.toString()});
    }
};

const registerUser = async (req, res, next) => {
    const {user, password} = req.body;
    try {
        await back.registerUser(user, password);
        res.json({'message': 'success'});
    } catch (e) {
        console.error(e);
        res.status(400);
        res.json({'message': 'failed', 'error': e.toString()});
    }
};

const getUserInfo = async (req, res, next) => {
    const {user, password} = req.body;
    try {
        const info = await back.getUserInfo(user, password);
        res.json({'message': 'success', info});
    } catch (e) {
        console.error(e);
        res.status(400);
        res.json({'message': 'failed', 'error': e.toString()});
    }
};

const server = restify.createServer();
server.post('/preRegisterUser', preRegisterUser);
server.post('/verifyUser', verifyUser);
server.post('/changeUser', changeUser);
server.post('/changePassword', changePassword);
server.post('/removeUser', removeUser);
server.post('/registerUser', registerUser);
server.post('/getUserInfo', getUserInfo);

server.use(restify.plugins.bodyParser({
    mapParams: true
}));

server.listen(SERVER_PORT, async () => {
    client = await MongoClient.connect(MONGO_URL);
    back = new UserManager(client);
    console.log('%s listening at %s', server.name, server.url);
});