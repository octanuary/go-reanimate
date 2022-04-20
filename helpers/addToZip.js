/**
 * fixed version of zip.add()
 */
module.exports = (zip, filename, bytes) => {
	zip.add(filename, bytes);
	if (zip[filename].crc32 < 0) zip[filename].crc32 += Math.pow(2, 32);
}