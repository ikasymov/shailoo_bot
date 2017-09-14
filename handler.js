let request = require('request');
let apiUrl = 'https://api.namba1.co';
let token = process.env.token;
let db = require('./models');
let Search = require('./check');
let Xray = require('x-ray');
let x = Xray();

function Handler(req){
    this.data = req.body.data;
    this.req = req
}

Handler.prototype.start = async function(){
    let data = {
        'message/new': 'newMessage',
        'user/follow': 'newFollow'
    };
    try{
        return this[data[this.req.body.event]]()
    }catch(e){
        throw new Error('not search this method')
    }
};
Handler.prototype.setTyppingStatus = async function(chatId, status){
     let setStatus = {
                true: 'typing',
                false: 'stoptyping'
        };
        let data = {
                url: apiUrl + '/chats/' + chatId + '/' + setStatus[status],
                method: 'GET',
                headers: {
                    'X-Namba-Auth-Token': token
                }
        };
        return new Promise((reject, resolve)=>{
                request(data, (error, req, body)=>{
                        if(error){
                                reject(error)
                            }
                        resolve(true)
                    })
            });
};


Handler.prototype.newMessage = async function(){
    this.message = this.data.content;
    this.chat_id = this.data.chat_id;
    let word = 'Введите ФИО Пример: Касымов Ильгиз Майрамбекович';
    let value = await db.Step.findOrCreate({
        where:{
            key: this.data.sender_id
        },
        defaults: {
            key: this.data.sender_id,
            value: 'test'
        }
    });
    if(this.message.toLowerCase() === 'start' || this.message.toLowerCase() === 'старт') {
        await this.setTyppingStatus(this.chat_id, true);
        await value[0].update({value: 'wait_result'});
        await this.setTyppingStatus(this.chat_id, false);
        return await this.sendMessage(word);
    }else if(value[0].value === 'wait_region'){
        await this.setTyppingStatus(this.chat_id, true);
        let fio = await db.Step.findOne({
            where: {
                key: this.data.sender_id + 'fio'
            }
        });
        let userInformation = fio.value.split(' ');
        let regionList = await db.Step.findOne({
            where: {
                key: this.data.sender_id + 'region'
            }
        });
        let list = JSON.parse(regionList.value);
        let setRegion = false;
        if(this.message !== '0'){
            setRegion = list[this.message];
        }
        if(setRegion === undefined){
            await this.setTyppingStatus(this.chat_id, false);
            return await this.sendMessage('Введите правильный номер')
        }
        let data = {
            first_name: '',
            last_name: '',
            patronymic: '',
            region: setRegion
        };
        data['first_name'] = userInformation[1] || '';
        data['last_name'] = userInformation[0] || '';
        data['patronymic'] = userInformation[2] || '';
        let search = new Search(data);
        let result = await search.get();
        value[0].update({value: 'send_result'});
        if(result){
            await this.setTyppingStatus(this.chat_id, false);
            return await this.sendMessage(result)
        }else{
            await this.setTyppingStatus(this.chat_id, false);
            return this.sendMessage('Избиратель не найден')
        }

    }else if(value[0].value === 'wait_result'){
        await this.setTyppingStatus(this.chat_id, true);
        let obj = await db.Step.findOrCreate({
            where:{
                key: this.data.sender_id + 'fio'
            },
            defaults: {
                key: this.data.sender_id + 'fio',
                value: this.message
            }
        });
        await obj[0].update({value: this.message});
        let url  = 'https://shailoo.srs.kg/view/public/tik_list_public.xhtml';
        let data = {
            url: url,
            method: 'GET',
            strictSSL: false
        };
        let dict = await new Promise((resolve, reject)=>{
            request(data, (error, req, body)=>{
                x(body, '#region_input', ['option@value'])((error, listOfRegion)=>{
                    listOfRegion[0] = 'Пропустить';
                    let text = 'Введите номер варианта для продолжение \n';
                    for(let i in listOfRegion){
                        let curent = listOfRegion[i];
                        text += i + '  ' +  curent  + '\n'
                    }
                    resolve({'text': text, 'list': JSON.stringify(listOfRegion)})
                })
            });
        });
        let update = await db.Step.findOrCreate({
            where:{
                key: this.data.sender_id + 'region'
            },
            defaults: {
                key: this.data.sender_id + 'region',
                value: dict.list
            }
        });
        await update[0].update({value: dict.list});
        await value[0].update({value: 'wait_region'});
        await this.setTyppingStatus(this.chat_id, false);
        return await this.sendMessage(dict.text)

    }else if(value[0].value === 'send_result'){
        return this.sendMessage('Вы получили результат для нового введите "старт"')
    }else{
        return this.sendMessage('Введите старт для начало')
    }
};

Handler.prototype.newFollow = async function(){
    console.log('new follow')
    let data = {
        url: apiUrl + '/chats/create',
        method: 'POST',
        body:{
            name: 'new chat',
            members: [this.data.id]
        },
        headers: {
            'X-Namba-Auth-Token': token
        },
        json: true
    };
    return new Promise((resolve, reject)=>{
        request(data, (error, req, body)=>{
            if(error){
                console.log('error')
                reject(error)
            }
            this.chat_id = body.data.membership.chat_id;
            let word = 'Добро пожаловать с помощю этого бота вы можете узнать есть ли вы в списке избирателей, для начало напишите "старт"'
            this.sendMessage(word).then(result=>{
                resolve(result);

            })
        })
    });

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

