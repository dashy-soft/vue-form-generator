import forEach from "../utils/forEach";
import objGet from '../utils/get';
import isNil from '../utils/isNil';
import debounce from '../utils/debounce';

import validators from "../utils/validators";
import { slugifyFormID } from "../utils/schema";
//import { reactive } from 'vue';
let uniqueIdCounter = 0;

function uniqueId(prefix?: string) {
  uniqueIdCounter += 1;
  return (prefix || '') + uniqueIdCounter;
}

const isFunction = (value: any) => typeof value === 'function';

const convertValidator = (validator: Function) => {
	if (typeof validator === 'string') {
		if (validators[validator] != null) return validators[validator];
		else {
			console.warn(`'${validator}' is not a validator function!`);
			return null; // caller need to handle null
		}
	}
	return validator;
};

function attributesDirective(el: any, binding: any, vnode: any) {
	let attrs = vnode.context && vnode.context.schema && vnode.context.schema.attributes ? vnode.context.schema.attributes : {};

	let container = binding.value || "input";
	if (typeof container === 'string') {
		attrs = objGet(attrs, container) || attrs;
	}
	forEach(attrs, (val: any, key: any) => {
		el.setAttribute(key, val);
	});
}

export default {
	props: {
		model: {
			type: Object
		},
		schema: {
			type: Object
		},
		formOptions: {
			type: Object
		},
		eventBus: {
			type: Object
		},
	},

	data() {
		const fieldUID = uniqueId(this.fieldID + "_");
		return {
			fieldUID,
			touched: false,
			errors: [],
			debouncedValidateFunc: null,
			debouncedFormatFunction: null
		};
	},

	directives: {
		attributes: {
			bind: attributesDirective,
			updated: attributesDirective,
			componentUpdated: attributesDirective
		}
	},

	computed: {
		value: {
			cache: false,
			get() {
				let val;
				if (isFunction(objGet(this.schema, "get"))) {
					val = this.schema.get(this.model);
				} else {
					if (this.model && this.schema.model) {
						val = objGet(this.model, this.schema.model);
					}
				}

				return this.formatValueToField(val);
			},

			set(newValue) {
				this.touch();

				let oldValue = this.value;
				newValue = this.formatValueToModel(newValue);

				if (isFunction(newValue)) {
					newValue(newValue, oldValue);
				} else {
					this.updateModelValue(newValue, oldValue);
				}
			}
		},
		disabled() {
			return this.getValueFromOption(this.schema, "disabled");
		},
		fieldClasses() {
			return this.getValueFromOption(this.schema, "fieldClasses", []);
		},
		fieldOptions() {
			return this.getValueFromOption(this.schema, "fieldOptions", {});
		},
		inputName() {
			return this.getValueFromOption(this.schema, "inputName", "");
		},
		placeholder() {
			return this.getValueFromOption(this.schema, "placeholder", "");
		},
		readonly() {
			return this.getValueFromOption(this.schema, "readonly");
		},
		required() {
			return this.getValueFromOption(this.schema, "required");
		},
		values() {
			return this.getValueFromOption(this.schema, "values", []);
		}
	},

	watch: {
		errors: {
			handler(errors) {
				this.$emit("errors-updated", errors);
			}
		}
	},

	methods: {
		getFieldID(schema, unique = false) {
			const idPrefix = objGet(this.formOptions, "fieldIdPrefix", "");
			return slugifyFormID(schema, idPrefix) + (unique ? "-" + uniqueId() : "");
		},

		getValueFromOption(field, option, defaultValue) {
			if (isFunction(this.$parent.getValueFromOption)) {
				return this.$parent.getValueFromOption(field, option, defaultValue);
			} else {
				// Environnement de test ?
				if (isNil(field[option])) {
					return defaultValue;
				}

				return field[option];
			}
		},
		validate() {
			this.touch();

			this.clearValidationErrors();
			let validateAsync = objGet(this.formOptions, "validateAsync", false);

			let results: any[] = [];

			if (
				this.schema.validator &&
				this.readonly !== true &&
				this.schema.readonly !== true && // only for the test
				this.disabled !== true
			) {
				let validators: Array<Function> = [];
				if (!Array.isArray(this.schema.validator)) {
					validators.push(convertValidator(this.schema.validator).bind(this));
				} else {
					this.schema.validator.forEach((validator: Function) => {
						validators.push(convertValidator(validator).bind(this));
					});
				}

				validators.forEach((validator) => {
					if (validateAsync) {
						results.push(validator(this.value, this.schema, this.model));
					} else {
						let result = validator(this.value, this.schema, this.model);
						if (result && isFunction(result.then)) {
							result.then((err: any) => {
								if (err) {
									this.errors = this.errors.concat(err);
								}
							});
						} else if (result) {
							results = results.concat(result);
						}
					}
				});
			}

			let handleErrors = (errors: any[]) => {
				let fieldErrors: any[] = [];
				errors.forEach((err) => {
					if (Array.isArray(err) && err.length > 0) {
						fieldErrors = fieldErrors.concat(err);
					} else if (typeof err === 'string') {
						fieldErrors.push(err);
					}
				});
				if (isFunction(this.schema.onValidated)) {
					this.schema.onValidated.call(this, this.model, fieldErrors, this.schema);
				}

				let isValid = fieldErrors.length === 0;

				this.errors = fieldErrors;

				this.eventBus.$emit("field-validated", isValid, fieldErrors, this.fieldUID);
				return fieldErrors;
			};

			if (!validateAsync) {
				return handleErrors(results);
			}

			return Promise.all(results)
				.then(handleErrors)
				.catch((error) => {
					console.warn("Problem during field validation", error);
				});
		},

		debouncedValidate() {
			if (!isFunction(this.debouncedValidateFunc)) {
				this.debouncedValidateFunc = debounce(
					this.validate.bind(this),
					objGet(this.formOptions, "validateDebounceTime", 500)
				);
			}
			this.debouncedValidateFunc();
		},

		updateModelValue(newValue, oldValue) {
			let changed = false;
			if (isFunction(this.schema.set)) {
				this.schema.set(this.model, newValue);
				changed = true;
			} else if (this.schema.model) {
				this.setModelValueByPath(this.schema.model, newValue);
				changed = true;
			}

			if (changed) {
				this.eventBus.$emit("model-updated", newValue, this.schema.model);

				if (isFunction(this.schema.onChanged)) {
					this.schema.onChanged.call(this, this.model, newValue, oldValue, this.schema);
				}
				if (objGet(this.formOptions, "validateAfterChanged", false)) {
					if (objGet(this.formOptions, "validateDebounceTime", 500) > 0) {
						this.debouncedValidate();
					} else {
						this.validate();
					}
				}
			}
		},

		clearValidationErrors() {
			if (this.errors === undefined || this.errors.splice === undefined) {
				console.warn('no this.errors in AbstractField');
				return;
			}
			this.errors.splice(0);
		},

		setModelValueByPath(path: string, value: any) {
			// convert array indexes to properties
			let s = path.replace(/\[(\w+)\]/g, ".$1");

			// strip a leading dot
			s = s.replace(/^\./, "");

			let o = this.model;
			const a = s.split(".");
			let i = 0;
			const n = a.length;
			while (i < n) {
				let k = a[i];
				if (i < n - 1)
					if (o[k] !== undefined) {
						// Found parent property. Step in
						o = o[k];
					} else {
						// Create missing property (new level)
						//TODO disabled for vue 3 migration
						//this.$root.$set(o, k, {});
						o[k] = {};
						o = o[k];
					}
				else {
					// Set final property value
					o[k] = value;
					//TODO disabled for vue 3 migration
					//this.$root.$set(o, k, value);
					return;
				}

				++i;
			}
		},

		formatValueToField(value: any) {
			return value;
		},

		formatValueToModel(value: any) {
			return value;
		},

		touch() {
			if (!this.touched) {
				this.touched = true;
				this.$emit("field-touched");
			}
		}
	},
	created() {
		this.eventBus.$on("clear-validation-errors", this.clearValidationErrors);
		this.eventBus.$on("validate-fields", this.validate);
		this.eventBus.$emit("field-registering");
	},
	mounted() {
		/*
		const diff = function(a, b) {
			return b.filter(function(i) {
				return a.indexOf(i) < 0;
			});
		};
		const allowedKeys = [
			// Minimal
			"type",
			"model",
			// Identity
			"id",
			"inputName",
			// Texts
			"label",
			"placeholder",
			"hint",
			"help",
			// Modifiers
			"featured",
			"visible",
			"disabled",
			"required",
			"readonly",
			"validator",
			// Other options
			"styleClasses",
			"labelClasses",
			"fieldClasses",
			"fieldOptions",
			"values",
			"buttons",
			"attributes",
			// Getter/Setter
			"get",
			"set",
			// Events
			"onChanged",
			"onValidated"
		];
		*/
		//if (this.schema) {
			//let currentKeys = Object.keys(this.schema);
			//let result = diff(allowedKeys, currentKeys);
			/*if (result.length > 0) {
				console.log("diff", result, this.schema.type, this.schema.model);
			}*/
		//}
	},
	beforeUnmount() {
		this.eventBus.$off("clear-validation-errors", this.clearValidationErrors);
		this.eventBus.$off("validate-fields", this.validate);
		this.eventBus.$emit("field-deregistering", this);
	}
};
