/**
 * @typedef {object} Context Upload context passed to each function
 * @property {import('../common/node/queue')} queue
 * @property {import('http').IncomingMessage} req
 * @property {Object.<string, string>} fields
 * @property {string=} filename Name of the file
 */

/**
 * @async
 * @callback StreamFunction
 * @param {Context} context
 * @returns {import('fs').WriteStream}
 */

/**
 * @async
 * @callback FinishFunction
 * @param {Context} context
 * @returns {void}
 */

 /**
  * @callback ErrorFunction
  * @param {Context} context
  * @returns {void}
  */

/**
 * @typedef {object} MethodResponse
 * @property {StreamFunction} onStream  Called for each file found
 * @property {FinishFunction=} onFinish  Called after upload is finished
 * @property {Errorfunction=} onError Called when an error occurs during upload
 * @property {FinishFunction=} validate Called before starting upload
 */

 exports.unused = {};