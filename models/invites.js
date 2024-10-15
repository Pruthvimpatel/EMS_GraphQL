module.exports = (sequelize, DataTypes) => {
    const Invite = sequelize.define("invites", {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        eventId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

    }, {
        paranoid: true,
        timestamps: true,
    });

    Invite.associate = function (models) {
        Invite.belongsTo(models.user, {
            foreignKey: 'userId',
            as: 'user'
        });

        Invite.belongsTo(models.event, {
            foreignKey: 'eventId',
            as: 'event'
        });
    }


    return Invite;
};
