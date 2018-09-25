"use strict";

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
        const result = await this.collection.remove(
            {status: UNVERIFIED_STATUS, validTime: {$lt: moment().toDate()}},
        );
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

    async changeUser(currentUser, newUser, password) {
        await this.removeExpired();
        const doc = await this.collection.findOne({currentUser});
        if (!doc) {
            throw new Error('user: ' + currentUser + " doesn't exist");
        }
        const secret = getSecret(currentUser, password);
        if (doc.secret !== secret) {
            throw new Error('incorrect password');
        }

        await this.collection.remove(
            {user: currentUser, secret},
        );

        await this.collection.insertOne(
            { user: newUser, secret: getSecret(newUser, password) }
        );
    }

    async changePassword(user, currentPassword, newPassword) {
        await this.removeExpired();
        const doc = await this.collection.findOne({user});
        if (!doc) {
            throw new Error('user: ' + user + " doesn't exist");
        }
        const secret = getSecret(user, currentPassword);
        if (doc.secret !== secret) {
            throw new Error('incorrect password');
        }

        await this.collection.remove(
            {user: user, secret},
        );

        await this.collection.updateOne(
            { user },
            { $set: { secret : getSecret(user, newPassword) } }
        );
    }

    async removeUser(user, password) {
        await this.removeExpired();
        const doc = await this.collection.findOne({user});
        if (!doc) {
            throw new Error('user: ' + user + " doesn't exist");
        }
        const secret = getSecret(user, password);
        if (doc.secret !== secret) {
            throw new Error('incorrect password');
        }
        await this.collection.remove(
            {user, secret},
        );
    }

    async registerUser(user, password) {
        await this.removeExpired();
        const doc = await this.collection.findOne({user});
        if (doc) {
            throw new Error('user: ' + user + ' already exists');
        }
        const secret = getSecret(user, password);
        await this.collection.insertOne(
            { user, secret, status : VERIFIED_STATUS }
        );
    }

    async getUserInfo(user, pass = null) {
        await this.removeExpired();
        const doc = await this.collection.findOne({user});

        if (!doc) {
            return null;
        }

        const keys = ['user', 'status'];
        const res = keys.reduce((acc, key) => {
            acc[key] = doc[key];
            return acc;
        }, {});

        if (pass) {
            const secret = getSecret(user, pass);
            res['secretCorrespond'] = secret === doc.secret;
        }

        return res;
    }
}

module.exports = UserManager;
