const db = require('../models/index');
const users = db.user;
const events = db.event;
const invitation = db.invite;
const {Op, where} = require('sequelize');
const {sequelize} = require('../models');


const eventResolvers = {
    Query: {
    //Fetches specific event detail including associated invitations and user info
    eventDetail: async(_ ,{eventId},{user}) => {
        try {
            const event = await events.findByPk(eventId,{
                include: [
                    {
                        model: invitation,
                        as: 'invitataion',
                        include: [
                            {
                                model: users,
                                as:'user'
                            }
                        ]
                    },
                ]
            });
            return {
                id: event.id,
                title: event.title,
                description: event.description,
                creatorId: event.creatorId,
                date: event.date,
                invitataion: event.invitataion
            };
        } catch(error) {
            throw new Error('Error' + error.message);
        }
    },


    //User Event - list of events created by user and the events in which the user has been invited
    userEvent: async(_,args, {user}) => {
        try {
      const createdEvents = await events.findAll({
        where: {
            creatorId: user.id
        }
      });
      console.log("createdEvents",createdEvents);


      const invitedEvents = await invitation.findAll({
        where: {
            userId: user.id
        },
        include: [
            {
                model: events,
                as: 'event'
            },
            {
                model: users,
                as: 'user'
            }
        ]
    });
    console.log("invitedEvents",invitedEvents);
    return { 
        createdEvent: createdEvents,
        invitationEvent: invitedEvents.map(invite => ({
            title: invite.event.title, 
            title: invite.event.title,
            description: invite.event.description,
            date: invite.event.date, 
            user: invite.user 
        }))
    };
        }catch(error) {
            throw new Error('List not found: ' + error.message);

        }
    },


    //User Event - same API as above only Apply Pagination ,Sorting and Searching in User Event API
    eventCreator: async (_, { input: { page, pageSize, sortBy, sortOrder, startDate, endDate, search } }, { user }) => {
        try {
            const offset = (page - 1) * pageSize;
            const dateFilter = {};
            if (startDate && endDate) {
                dateFilter.date = {
                    [Op.between]: [new Date(startDate), new Date(endDate)],
                };
            }
            else if (startDate) {
                dateFilter.date = { [Op.gte]: new Date(startDate) };
            }
            else if (endDate) {
                dateFilter.date = { [Op.lte]: new Date(endDate) };
            }

            const userId = user.id;
            const creatorEvent = await events.findAll({
                where: {
                    creatorId: userId,
                    [Op.and]: [
                        dateFilter,
                        search ? { title: { [Op.iLike]: `%${search}%` } } : {},
                    ],
                },
                order: [[sortBy, sortOrder]],
                limit: pageSize,
                offset
            });
            if (!creatorEvent) {
                throw new Error('creator has not created any events')
            }
            const invitedEvent = await events.findAll({
                include: [
                    {
                        model: invitation,
                        as: "invitataion",
                        where: {
                            userId
                        },
                    },
                    {
                        model: users,
                        as: "user",
                        attributes: ['username']
                    }

                ],
                where: dateFilter,
                where: search
                    ? { title: { [db.Sequelize.Op.iLike]: `%${search}%` } }
                    : {},
                offset,
                limit: pageSize,
                order: [[sortBy, sortOrder]],

            });
            return { creatorEvent, invitedEvent }
        } catch (error) {
            throw new Error('List not found.' + error.message)
        }

    }

    },

    Mutation: {

        //creating an event
        createEvent: async(_,{title,description,date}, {user}) => {
        try {
        if(!user) {
            throw new Error('User not Found');
        }

        if(!title || !description || !date) {
            throw new Error('All fields are mandatory');
        }

        const existingEvent = await events.findOne( {
            where: {
                title
            }
        });
        if(existingEvent) {
            throw new Error('Event already exists');
        }
        const newEvent = await events.create({
            title,
            description,
            date,
            creatorId: user.id
        })
      console.log(newEvent);
        return {
            newEvent,
            message: 'Event created successfully'
        }

        } catch(error) {
            throw new Error('Error' + error.message);
        }

        },
        //updating an event
        updateEvent: async(_,{eventId,title,description,date}, {user}) => {
        const event = await events.findByPk(eventId);
        if(!event) {
            throw new Error('Event not found');
        }

        if(event.creatorId !== user.id) {
            throw new Error('Unauthorized to update event');
        }

   await events.update({ title, description, date }, { where: { id: eventId } });
   const updatedEvent = await events.findByPk(eventId);


        return {    
            event:updatedEvent,
            message: 'Event updated successfully'
        }
    },
    //inviting user to an event
    inviteUser: async (_, { eventId, email }, { user }) => {
        try {
            const FindUser = await users.findOne({
                where: {
                    email
                }
            });
    
            const Event = await events.findByPk(eventId);
    
            // Check if the event and user are found
            if (!Event || !FindUser) {
                throw new Error('Event and User not found.');
            }
    
            // Prevent the user from inviting themselves
            if (email === user.email) {
                throw new Error('Cannot invite themselves.');
            }
    
            // Check if the user is authorized to invite others to the event
            if (Event.creatorId !== user.id) {
                throw new Error("Unauthorized to invite users to this event");
            }
    
            // Check if the user has already been invited
            const existingUser = await invitation.findOne({
                where: {
                    userId: FindUser.id,
                    eventId: Event.id
                }
            });
    
            // Throw an error if the invitation already exists
            if (existingUser) {
                throw new Error("Invitation already sent for that user");
            }
    
            // Create a new invitation
            const newInvite = await invitation.create({
                eventId: Event.id,
                userId: FindUser.id
            });
    
            return {
                eventDetail: {
                    title: Event.title,
                    description: Event.description,
                    date: Event.date
                },
                message: "Invitation sent successfully"
            };
    
        } catch (error) {
            throw new Error('Error: ' + error.message);
        }
    } 
 }

}

module.exports = { eventResolvers }