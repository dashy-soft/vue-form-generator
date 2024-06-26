export default (object, path, defaultValue) => {
	const keys = Array.isArray(path) ? path : path.split('.');
	let result = object;
	for (let key of keys) {
		if (result && typeof result === 'object' && key in result) {
			result = result[key];
		} else {
			return defaultValue;
		}
	}
	return result;
}
