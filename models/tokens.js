module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define("tokens", {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token_type: {
      type: DataTypes.ENUM('ACCESS', 'RESET'),
      allowNull: false,
    },
    expired_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },

  }, {
    paranoid: true,
    underscored: true,
    timestamps: true,
  });

  return Token;
};
