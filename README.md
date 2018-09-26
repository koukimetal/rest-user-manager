# rest-user-manager

## How to set up and run

1. Create `.env` referring `.env_example`
    1. DB_NAME= name of database
    2. COLLECTION_NAME= collection name
    3. SERVER_PORT= port number
    4. VI_LENGTH= length of verifyId
    5. VALID_DURATION_MIN= how long user are available to verify after preRegister
    6. MONGO_URL= URL for mongo
2. Set up node environment
    1. Run `npm install`
    2. Run `npm start`

## API documentation
All of them are `POST` method.

1. `preRegisterUser`
    Provide `user` and `password`. You will get `verifyId`.
    Until you verify the user, `status` of the user is `0`.
2. `verifyUser`
    Provide `verifyId` from `preRegisterUser`, `user` and `password`. We will register the user.
    `status` of the user will become `1`.
    You need to call it within `VALID_DURATION_MIN` minutes after calling `preRegisterUser`.
3. `changeUser`
    Provide `user`, `password` and `newUser`.
    If `user`'s password is `password` and `newUser` doesn't exist, we will rename the user to `newUser`.
4. `changePassword`
    Provide `user`, `password` and `newPassword`.
    If `user`'s password is `password`, we will change password to `newPassword`.
5. `registerUser`
    Provide `user` and `password`. We will register it. You don't need to call `verifyUser`.
    `status` of the user is `1` by default.
6. `removeUser`
    Provide `user` and `password`. We will remove the user if `user`'s password is `password`.
7. `getUserInfo`
    Provide `user` and `password`(Optional). We will return the user's information.
    If `password` is correct, `info.secretCorrespond` should be true.

`test/registration.js` will be helpful to know detail. You need to run `npm start` before running `npm run test`.