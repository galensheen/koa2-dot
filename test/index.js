/**
 * Created by galen on 16/11/19.
 */

import path from 'path';

import views from '../index';

const option = {
    root: path.resolve(__dirname, 'views'),
    extension: 'html',
    cacheable: true
};

let ctx = {};

const view = views(option)(ctx);

//ctx.render('index', {username: 'galensheen'});

setTimeout(() => {
    ctx.renderString('<div>username: [[= model.username ]]</div>', {username: 'yiliawong'});
}, 1000);




