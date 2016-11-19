/**
 * Created by galen on 16/11/19.
 */

import path from 'path';

import views from '../index';

const option = {
    root: path.resolve(__dirname, 'views'),
    extension: 'html'
};

let ctx = {};

const view = views(option)(ctx);

ctx.render('index');


