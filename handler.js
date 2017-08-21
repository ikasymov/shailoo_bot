let request = require('request');
let apiUrl = 'https://namba1.co/api';
let token = process.env.token;

function Handler(req){
    this.data = req.body.data;
    this.req = req
}

Handler.prototype.start = async function(){
    try{
        return this[this.req.body.event]()
    }catch(e){
        console.log('error');
        return this.sendMessage('error')
    }
};

Handler.prototype.newMessage = async function(){
    this.message = this.data.content;
    this.chat_id = this.data.chat_id;
    return await this.sendMessage('Hello world')
};

Handler.prototype.sendMessage = async function(message){
    const data = {
        url: apiUrl + '/chats/' + this.chat_id + '/write',
        method: 'POST',
        body: {
            type: 'text/plain',
            content: message
        },
        headers: {
            'X-Namba-Auth-Token': token
        },
        json: true
    };
    return new Promise((resolve, reject)=>{
        request(data, (error, req, body)=>{
            if(error){
                reject(error)
            }
            console.log(body)
            resolve(body)
        })
    })
};

module.exports = Handler;