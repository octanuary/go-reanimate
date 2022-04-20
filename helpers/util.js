/**
 * random util stuff
 */
exports.randStr = (len = 12) => {
	return Math.random().toString(16).substring(2, len + 2);
}