const { getAllUsers } = require("../models/users.models")

exports.getUsers = (request, response, next) =>{
    getAllUsers().then((users)=>{
        response.status(200).send(users)
    })
}