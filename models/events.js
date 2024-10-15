module.exports = (sequelize, DataTypes) => {
    const Event = sequelize.define("events", {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        creatorId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
    }, {
        paranoid: true,
        timestamps: true
    });

    Event.associate = function (models) {
        Event.hasMany(models.invite, {
            foreignKey: 'eventId',
            as: 'invitataion'
        });
        Event.belongsTo(models.user, {
            foreignKey: 'creatorId'
        })
    };
    return Event;
}
