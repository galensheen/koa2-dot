/**
 * Created by galen on 16/11/19.
 */


import fs from 'fs';
import path from 'path';
import assert from 'assert';

/**
 *
 */
export default class Dot {
    /**
     *
     * @param def
     * @param options
     */
    constructor(def, options = {}) {
        this.def = def;
        this.options = options;
        this.root = this.options.root;
        this.ext = this.options.extension;
    }


    async getTemplate(file, locals = {}) {

        let isExist = await this._check(file);
    }


    /**
     * check the file is exist
     * @param {String} file - the template file to check
     * @returns {Promise}
     * @private
     */
    _check(file) {
        return new Promise( (resolve, reject) => {
            fs.access(path.resolve(this.root, `${file}.${this.ext || 'html'}`), err => {
                if (!!err) {
                    reject(err.toString());
                }
                resolve(true);
            });
        });
    }
}
