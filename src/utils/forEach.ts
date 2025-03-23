export default (collection: any, iteratee: any) => {
	if (Array.isArray(collection)) {
		for (let i = 0; i < collection.length; i++) {
			iteratee(collection[i], i, collection);
		}
	} else if (typeof collection === 'object' && collection !== null) {
		for (let key in collection) {
			if (collection.hasOwnProperty(key)) {
				iteratee(collection[key], key, collection);
			}
		}
	}
}
