/**
 * Created by galen on 16/11/19.
 */


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
     * @param {String} filepath - file's path to render
     * @param {Object} locals - model for template
     */
    async render(filepath, locals = {}) {
        let {configs, template} = await this._getTemplate(filepath);
        return template(configs, locals);
    }

    /**
     * render template from string
     * @param {String} str - string to render
     * @param {Object} locals - model for template
     */
    renderString(str, locals = {}) {
        let template = dot.template(str, this.settings.dot, this.def);
        return template({}, locals);
    }

    /**
     * parse file to template
     * @param filepath
     * @returns {*}
     * @private
     */
    async _getTemplate(filepath) {

        // for templateCache key
        let cacheKey = filepath;

        if (this.cacheable && this._getTemplateCache(cacheKey)) {
            return this._getTemplateCache(cacheKey);
        }

        let layouts = [];
        let layout;
        let configs = {};

        // extract content recur
        do {
            layout = await this._extract(filepath);
            layouts.push(layout);
            configs = extend(true, configs, layout.config);
            filepath = layout && layout.config && layout.config.layout;
        } while (!!filepath);

        layouts = layouts.reverse();

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
            partials[key] = await this._readFile(key);
        }

        // replace include and remove the layout's placeholder which not match anything
        preTemplate = preTemplate.replace(this.settings.include, (m, key) => {
            return partials[key];
        }).replace(this.settings.layoutPlaceholder, (m, key) => {
            return '';
        });

        // create doT template
        let template = dot.template(preTemplate, this.settings.dot, this.def);

        // cache it if cacheable
        if (this.cacheable) {
            this._setTemplateCache(cacheKey, {configs, template});
        }

        return {configs, template};
    }

    /**
     * extract template based layout
     * @param filepath
     */
    async _extract(filepath) {
        let config = {};

        // extract config and remove comment
        let content = await this._readFile(filepath);
        content = content.replace(this.settings.config, (m, conf) => {
            config = yaml.safeLoad(conf);
            return '';
        }).replace(this.settings.comment, () => {
            return '';
        }).trim();

        // extract layouts
        let sections = {};
        content.replace(this.settings.layout, function(m, code, assign, value) {
            sections[code] = value.trim();
        });

        return {config, sections, content};
    }
    /**
     * read file
     * @param filepath
     * @returns {Promise}
     * @private
     */
    async _readFile(filepath) {

        // cache enabled
        if (this.cacheable && this._getCache(filepath)) {
            return this._getCache(filepath);
        }

        let file = path.resolve(this.root, `${filepath}.${this.ext}`);

        await this._verifyFile(file);

        return new Promise((resolve, reject) => {
            fs.readFile(file, 'utf8', (err, str) => {
                if (err) {
                    reject(err.toString());
                }

                // cache it if cacheable
                if (this.cacheable) {
                    this._setCache(filepath, str);
                }

                resolve(str);
            });
        });
    }

    /**
     * check the file is exist
     * @param {String} file - the template file to check
     * @returns {Promise}
     * @private
     */
    _verifyFile(file) {
        return new Promise((resolve, reject) => {
            fs.access(file, err => {
                if (!!err) {
                    reject(err.toString());
                }
                resolve(true);
            });
        });
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

exports.Dot = Dot;
