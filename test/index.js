/**
 * Created by galen on 16/11/19.
 */

const path = require('path');

const doT = require('../index');

doT.helper.test = function () {
    return '======111111111========eeeeeee';
};

const option = {
    root: path.resolve(__dirname, 'views'),
    extension: 'html',
    cacheable: true
};

let ctx = {};

const view = doT.views(option)(ctx, function(){});

// ctx.render('index', {username: 'koa2'});

// ctx.renderString('<div>username: [[= model.username ]]</div>', {username: 'koa2-dot'});


let template = ctx.getHtmlByFile('index', {username: 'koa2'});

// let template = ctx.getHtmlByString('<div>username: [[= model.username ]]</div>', {username: 'koa2'});

template.then(str => {console.log(str)});
