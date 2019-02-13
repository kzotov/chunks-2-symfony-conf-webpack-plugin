const fs  = require('fs');
const path = require('path');

const pluginName = 'Chunks2SymfonyConfWebpackPlugin';

class Chunks2SymfonyConfWebpackPlugin {
    constructor(options) {
        this.options = options;
        this.result = {};
    }
    apply(compiler) {
        compiler.hooks.emit.tap(pluginName, compilation => {
            compilation.chunks.forEach((chunk) => {
                if (this.result[chunk.name] === undefined) {
                    this.result[chunk.name] = {};
                }
                chunk.files.forEach((filename) => {
                    if (filename.endsWith('css')) {
                        this.result[chunk.name].css = `/${filename}`;
                    } else if (filename.endsWith('js')) {
                        this.result[chunk.name].js = `/${filename}`;
                    } else if (filename.endsWith('js.map')) {
                        this.result[chunk.name].jsMap = `/${filename}`;
                    } else if (filename.endsWith('css.map')) {
                        this.result[chunk.name].cssMap = `/${filename}`;
                    }
                });
            });
            this.saveJson();
        });
    }
    saveJson() {
        const projectRoot = process.cwd();
        let pathStep = projectRoot;
        this.options.outputDir.replace(projectRoot, '').split('/').forEach((folder) => {
            pathStep = path.join(pathStep, folder);
            try {
                fs.mkdirSync(pathStep);
            } catch (e) {
                // we don't care if it already exists, just continue...
            }
        });
        const file = path.join(process.cwd(), this.options.outputDir, this.options.filename);
        let blob = JSON.stringify(this.result, undefined, 2);
        blob = '<?php\n\n';
        blob += 'namespace Webpack;\n';
        blob += 'class Config\n';
        blob += '{\n\n';
        blob += '    public static function getConfig()\n';
        blob += '    {\n';
        blob += '        return '+blob.replace(/{/g,'[').replace(/}/g,']').replace(/:/g,'=>')+';';
        blob += '    }\n';
        blob += '}';
        try {
            fs.writeFileSync(file, blob, { flag: 'w' });
            console.log(`File successfully created - ${file}`);
        } catch(e) {
            console.error(e);
        }
    }
}

module.exports = Chunks2SymfonyConfWebpackPlugin; 
