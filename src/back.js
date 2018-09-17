require('dotenv').config();
const {DB_NAME, VI_LENGTH, VALID_DURATION_MIN, COLLECTION_NAME} = process.env;
const crypto = require('crypto');
const UNVERIFIED_STATUS = 0;
const VERIFIED_STATUS = 1;
const moment = require('moment');

const randomId = (byteLength) => (
    crypto.randomBytes(byteLength).toString('hex')
);

const getSecret = (user, password) => (
    crypto.createHash('sha256').update(user + password).digest('hex')
);

class UserManager {
    constructor(client) {
        this.client = client;
        const db = client.db(DB_NAME);
        this.collection = db.collection(COLLECTION_NAME);
    }

    close() {
        this.client.close();
    }

    async removeExpired() {
        // todo
        // this.collection
    }

    async preRegisterUser(user, password) {
        await this.removeExpired();
        const doc = await this.collection.findOne({user});
        if (doc) {
            throw new Error('user: ' + user + ' already exists');
        }
        const verifyId = randomId(parseInt(VI_LENGTH));
        const secret = getSecret(user, password);
        const validTime = moment().add(VALID_DURATION_MIN, 'm').toDate();
        await this.collection.insertOne({
            user,
            secret,
            verifyId,
            validTime,
            status: UNVERIFIED_STATUS
        });
        return verifyId;
    };

    async verifyUser(user, password, verifyId) {
        await this.removeExpired();
        const doc = await this.collection.findOne({user});
        if (!doc) {
            throw new Error('user ' + user + "doesn't exist");
        }
        if (doc.status !== UNVERIFIED_STATUS) {
            throw new Error('user ' + user + "is already verified");
        }
        const secret = getSecret(user, password);
        if (doc.secret !== secret) {
            throw new Error('incorrect password');
        }
        if (doc.verifyId !== verifyId) {
            throw new Error('incorrect verifyId');
        }
        await this.collection.updateOne(
            { user },
            { $set: { status : VERIFIED_STATUS } }
        );
    };
}


module.exports = UserManager;






const changeId = (id, password, newId) => {

};

const changePassword = (id, password, newPassword) => {

};

const removeId = (id, password) => {

};

const registerWithoutVerification = (id, password) => {

};