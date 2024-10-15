require('dotenv').config();
const Sequelize = require('sequelize');

const dbConfig = {
    host: process.env.HOST,
    database: process.env.DB,
    username: process.env.USER,
    password: process.env.PASSWORD,
};

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
host: dbConfig.host,
port: dbConfig.port,
dialect: 'postgres',
logging: false

});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require('../models/users')(sequelize, Sequelize);
db.token = require('../models/tokens')(sequelize, Sequelize);
db.event = require('../models/events')(sequelize, Sequelize);
db.invite = require('../models/invites')(sequelize, Sequelize);

Object.keys(db).forEach(modelName => {
    if(db[modelName].associate) {
        db[modelName].associate(db);
    }
});

module.exports = db