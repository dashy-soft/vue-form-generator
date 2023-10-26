import component from "./formGenerator.vue";
import * as schema from "./utils/schema.js";
import validators from "./utils/validators.js";
import * as fieldsLoader from "./utils/fieldsLoader.js";
import abstractField from "./fields/abstractField.js";
import FormElement from "./formElement.vue";
import FormGroup from "./formGroup.vue";

const install = (app, options = {}) => {
	if (options.fields) {
		options.fields.forEach((field) => {
			if (typeof field.name !== "undefined") {
				Vue.component(field.name, field);
			}
		});
	}
	app.component("VueFormGenerator", component);
};

export default {
	component,
	schema,
	validators,
	abstractField,
	fieldsLoader,
	install,
	FormElement,
	FormGroup,
};
