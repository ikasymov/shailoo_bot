let request = require('request');
var Xray = require('x-ray');
var x = Xray();
let url = 'https://shailoo.srs.kg/view/public/tik_list_public.xhtml';
let cookieJar = request.jar();
let dataForGet = {
    url: url,
    method: 'GET',
    jar: cookieJar,
    strictSSL: false
};
let dataForPost = {url: url, method: 'POST', jar: cookieJar, form:
    {'lastname-input': 'Касымов', 'FirstName-input': 'Ильгиз',
        'searchButton': '', 'javax.faces.ViewState': '-6770063256342355219:2285902177514560170', 'form': 'form'},
    strictSSL: false};
request(dataForGet, (error, req, body)=>{
    if(!error){
        x(body, '#form', ['input@value'])((error, value)=>{
            dataForPost.form['javax.faces.ViewState'] = value.slice(-1)[0];
            console.log(dataForPost)
            request(dataForPost, (error, req, body)=>{
                if(error){
                    console.log(error)
                }else{
                    console.log(body)
                }
            })
        })
    }else{
        console.log(error)
    }

})