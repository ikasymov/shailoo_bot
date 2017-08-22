let request = require('request');
var Xray = require('x-ray');
var x = Xray();
let url = 'https://shailoo.srs.kg/view/public/tik_list_public.xhtml';
let cookieJar = request.jar();

function Search(data){
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.patronymic = data.patronymic
}

Search.prototype._getToken = async function(){
    let dataForGet = {
        url: url,
        method: 'GET',
        jar: cookieJar,
        strictSSL: false
    };
    return new Promise((resolve, reject)=>{
        request(dataForGet, (error, req, body)=>{
            if(error){
                reject(error)
            }
            x(body, '#form', ['input@value'])((error, value)=>{
                resolve(value.slice(-1)[0])
            })
        })
    })
};
Search.prototype.get = async function(){
    let token = await this._getToken();
    let data = {url: url, method: 'POST', jar: cookieJar, form: {'Patronymic-input': this.patronymic, 'lastname-input': this.last_name, 'FirstName-input': this.first_name,
            'searchButton': '', 'javax.faces.ViewState': token, 'form': 'form'}, strictSSL: false};
    return new Promise((resolve, reject)=>{
        request(data, (error, req, body)=>{
            if(error || req.statusCode === 404){
                reject(error || new Error('page not found'))
            }else{
                x(body, '#table_data', ['tr td .col'])((error, list)=>{
                    let count = 1;
                    let check = 1;
                    let newList = list.filter((elem)=>{
                        if(count - check === 5){
                            check += 6;
                            count ++;
                            return;
                        }
                        count ++;
                        return elem
                    });
                    resolve(newList.join('\n'))
                })
            }
        })
    });
};


let datafor = {
    first_name: 'Ильгиз',
    last_name: 'Касымов',
    patronymic: ''

};
module.exports = Search;