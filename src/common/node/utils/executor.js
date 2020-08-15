const {spawn} = require('child_process');
const path = require('path');

const BIN_DIR = process.env.BIN_DIR;

class Executor {
    static exec(args, options = {shell: true}) {
		return new Promise((resolve, reject) => {
			if (options.cwd) {
                console.info(`Setting working directory to ${options.cwd}`);
                options.cwd = options.cwd;
			}

            let proc;
            console.log('Executing ' + args);
            try {
                if (Array.isArray(options.stdio)) {
                    const pipeTypes = Object.keys(pipes);
                    pipeTypes.forEach((pipe, idx) => {
                        if (typeof options.stdio[idx] === 'object') {
                            pipes[pipe] = options.stdio[idx];
                        } else {
                            delete pipes[pipe];
                        }
                    });

                    delete options.stdio;
                }

                proc = spawn(args, options);
            } catch(err) {
                return reject(err);
            }

			let dataBuffer = "";

			proc.stdout.on("data", (buf) => {
				dataBuffer += buf.toString();
			});

			proc.stderr.on("data", (buf) => {
				const encoded = buf.toString();
				console.info(encoded);
				dataBuffer += encoded;
			});

			proc.on("close", (code) => {
				if (code !== 0) {
					console.error("Error while executing command ::" + args);
					return reject(dataBuffer);
				}

				resolve(dataBuffer);
			});
		});
	}

	static getExtension() {
		return process.platform === 'win32' ? '.exe' : '';
	}

	static getBinary(cmd) {
        if (!BIN_DIR) {
            return cmd + Executor.getExtension();
        }

		return path.join(BIN_DIR, cmd) + Executor.getExtension();
	}
}

module.exports = Executor;