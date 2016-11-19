/**
 * Created by galen on 16/11/19.
 */

import assert from 'assert';

import Def from './lib/Def';
import Dot from './lib/Dot';

/**
 * The entry of koa2-dot
 * @param options
 * @returns {Function}
 */
export default function views(options = {}) {
    assert(!!options.root, 'the options.root is needed for koa2-dot!!');

    const def = new Def();
    const dot = new Dot(def, options);

    return async function (ctx, next) {

        if (!!ctx.render) {
            return await next();
        }

        ctx.render = function (file, locals = {}) {

            // template = dot.getTemplate(path, locals);
            // ctx.type = 'text/html';
            // return ctx.body = template;
            return dot.getTemplate.call(dot, file, locals);
        };

        //await next();
    }
}
