const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("users", {
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        }
    }, 
{
        paranoid: true,
        timestamps: true,
        hooks: {
            beforeValidate: (user, options) => {
                if (user.username) {
                    user.username = user.username.toLowerCase();
                }
                if (user.email) {
                    user.email = user.email.toLowerCase();
                }
            }
        },
        setterMethods: {
            username: function (value) {
                this.setDataValue('username', value.toLowerCase());
            },
            email: function (value) {
                this.setDataValue('email', value.toLowerCase());
            }
        },
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
});

User.associate = function (models) {
    User.hasMany(models.invite, {
        foreignKey: 'userId',
        as: 'invitataion'
    });

    User.hasMany(models.event, {
        foreignKey: 'creatorId'
    });
};

    return User;
}