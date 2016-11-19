/**
 * Created by galen on 16/11/19.
 */

const assert = require('assert');

const Def = require('./lib/Def');
const Dot = require('./lib/Dot');

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

        /**
         * render html by file
         * @param {String} file - template file
         * @param {Object} locals - model for template
         */
        ctx.render = async function (file, locals = {}) {
            try {
                let template = await dot.render.call(dot, file, locals);
                ctx.type = 'text/htm';
                return ctx.body = template;
            } catch (err) {
                return new Error(`Failed to render file ${file}, ${err.toString()}`);
            }
        };

        /**
         * get html from file
         * @param {String} file - file to get html
         * @param {Object} locals - model for template
         * @returns {*}
         */
        ctx.getHtmlByFile = async function (file, locals = {}) {
            try {
                return await dot.render.call(dot, file, locals);
            } catch (err) {
                throw err;
            }
        };

        /**
         * render from string
         * @param {String} str - string for rendering
         * @param {Object} locals - model for template
         * @returns {*}
         */
        ctx.renderString = function (str, locals = {}) {
            let template = dot.renderString.call(dot, str, locals);
            ctx.type = 'text/html';
            return ctx.body = template;
        };

        /**
         * get html from string
         * @param {String} str - string for rendering
         * @param {Object} locals - model for template
         * @returns {Promise}
         */
        ctx.getHtmlByString = function (str, locals = {}) {
            return Promise.resolve(dot.renderString.call(dot, str, locals));
        };

        /**
         * clear views' cache
         */
        ctx.clearViewsCache = function () {
            dot.clearCache.call(dot);
        };
    }
}
