const userDefs = `#graphql
directive @verifyToken on FIELD_DEFINITION | OBJECT

type User {
  id: ID
  username: String
  email: String
  password: String
  changePassword(newPassword: String!): Boolean @verifyToken
}

type Token {
  user: User
  token: String
}

type Query {
    users:[User!]
}

type Mutation {
    signUp(username: String!, email: String!, password: String!): User
    signIn(email: String!, password: String!): loginResponse
    changePassword(input: changePass!):ChangePasswordResponse
    resetPassword(email:String!):resetPasswordRes
    signOut:logoutResponse!
    updatePassword(input: updatePass!):User  
}

type loginResponse {
 token: String
 user: User
}

type resetPasswordRes {
    resetToken:String
     user:User
}

type ChangePasswordResponse {
    message: String!
}
    
type logoutResponse {
    message:String
 }

input changePass {
    currentPassword: String!,
    newPassword: String!,
    confirmPassword:String!
}

input updatePass {
    newPassword: String,
    confirmPassword:String,
    resetToken: String
}
`;

module.exports = { userDefs };
