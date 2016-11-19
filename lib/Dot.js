/**
 * Created by galen on 16/11/19.
 */

const co = require('co');

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const extend = require('extend');
const dot = require('dot');
const settings = require('./settings');

/**
 * class for koa2-dot
 */
class Dot {

    /**
     * @constructor
     * @param def
     * @param options
     */
    constructor(def, options = {}) {
        this.def = def;
        this.options = options;
        this.root = this.options.root;
        this.ext = this.options.extension || 'html';
        this.cacheable = this.options.cacheable || false;

        this.settings = settings;

        this.fileCache = {};

        this.templateCache = {};
    }

    /**
     * render template from file
     * @param filepath
     * @param model
     * @param app
     * @returns {Promise}
     */
    render(filepath, {model = {}, app = {}} = {}) {
        return this._getTemplate(filepath).then(res => {
            if (!res.template) {
                throw new Error(`render file ${filepath} failed!!!`);
            }
            return res.template(res.configs, model, app);
        }).catch(err => {
            throw err;
        });
    }

    /**
     * render template from string
     * @param str
     * @param model
     * @param app
     * @returns {*}
     */
    renderString(str, {model = {}, app = {}} = {}) {
        let template = dot.template(str, this.settings.dot, this.def);
        return template({}, model, app);
    }

    /**
     * parse file to template
     * @param filepath
     * @returns {*}
     * @private
     */
    _getTemplate(filepath) {

        return new Promise((resolve, reject) => {

            // for templateCache key
            let cacheKey = filepath;

            if (this.cacheable && this._getTemplateCache(cacheKey)) {
                resolve(this._getTemplateCache(cacheKey));
            }

            let layouts = [];
            let configs = {};

            this._extract(filepath).then(res => {
                layouts = [].concat(res);

                // merge configs
                layouts.forEach(layout => {
                    configs = extend(true, configs, layout.config);
                });

                // combine layouts to one template
                let preTemplate = layouts.reduce((pre, cur) => {
                    if (!cur.config || !cur.config.layout) {
                        return cur.content || pre;
                    }
                    return pre.replace(this.settings.layoutPlaceholder, (m, key) => {
                        return cur && cur.sections && cur.sections[key] || configs[key] || m;
                    });
                }, '');

                // parse includes
                let includes = [], partials = {};
                preTemplate.replace(this.settings.include, (m, key) => {
                    includes.push(key);
                });

                for (let key of includes) {
                    partials[key] = this._readFileSync(key);
                }

                // replace include and remove the layout's placeholder which not match anything
                preTemplate = preTemplate.replace(this.settings.include, (m, key) => {
                    return partials[key];
                }).replace(this.settings.layoutPlaceholder, (m, key) => '');

                // create doT template
                let template = dot.template(preTemplate, this.settings.dot, this.def);

                // cache it if cacheable
                if (this.cacheable) {
                    this._setTemplateCache(cacheKey, {configs, template});
                }

                resolve({template, configs});

            }).catch(err => {
                reject(err);
            });
        });
    }

    /**
     * extract template based layout
     * @param filepath
     * @param layouts
     * @returns {Promise}
     * @private
     */
    _extract(filepath, layouts = []) {

        return this._readFile(filepath)
            .then(str => {

                let config = {}, sections = {};

                // extract config and remove comment
                let content = str.replace(this.settings.config, (m, conf) => {
                    config = yaml.safeLoad(conf);
                    return '';
                }).replace(this.settings.comment, () => '').trim();

                // extract layouts
                content.replace(this.settings.layout, function (m, code, assign, value) {
                    sections[code] = value.trim();
                });

                layouts.unshift({config, sections, content});

                if (config.layout) {
                    return this._extract(config.layout, layouts);
                }

                return layouts;
            })
            .catch(err => {
                throw err;
            });
    }

    /**
     * read file
     * @param filepath
     * @returns {Promise}
     * @private
     */
    _readFile(filepath) {

        return new Promise((resolve, reject) => {

            // cache enabled
            if (this.cacheable && this._getCache(filepath)) {
                resolve(this._getCache(filepath));
            }

            let file = path.resolve(this.root, `${filepath}.${this.ext}`);

            fs.readFile(file, 'utf8', (err, str) => {
                if (err) {
                    reject(err);
                }

                // cache enabled
                if (this.cacheable) {
                    this._setCache(filepath, str);
                }

                resolve(str);
            });
        });
    }

    /**
     * read file sync
     * @param filepath
     * @returns {*}
     * @private
     */
    _readFileSync(filepath) {

        // cache enabled
        if (this.cacheable && this._getCache(filepath)) {
            return this._getCache(filepath);
        }

        let file = path.resolve(this.root, `${filepath}.${this.ext}`);
        let content = fs.readFileSync(file, 'utf8');

        if (this.cacheable) {
            this._setCache(filepath, content);
        }

        return content;
    }

    /**
     * Get content from cache
     * @param key
     * @returns {*}
     * @private
     */
    _getCache(key) {
        return this.fileCache[key];
    }

    /**
     * Set content to cache
     * @param key
     * @param value
     * @private
     */
    _setCache(key, value) {
        this.fileCache[key] = value;
    }

    /**
     * Get template from cache
     * @param key
     * @returns {*}
     * @private
     */
    _getTemplateCache(key) {
        return this.templateCache[key];
    }

    /**
     * Set template to cache
     * @param key
     * @param value
     * @private
     */
    _setTemplateCache(key, value) {
        this.templateCache[key] = value;
    }

    /**
     * Remove cache
     */
    clearCache() {
        this.fileCache = {};
        this.templateCache = {};
    }
}

module.exports = Dot;
