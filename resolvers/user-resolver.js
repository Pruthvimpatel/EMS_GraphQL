const db = require('../models/index');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = process.env.SECRET;
const users = db.user;
const tokens = db.token;
const {AuthenticationError} = require('apollo-server-errors');
const {Op} = require('sequelize');
const  {sequelize} = require('../models');

const userResolvers = {
    Query: {
     users: () => users.findAll(),
    },

    Mutation: {

     signUp: async (_, {username, email, password}) => {
      try {

        if(!username || !email || !password) {
            throw new Error("All fields are mandatory");
        }

        const existingUser = await users.findOne({
            where: {
                email
            }
        });


        if(existingUser) {
            throw new Error("User with this email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        const newUser = await users.create({
            username,
            email,
            password:hashedPassword
        });

        return newUser;
      } catch(error) {
        throw new Error('Failed to register!!' +error.message);
      }     

     },


     signIn: async(_,{email,password}) => {
        try {
    const user = await users.findOne({
        where: {
            email
        }
    });
    if(!user) {
        throw new Error('User does not exist');
    }

    const IsPasswordValid = await bcrypt.compare(password, user.password);
    if(!IsPasswordValid) {
      throw new Error('Invalid credentials');
    }
    const accessToken = jwt.sign({
        user_id: user.id,
        email: user.email,
    }, authConfig, {
        algorithm: 'HS256',
        expiresIn: '1d'
    });



const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

const tokenRecord = await tokens.create({
    user_id: user.id,
    token: accessToken,
    token_type: 'ACCESS',
    expired_at: expiredAt
});
      return {
        token: accessToken,
        user
      }

        } catch(error) {
             throw new Error('Failed to sign in!!' + error.message);
        }
     },
    
        changePassword: async (_, { input: { currentPassword, newPassword, confirmPassword } }, { user }) => {
            try {
                if (!user) {
                    throw new Error("User not authenticated");
                }
                console.log(user);
        
                const isValidPassword = await bcrypt.compare(currentPassword, user.password);
                if (!isValidPassword) {
                    throw new Error("Invalid current password");
                }
                if (newPassword !== confirmPassword) {
                    throw new Error("New password and confirm password do not match");
                }
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                const newUser = await users.findByPk(user.user_id);
                await user.update({ password: hashedPassword }); 
                return { message: "Password updated successfully!" };
            } catch (error) {
                throw new Error('Failed to Change Password!'+error.message);

            }
        },


        resetPassword: async (_, { email }) => {
            try {
                const user = await users.findOne({ where: { email } });
                if (!user) {
                    throw new Error('User not found');

                }
                const resetToken = jwt.sign({ user_Id: user.id }, authConfig, { expiresIn: '24h' });

                await tokens.create({ user_id: user.id, token: resetToken, token_type: 'RESET', expired_at: new Date(new Date().getTime() + 86400 * 1000) });
                return {
                    resetToken,
                    user
                };
            } catch (error) {
                throw new Error('Failed to Generate resetTokens'+error.message);
            }
        },

        updatePassword: async (_, { input: { newPassword, confirmPassword, resetToken } }) => {
            try {
                const token = await tokens.findOne({ where: { token: resetToken, token_type: 'RESET', expired_at: { [Op.gt]: new Date() } } })
                if (!token) {
                    throw new Error('Invalid or expired reset token');
                }
                const user = await users.findByPk(token.user_id);
                if (!user) {
                    throw new Error('User not found');
                }
                if (newPassword !== confirmPassword) {
                    throw new Error('New password and confirm password do not match');
                }

                const hashedPassword = await bcrypt.hash(newPassword, 10);

                await users.update({ password: hashedPassword }, { where: { id: user.id } });

                await token.destroy();

                return user;
            } catch (error) {
                throw new Error('Failed to Update Password.!'+error.message);

            }
        },

        signOut: async (_, args, { token }) => {
            try {
                if (!token) {
                    throw new Error('You must have a Valid Token.');
                }
                const authToken = jwt.verify(token, authConfig, { algorithms: ['HS256'] });

                const userId = authToken.user_id;

                const result = await tokens.findOne({ where: { user_id: userId, token } });
                if (result) {
                    await result.update({ expired_at: new Date() });
                } else {
                    throw new Error('ResetToken is missing in DB');
                }

                return { message: 'Logout Succesfully.' };

            } catch (error) {
                throw new Error('Message:- ' + error.message);
            }
        }


    }
};


module.exports = {userResolvers};