import { spawn } from 'child_process';

export interface ExecutorArgs {
  shell?: boolean;
  cwd?: string;
}

export class Executor {
  static exec(args: string, options: ExecutorArgs = {shell: true}): Promise<string> {
    return new Promise((resolve, reject) => {
      options.shell = typeof options.shell === 'boolean' ? options.shell : true;

      if (options.cwd) {
        console.info(`Setting working directory to ${options.cwd}`);
      }

      let proc;
      console.log('Executing ' + args);

      proc = spawn(args, options);

      let dataBuffer: string = '';

      proc.stdout.on('data', buf => {
        dataBuffer += buf.toString();
      });

      proc.stderr.on('data', buf => {
        const encoded = buf.toString();
        console.info(encoded);
        dataBuffer += encoded;
      });

      proc.on('close', code => {
        if (code !== 0) {
          console.error('Error while executing command ::' + args);
          return reject(dataBuffer);
        }

        resolve(dataBuffer);
      });
    });
  }

  static getExtension(): string {
    return process.platform === 'win32' ? '.exe' : '';
  }

  static getBinary(cmd: string): string {
    return cmd + Executor.getExtension();
  }
}
