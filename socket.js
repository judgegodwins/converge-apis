

function socketConnection(io, Model) {

    const users = []

    io.on('connection', (socket)=>{
        console.log('we have a new connection')
        console.log(socket.id)

        socket.username = socket.request.user.username;


        // socket.id = socket.request.user.id;
        socket.status = 'online';


        socket.broadcast.emit('connected', {
            username: socket.username,
            status: socket.status
        });

        socket.on('bring_status', (data, callback) => {
            let person = users.find((x) => {
                return x.name == data.username;
            });
            
            if(!person) {

                Model.findOne({username: data.username}).select({password: 0, id: 0}).exec((err, user) => {
                    callback(user.lastSeen, true)
                })

            } else {
                callback(person.status, false);
            }

        })

        
        socket.broadcast.emit('online', {username: socket.request.user.username})

        users.push({
            name: socket.username,
            id: socket.id,
            status: socket.status
        });

        // Model.findOne({username: socket.username}, (err, user) => {
        //     user.friends.forEach((friend) => {
        //         for(let person of users) {
        //             if(friend.username === person.name) {
        //                 socket.join(person.id);
        //                 socket.to(person.id).emit('online', {username: socket.username});
        //             }
        //         }
        //     })
        // })

        socket.on('disconnect', ()=>{
            console.log("user gone", socket.id)
            
            socket.broadcast.emit('disconnected', {username: socket.request.user.username, time: new Date()})

            Model.findOne({username: socket.request.user.username}, (err, user) => {
                user.lastSeen = new Date();
                user.save((err, data) => {
                    if(err) console.log(err);
                })
            })

            console.log('socket.req.user: ', socket.request.user);
            users.splice(users.indexOf(users.filter((x) => {
                return x.id === socket.id;
            })[0]), 1);


        });


        var currentJoined
        socket.on('join', (data) => {
            for(let user of users) {
                if(user.name == data.friend) {
                    // console.log(true, user)
                    socket.join(user.id);

                    console.log('user_id: ', user.id);
                    console.log('joining: ', user.name)
                    currentJoined = user.id;
                    

                    //add this tommorrow
                    
                    // Model.findOne({username: socket.username}, (err, user) => {
                    //     user.friends.forEach((friend) => {
                    //         if(friend.username === data.friend) {
                    //             friend.messages.forEach((msg) => {
                    //                 if(msg.type === 'received' && msg.new) {
                    //                     msg.new = false;
                    //                 }
                    //             })
                    //         }
                    //     })
                    // })
                }
            }
        })


        // io.to(socket.id).emit('handle', handle)
        socket.on('new_message', (data) => {
            console.log(currentJoined)
            console.log('received new message: ', data.message)
             Model.findOne({username: socket.request.user.username}, (err, user) => {
                user.friends.forEach((friend) => {
                    if(friend.username === data.toUser) {
                        friend.messages.push({
                            content: data.message,
                            type: 'sent'
                        })

                    }
                })
                user.save((err, update) => {
                    if(err) console.log(err);
                    console.log('currentJoined: ', currentJoined);
                    socket.to(currentJoined).emit('new_msg', {message: data.message, username: socket.username});
                    console.log('toUser: ', data.toUser);
                    Model.findOne({username: data.toUser}, (err, user) => {
                        user.friends.forEach((friend) => {
                            if(friend.username === socket.username) {
                                friend.messages.push({
                                    content: data.message,
                                    type: 'received'
                                })
                            }
                        })
                        user.save((err, data) => {
                            if(err) console.log(err);
                        })
                    })
                });
            })
        })

        // socket.on('save_message', (data) => {
        //     Model.findOne({username: socket.request.user.username}, (err, user) => {
        //         user.friends.forEach((friend) => {
        //             if(friend.username === data.username) {
                        
        //                 friend.messages.push({
        //                     content: data.message,
        //                     type: 'received'
        //                 });

        //             }
        //         })

        //         user.save((err, data) => {
        //             if(err) console.log(err);
        //         });
        //     })
        // })
        socket.on('suscribe', (data) => {
            console.log(data.username, ' ', 'trying to reconnect')
            users.forEach((user) => {
                if(user.name === data.username) {
                    socket.join(user.id)
                    console.log(user.id, ' -> ', socket.id)
                }
            })
        })
        socket.on('typing', (data) => {
            socket.broadcast.emit('typing', {username: socket.username});
        })
        socket.on('stop_typing', (data) => {
            socket.broadcast.emit('stop_typing')
        })

    })

    const reqnsp = io.of('/requests');
    reqnsp.on('connection', (socket) => {
        console.log('connected to /requests');
        console.log(socket.request.user.id)

        socket.on('confirm request', (data) => {
            console.log('username: ', data)
            function confirmReq(err, user) {
                user.friends.forEach((friend) => {
                    if(friend.username === data) {
                        friend.friends_status = true

                        user.save((err, data) => {
                            if(!err && data) {
                                reqnsp.to(socket.id).emit('confirmed', true);
                                return socket.request.user
                            }
                            
                        })
                    }
                })
            }
            const other_user = Model.findById(socket.request.user.id, confirmReq);
            
            Model.findOne({username: data}, (err, user) => {
                user.friends.forEach((friend) => {
                    if(friend.username === socket.request.user.username) {
                        friend.friends_status = true;

                        user.save((err, data) => {
                            if(err) console.log(err) 
                        })
                    }
                })
            })
        })
    })


    /* Defining functions
    * for reuse
    */

    
}

function areFriends(user1, user2, Model) {
    let truthOne, truthTwo

    let check = (user, otherUser, truth) => {

        user.friends.forEach((friend) => {
            if(friend.username == otherUser && friend.friend_status == true) {
                truth = true
            } else {
                truth = false;
            }
        })
    }

    Model.findOne({username: user1}, (err, user) => {
        if(err) console.log(err);

        check(user, user2, truthOne);

        Model.findOne({username: user2}, (err, user) => {
            check(user, user1, truthTwo);
        })
    })
    if(truthOne == truthTwo) return true;
    else return false;
}

module.exports = {
    socketConnection: socketConnection,
    areFriends: areFriends
}