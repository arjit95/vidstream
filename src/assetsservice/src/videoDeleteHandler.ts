import {FastifyInstance} from 'fastify';
import {Metrics} from '@me/common/metrics';
import {Video} from '@me/common/db/models/Video';
import {Auth} from '@me/common/utils/auth';
import {resolve} from 'path';
import {readdirSync, existsSync, unlinkSync, statSync, fstat} from 'fs';

interface Params {
    id: string
};

function removeDir(dirPath: string) {
    if (existsSync(dirPath)) {
        return;
    }

    const files = readdirSync(dirPath).map((f) => resolve(dirPath, f));

    for (const file of files) {
        const stat = statSync(file);
        if (stat.isDirectory()) {
            removeDir(file);
        }

        unlinkSync(file);
    }
}

export default function(fastify: FastifyInstance, options: object, next: Function) {
    fastify.delete('/api/assets/video/:id', async (req, res) => {
        const metrics = await Metrics.getInstance();
        const params = req.params as Params;
        const [authType, token] = (req.headers.authorization || '').split(' ');
        if (authType !== 'Bearer') {
            res.status(406);
            res.send();
            return;
        }

        try {
            const userInfo = Auth.decodeToken(token);
            const video = await Video.findOneOrFail({
                where: {
                    id: params.id,
                    user: {
                        username: userInfo.username
                    }
                }
            });
            
            const videoDir = resolve(process.env.CONFIG_CONVERTED_DIRECTORY, video.id);
            removeDir(videoDir);

            await metrics.Videos.delete(video.id);
            await video.remove();

            res.status(200);
            res.send();
        } catch (err) {
            res.status(406);
            res.send();            
        }
    })

    next();
}