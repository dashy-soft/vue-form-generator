import get from './get';
import set from './set';
import each from './each';

const deepClone = (v: Record<string, any>) => JSON.parse(JSON.stringify(v));

// Create a new model by schema default values
const createDefaultObject = (schema: Record<string, any>, obj: Record<string, any> = {}) => {
	each(schema.fields, (field: Record<string, any>) => {
		if (get(obj, field.model) === undefined && field.default !== undefined) {
			if (typeof field.default === "function") {
				set(obj, field.model, field.default(field, schema, obj));
			} else if (field.default instanceof Object || Array.isArray(field.default)) {
				set(obj, field.model, deepClone(field.default));
			} else set(obj, field.model, field.default);
		}
	});
	return obj;
};

// Get a new model which contains only properties of multi-edit fields
const getMultipleFields = (schema: Record<string, any>) => {
	let res: Record<string, any>[] = [];
	each(schema.fields, (field: Record<string, any>) => {
		if (field.multi === true) res.push(field);
	});

	return res;
};

// Merge many models to one 'work model' by schema
const mergeMultiObjectFields = (schema: Record<string, any>, objs: Record<string, any>) => {
	let model = {};

	let fields = getMultipleFields(schema);

	each(fields, (field: Record<string, any>) => {
		let mergedValue: any;
		let notSet = true;
		let path = field.model;

		each(objs, (obj: Record<string, any>) => {
			let v = get(obj, path);
			if (notSet) {
				mergedValue = v;
				notSet = false;
			} else if (mergedValue !== v) {
				mergedValue = undefined;
			}
		});

		set(model, path, mergedValue);
	});

	return model;
};

const slugifyFormID = (schema: Record<string, any>, prefix = "") => {
	// Try to get a reasonable default id from the schema,
	// then slugify it.
	if (!schema.id == null) {
		// If an ID's been explicitly set, use it unchanged
		return prefix + schema.id;
	} else {
		// Return the slugified version of either:
		return (
			prefix +
			(schema.inputName || schema.label || schema.model || "")
				// NB: This is a very simple, conservative, slugify function,
				// avoiding extra dependencies.
				.toString()
				.trim()
				.toLowerCase()
				// Spaces & underscores to dashes
				.replace(/ |_/g, "-")
				// Multiple dashes to one
				.replace(/-{2,}/g, "-")
				// Remove leading & trailing dashes
				.replace(/^[-]+|[-]+$/g, "")
				// Remove anything that isn't a (English/ASCII) letter, number or dash.
				.replace(/([^a-zA-Z0-9-]+)/g, "")
		);
	}
};

const slugify = (name = "") => {
	// Return the slugified version of either:
	return (
		name
			// NB: This is a very simple, conservative, slugify function,
			// avoiding extra dependencies.
			.toString()
			.trim()
			// .toLowerCase()
			// Spaces to dashes
			.replace(/ /g, "-")
			// Multiple dashes to one
			.replace(/-{2,}/g, "-")
			// Remove leading & trailing dashes
			.replace(/^[-]+|[-]+$/g, "")
			// Remove anything that isn't a (English/ASCII) letter, number or dash.
			.replace(/([^a-zA-Z0-9-_/./:]+)/g, "")
	);
};

export { createDefaultObject, getMultipleFields, mergeMultiObjectFields, slugifyFormID, slugify };
