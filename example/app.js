/**
 * Created by galen on 16/11/20.
 */

import Koa from 'koa';
import path from 'path';

import * as doT from '../index';

// Add global doT helper
doT.helper.dateFormat = function (dateString) {
    let time = new Date(dateString);
    if (time === 'Invalid Date') {
        return time;
    }
    return `${time.getFullYear()}年${time.getMonth()}月${time.getDate()}日 ${time.getHours()}时${time.getMinutes()}分${time.getSeconds()}秒`;
};

// create app with koa2
const app = new Koa();

// add doT middleware
app.use(doT.views({
    root: path.resolve(__dirname, 'views'),
    extension: 'server.html',
    cacheable: false
}));

// render('path/to/template', {model}, {app}), you can add the app info to the context and add the {app} automatically
app.use(async (ctx, next) => {
    return ctx.render('dot/index', {engine: 'doT', pkg: 'koa2-dot'}, {name: 'koa2-dot example', desc: 'a example for koa2-dot'});
});

app.listen(3000, () => {
    console.log('server listen on port: 3000');
});
