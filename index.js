/**
 * Created by galen on 16/11/19.
 */

const assert = require('assert');

const Def = require('./lib/Def');
const Dot = require('./lib/Dot');

/**
 * doT helper for custom def functoin
 */
exports.helper = Def.prototype;


/**
 * The entry of koa2-dot
 * @param options
 * @returns {Function}
 */
exports.views = function views(options = {}) {
    assert(!!options.root, 'the options.root is needed for koa2-dot!!');

    const def = new Def();
    const dot = new Dot(def, options);

    return function (ctx, next) {

        if (!!ctx.render) {
            return next();
        }

        /**
         * render html by file
         * @param {String} file - template file
         * @param {Object} model - model for template
         * @param {Object} app - app info
         */
        ctx.render = function (file, model, app) {
            model = model || {};
            app = app || {};
            return dot.render.call(dot, file, {model, app}).then(html => {
                ctx.type = 'text/html';
                return ctx.body = html;
            }).catch(err => {
                throw err;
            })
        };

        /**
         * get html from file
         * @param {String} file - file to get html
         * @param {Object} model - model for template
         * * @param {Object} app - app info
         * @returns {*}
         */
        ctx.getHtmlByFile = function (file, model, app) {
            model = model || {};
            app = app || {};
            return dot.render.call(dot, file, {model, app})
                .then(html => html)
                .catch(err => {throw err});
        };

        /**
         * render from string
         * @param {String} str - string for rendering
         * @param {Object} model - model for template
         * * * @param {Object} app - app info
         * @returns {*}
         */
        ctx.renderString = function (str, model, app) {
            model = model || {};
            app = app || {};
            let template = dot.renderString.call(dot, str, {model, app});
            ctx.type = 'text/html';
            return ctx.body = template;
        };

        /**
         * get html from string
         * @param {String} str - string for rendering
         * @param {Object} model - model for template
         * * * * @param {Object} app - app info
         * @returns {Promise}
         */
        ctx.getHtmlByString = function (str, model, app) {
            model = model || {};
            app = app || {};
            return Promise.resolve(dot.renderString.call(dot, str, {model, app}))
        };

        /**
         * clear views' cache
         */
        ctx.clearViewsCache = function () {
            dot.clearCache.call(dot);
        };

        return next();
    }
};
