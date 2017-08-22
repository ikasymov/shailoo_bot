let request = require('request');
let apiUrl = 'https://namba1.co/api';
let token = process.env.token;
let db = require('./models');
let Search = require('./check');

function Handler(req){
    this.data = req.body.data;
    this.req = req
}

Handler.prototype.start = async function(){
    let data = {
        'message/new': 'newMessage'
    };
    try{
        return this[data[this.req.body.event]]()
    }catch(e){
        throw new Error('not search this method')
    }
};

Handler.prototype.newMessage = async function(){
    this.message = this.data.content;
    this.chat_id = this.data.chat_id;
    let word = 'Введите Имя Фамилию и Отчество через запятую. Пример: Баланча, Баланчаев, Баланчиевич'
    let value = await db.Step.findOrCreate({
        where:{
            key: this.data.sender_id
        },
        defaults: {
            key: this.data.sender_id,
            value: 'test'
        }
    });
    console.log(value[0].value)
    if(this.message.toLowerCase() === 'start' || this.message.toLowerCase() === 'старт'){
        await this.sendMessage(word);
        await value[0].update({value: 'wait_result'})
    }else if(value[0].value === 'wait_result'){
        let userInformation = this.message.split(',');
        let data = {
            first_name: '',
            last_name: '',
            patronymic: ''
        };
        data['first_name'] = userInformation[0] || '';
        data['last_name'] = userInformation[1] || '';
        data['patronymic'] = userInformation[0] || '';
        let search = new Search(data);
        console.log(data)
        let result = await search.get();
        console.log(result)
        value[0].update({value: 'send_result'});
        return this.sendMessage(result)
    }else if(value[0].value === 'send_result'){
        return this.sendMessage('Вы получили результат для нового введите "старт"')
    }else{
        return this.sendMessage('Введите старт для начало')
    }
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
            console.log('send message');
            resolve(body)
        })
    })
};

module.exports = Handler;