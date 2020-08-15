const path = require('path');

const {Executor} = require('../../../common/node/utils/index');

class FFMpeg {
    constructor(execPath) {
        this.plugins = [];
        this.outputFiles = [];
        this.execPath = execPath || '';
        this.command = '';
    }

    addPlugin(instance) {
        if ( !(instance instanceof FFMpeg.Plugin.Base) ) {
            throw new Error('Please provide an instance of plugin');
        }

        this.plugins.push(instance);
        return this;
    }

    /**
     * 
     * @param {SplitterWrapper} instance 
     */
    addSplitter(instance) {
        const arr = [];
        const len = instance.getTotalParts();
        const inputIdx = this.plugins.findIndex(plugin => plugin instanceof FFMpeg.Plugin.Input);
        
        for (let i = 0; i < len; i++) {
            const splitterInstance = instance.getPartAtIndex(i);
            const tempArr = [...this.plugins];
            tempArr.splice(inputIdx, 0, splitterInstance);
            
            const outputIdx = tempArr.findIndex(plugin => plugin instanceof FFMpeg.Plugin.Output);
            if (outputIdx < 0) {
                throw new Error('Splitter needs an output to work');
            }

            const outputPlugin = tempArr[outputIdx].clone();
            const filePath = outputPlugin.filePath.substring(outputPlugin.filePath.lastIndexOf('/'));
            const extname = path.extname(filePath);
            const dirPath = path.dirname(filePath);

            const parts = outputPlugin.filePath.split('/');
            parts[parts.length - 1] = path.basename(filePath, extname) + `_${i}` + extname;

            outputPlugin.filePath = parts.join(dirPath, '/');
            this.outputFiles.push(outputPlugin.filePath);
            tempArr[outputIdx] = outputPlugin;

            arr.push(tempArr);
        }

        this.plugins = arr;
        return this;
    }

    static newBuilder(execPath) {
        return new FFMpeg(execPath);
    }

    _build(plugins) {
        return plugins.reduce((acc, plugin) => {
            return acc + ' ' + plugin.getCommand();
        }, '');
    }

    build() {
        let plugins = this.plugins;
        if (!Array.isArray(plugins[0])) {
            plugins = [plugins];
        }

        for (let plugin of plugins) {
            this.command += this.execPath +  this._build(plugin) + '\n';
        }

        return this;
    }

    async exec() {
        if (!this.command) {
            throw new Error('Please call .build() before calling exec');
        }

        let commands = this.command.split('\n').filter(c => !!c);
        for (let command of commands) {
            await Executor.exec(command);
        }
    };
}

FFMpeg.Plugin = require('./plugins');
module.exports = FFMpeg;
