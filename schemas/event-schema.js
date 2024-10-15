const eventDefs = `#graphql
scalar Date

type Event {
id: ID
title: String
description: String
creatorId:Int
user:User
date: Date
invitataion: [Invite]
}

type User{
    username:String
}

type Invite {
    userId: ID
    eventId: ID
    user:User
}

type Query {
    eventDetail(eventId:ID!):Event
    userEvent: userEvents
    eventCreator(input:pagination):eventWithCreator
}

type Mutation {
createEvent(title: String!, description: String!, date: Date!): eventResponse 
updateEvent(eventId:Int!,title:String!,description:String!,date:Date!): updateResponse
inviteUser(eventId:Int!,email:String!):inviteResponse
}

type inviteResponse {
    message: String
    eventDetails: Event
}

type userEvents {
    createdEvent: [Event!]
    invitationEvent: [Event!]
}

type updateResponse {
    message: String
    event: Event
}

type eventResponse {
    message:String
    newEvent:Event
}

type eventWithCreator{
creatorEvent: [Event!]
invitedEvent: [Event!]
}

input pagination {
page: Int
pageSize: Int 
sortBy:String
sortOrder:SortOrder
startDate:Date
endDate:Date
search:String
}

enum SortOrder {
  ASC
  DESC
}
`;

module.exports = { eventDefs }