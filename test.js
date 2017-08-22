let Xray = require('x-ray');
let x = Xray();
let request = require('request');


let url  = 'https://shailoo.srs.kg/view/public/tik_list_public.xhtml';
let data = {
    url: url,
    method: 'GET',
    strictSSL: false
};
let count = 0
request(data, (error, req, body)=>{
    x(body, '#region_input', ['option@value'])((error, listOfRegion)=>{
        console.log(listOfRegion)
        let text = '';
        for(let i in listOfRegion){
            let curent = listOfRegion[i];
            text += i + '  ' +  curent  + '| \n'
        }
        JSON.stringify(listOfRegion)
        // resolve({'text': text, 'list': JSON.parse(listOfRegion)})
        count ++;
        console.log(count)
    })
});