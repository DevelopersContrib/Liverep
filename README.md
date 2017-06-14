
# LiveRep Chat

[![Join the chat at https://gitter.im/DevelopersContrib/Liverep](https://badges.gitter.im/DevelopersContrib/Liverep.svg)](https://gitter.im/DevelopersContrib/Liverep?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A simple live chat demo for liverep.com

## How to use

```
$ cd socket.io
$ npm install
$ cd examples/chat
$ npm install
$ node .
```

And point your browser to `http://localhost:3000`. Optionally, specify
a port by supplying the `PORT` env variable.

## Features

- Multiple users can join a chat room by each entering a unique username
on website load.
- Users can type chat messages to the chat room.
- A notification is sent to all users when a user joins or leaves
the chatroom.
