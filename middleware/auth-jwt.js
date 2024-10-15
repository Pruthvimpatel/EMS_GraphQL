require('dotenv').config();
const config = process.env.SECRET;
const db = require('../models/index');
const jwt = require('jsonwebtoken');
const users = db.user;
const tokens = db.token;

const {Op} = require('sequelize');


const verifyToken = async({req}) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if(token) {
        const user = jwt.verify(token,config, {algorithms: ['HS256']});
        const userId = user.user_id;
        const userRecord = await users.findOne({
            where: {
                id: userId
            },
        })
        const tokenRecord = await tokens.findOne({
            where : {
                user_id:userId,
                token,
                token_type: 'ACCESS',
                expired_at: {[Op.gte]: new Date()}
            }
        });
        if(!tokenRecord) {
            throw new Error("Unauthorized. Invalid or expired access token.");
        }
        return { user:userRecord, token };
    }
};

module.exports = verifyToken;
    

