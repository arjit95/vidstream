const {spawn} = require('child_process');
const path = require('path');
const { stdout } = require('process');

const BIN_DIR = process.env.BIN_DIR;

class Executor {
    static _attachCloseHandlers(source, target, callback) {
        target.on('error', function(err) {
            if (['ECONNRESET', 'EPIPE', 'EOF'].indexOf(err.code) >= 0) { return; }
            return callback(err);
        });
        
        // Once ffprobe's input stream closes, we need no more data from the
        // input
        target.on('close', function() {
            source.pause();
            source.unpipe(target);
        });
    }

    static exec(args, options = {shell: true}) {
		return new Promise((resolve, reject) => {
			if (options.cwd) {
                console.info(`Setting working directory to ${options.cwd}`);
                options.cwd = options.cwd;
			}

            let proc;
            console.log('Executing ' + args);
            try {
                const pipes = {
                    stdin: process.stdin,
                    stdout: process.stdout,
                    stderr: process.stderr
                };

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

                for (let pipe in pipes) {
                    if (pipe === 'stdin') {
                        pipes[pipe].pipe(proc[pipe]);
                        Executor._attachCloseHandlers(pipes[pipe], proc[pipe], reject)
                    } else {
                        proc[pipe].pipe(pipes[pipe]);
                    }
                }

                if (!pipes.stdout) {
                    proc.stdout.on("data", (buf) => {
                        dataBuffer += buf.toString();
                    });
                }
                
                if (!pipes.stderr) {
                    proc.stderr.on("data", (buf) => {
                        const encoded = buf.toString();
                        console.info(encoded);
                        dataBuffer += encoded;
                    });
                }
            } catch(err) {
                return reject(err);
            }

			let dataBuffer = "";

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