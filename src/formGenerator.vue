<template>
	<div :class="`vue-form-generator ${theme}`">
		v-if='schema != null'>
		<formGroup
			:tag="tag"
			:fields="fields"
			:model="model"
			:options="options"
			:errors="errors"
			:event-bus="eventBus">
			<template #field-invisible="{ field }">
				<slot name="field-invisible"
					:field="field"
				/>
			</template>
			<template #group-legend="{ group, groupLegend }">
				<slot name="group-legend"
					:group="group"
					:group-legend="groupLegend" >
					<legend v-if="groupLegend">
						<span>{{groupLegend}}</span>
					</legend>
				</slot>
			</template>
			<template #group-help="{ group }">
				<slot
					name="group-help"
					:group="group">
					<span v-if='group.help'
						class="help">
						<i class="icon" ></i>
						<div class="helpText">{{group.help}}</div>
					</span>
				</slot>
			</template>
			<template #element="slotProps">
				<formElement
					:field="slotProps.field"
					:model="slotProps.model"
					:options="slotProps.options"
					:errors="slotProps.errors"
					:event-bus="eventBus">
					<template #label="{ field, getValueFromOption }">
						<slot
							name="label"
							:field="field"
							:getValueFromOption="getValueFromOption">
							<span>{{field.label}}</span>
						</slot>
					</template>
					<template #wrapper-hook="{ field, getValueFromOption }">
						<slot
							name="wrapper-hook"
							:field="field"
							:getValueFromOption="getValueFromOption">
						</slot>
					</template>

					<template #help="{ field, getValueFromOption }">
						<slot
							name="help"
							:field="field"
							:getValueFromOption="getValueFromOption">
							<span v-if="field.help"
								class="help">
								<i class="icon" ></i>
								<div class="helpText">{{field.help}}</div>
							</span>
						</slot>
					</template>
					<template #field-not-found="{ field, getValueFromOption }">
						<slot
							name="field-not-found"
							:field="field"
							:getValueFromOption="getValueFromOption"
						/>
					</template>
					<template #hint="{ field, getValueFromOption }">
						<slot
							name="hint"
							:field="field"
							:getValueFromOption="getValueFromOption">
							<div class="hint">{{getValueFromOption(field, 'hint', undefined)}}</div>
						</slot>
					</template>

					<template #errors="{ childErrors, field, getValueFromOption }">
						<slot
							name="errors"
							:errors="childErrors"
							:field="field"
							:getValueFromOption="getValueFromOption">
							<div class="errors help-block">
								<span
									v-for="(error, index) in childErrors"
									:key="index"
									>
									{{error}}
								</span>
							</div>
						</slot>
					</template>
				</formElement>
			</template>
		</formGroup>
	</div>
</template>
<script setup lang="ts">
import formGroup from "./formGroup.vue";
import formElement from "./formElement.vue";

import { computed, nextTick, onBeforeUnmount, onMounted, watch } from 'vue';
import EventBus from './EventBus';

const props = defineProps({
	schema: {
		type: Object,
		default() {
			return {};
		}
	},
	model: {
		type: Object,
		default() {
			return {};
		}
	},
	options: {
		type: Object,
		default() {
			return {
				validateAfterLoad: false,
				validateAfterChanged: false,
				validateAsync: false,
				validationErrorClass: "error",
				validationSuccessClass: ""
			};
		}
	},
	isNewModel: {
		type: Boolean,
		default: false
	},
	tag: {
		type: String,
		default: "fieldset",
		validator(value: any) {
			return value.length > 0;
		}
	},
	theme: {
		type: String,
		default: "default-theme",
		validator(value) {
			return value.length > 0;
		}
	}
});
let totalNumberOfFields = 0;
let errors: Array<string> = []; // Validation errors
const eventBus: EventBus = new EventBus();

onBeforeUnmount(() => {
	//console.log('onBeforeUnmount eventBus', eventBus);
	//eventBus.$off("field-validated");
	//eventBus.$off("model-updated");
	//eventBus.$off("fields-validation-trigger");
	//eventBus.$off("field-registering");
	//eventBus.$off("field-deregistering");
});

onMounted(() => {
	if (props.options.validateAfterChanged || false) {
		eventBus.$on("field-validated", onFieldValidated);
	}
	eventBus.$on("model-updated", onModelUpdated);
	eventBus.$on("fields-validation-trigger", validate);
	eventBus.$on("field-registering", () => {
		totalNumberOfFields = totalNumberOfFields + 1;
	});
	eventBus.$on("field-deregistering", (_f: Record<string, any>) => {
		totalNumberOfFields = totalNumberOfFields - 1;
	});
});
/*
const fieldVisible = (field: Record<string, any>) => {
	if (typeof field.visible === 'function') return field.visible.call(this, props.model, field, this);
	if (field.visible == null) return true;
	return field.visible;
};
*/
const fillErrors = (fieldErrors: string[], errors: { uid: string, error: string}[], uid: string) => {
	if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
		fieldErrors.forEach((error) => {
			errors.push({
				uid,
				error
			});
		});
	}
};

const $emit = defineEmits([
	"model-updated",
	"fields-validation-terminated",
	"validated",
	"validate-fields",
	"clear-validation-errors"
]);

// Child field executed validation
const onFieldValidated = (_fieldIsValid: boolean, fieldErrors: string[], uid: string) => {
	// Remove old errors for this field
	errors = errors.filter((e: any) => e.uid !== uid);

	fillErrors(fieldErrors, errors, uid);

	let isValid = errors.length === 0;
	$emit("validated", isValid, errors, this);
};

const onModelUpdated = (newVal: any, schema: Record<string, any>) => {
	$emit("model-updated", newVal, schema);
};

// Validating the model properties
const validate = () => {
	return new Promise((resolve, reject) => {
		clearValidationErrors();

		let fieldsValidated = 0;

		let formErrors: Array<string> = [];

		eventBus.$on("field-deregistering", () => {
			// console.warn("Fields were deleted during validation process");
			eventBus.$emit("fields-validation-terminated", formErrors);
			reject(formErrors);
		});

		const counter = (_isValid: boolean, fieldErrors: string[], uid: string) => {
			fieldsValidated++;

			fillErrors(fieldErrors, formErrors, uid);

			if (fieldsValidated === totalNumberOfFields) {
				eventBus.$off("field-validated", counter);
				if (props.options.validateAfterChanged || false) {
					eventBus.$on("field-validated", onFieldValidated);
				}
				errors = formErrors;
				let isValid = formErrors.length === 0;
				$emit("validated", isValid, formErrors, this);
				eventBus.$emit("fields-validation-terminated", formErrors);

				if (isValid) {
					resolve();
				} else {
					reject(formErrors);
				}
			}
		};
		if (props.options.validateAfterChanged || false) {
			eventBus.$off("field-validated", onFieldValidated);
		}
		eventBus.$on("field-validated", counter);
		eventBus.$emit("validate-fields", this);
	});
};

// Clear validation errors
const clearValidationErrors = () => {
	if (errors === undefined) {
		console.warn('no this.errors in AbstractField');
	} else {
		errors.splice(0);
	}
	eventBus.$emit("clear-validation-errors", clearValidationErrors);
};

const fields = computed(() => {
	if (props.schema && props.schema.fields) {
		return props.schema.fields;
	}
});
watch(() => props.model, (newModel: any, oldModel: any) => {
	if (oldModel === newModel) {
		// model property changed, skip
		return;
	}

	if (newModel != null) {
		nextTick(() => {
			// Model changed!
			if (props.options.validateAfterLoad === true && props.isNewModel !== true) {
				validate().then(() => {}, () => {});
			} else {
				clearValidationErrors();
			}
		});
	}
	//immediate
});
</script>

<style>
.vue-form-generator * {
	box-sizing: border-box;
}

.vue-form-generator.default-theme .form-control {
	/* Default Bootstrap .form-control style */
	display: block;

	padding: 6px 12px;
	font-size: 14px;
	line-height: 1.42857143;
	color: #555;
	background-color: #fff;
	background-image: none;
	border: 1px solid #ccc;
	border-radius: 4px;
	box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
	transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
}
.vue-form-generator .form-control:not([class*=" col-"]) {
	width: 100%;
}
.vue-form-generator span.help .icon {
	display: inline-block;
	width: 16px;
	height: 14px;
	background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAA+UlEQVQ4ja3TS0oDQRAG4C8+lq7ceICICoLGK7iXuNBbeAMJuPVOIm7cqmDiIncIggg+cMZFaqCnZyYKWtB0df31V1VXdfNH6S2wD9CP8xT3KH8T9BiTcE7XBMOfyBcogvCFO9ziLWwFRosyV+QxthNsA9dJkEYlvazsQdi3sBv6Ol6TBLX+HWT3fcQZ3vGM5fBLk+ynAU41m1biCXvhs4OPBDuBpa6GxF0P8YAj3GA1d1qJfdoS4DOIcIm1DK9x8iaWeDF/SP3QU6zRROpjLDFLsFlibx1jJaMkSIGrWKntvItcyTBKzCcybsvc9ZmYz3kz9Ooz/b98A8yvW13B3ch6AAAAAElFTkSuQmCC");
	background-repeat: no-repeat;
	background-position: center center;
}
.vue-form-generator span.help .helpText {
	background-color: #444;
	bottom: 30px;
	color: #fff;
	display: block;
	left: 0px;
	opacity: 0;
	padding: 20px;
	pointer-events: none;
	position: absolute;
	text-align: justify;
	width: 300px;
	transition: all 0.25s ease-out;
	box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);
	border-radius: 6px;
}
.vue-form-generator span.help .helpText a {
	font-weight: bold;
	text-decoration: underline;
}
/* This bridges the gap so you can mouse into the tooltip without it disappearing */
.vue-form-generator span.help .helpText:before {
	bottom: -20px;
	content: " ";
	display: block;
	height: 20px;
	left: 0;
	position: absolute;
	width: 100%;
}
.vue-form-generator span.help {
	margin-left: 0.3em;
	position: relative;
}
.vue-form-generator span.help:hover .helpText {
	opacity: 1;
	pointer-events: auto;
	transform: translateY(0px);
}

.vue-form-generator .field-wrap .buttons {
	white-space: nowrap;
	margin-left: 4px;
}
.vue-form-generator .field-wrap button:not(:last-child),
.vue-form-generator .field-wrap input[type="submit"]:not(:last-child) {
	margin-right: 4px;
}
.vue-form-generator .field-wrap button:hover,
.vue-form-generator .field-wrap input[type="submit"]:hover {
	color: #333;
	background-color: #e6e6e6;
	border-color: #adadad;
}
.vue-form-generator .field-wrap button:active,
.vue-form-generator .field-wrap input[type="submit"]:active {
	color: #333;
	background-color: #d4d4d4;
	border-color: #8c8c8c;
	outline: 0;
	box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
}
.vue-form-generator .field-wrap button:disabled,
.vue-form-generator .field-wrap input[type="submit"]:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}
.vue-form-generator .field-wrap button,
.vue-form-generator .field-wrap input[type="submit"] {
	display: inline-block;
	padding: 6px 12px;
	margin: 0px;
	font-size: 14px;
	font-weight: normal;
	line-height: 1.42857143;
	text-align: center;
	white-space: nowrap;
	vertical-align: middle;
	touch-action: manipulation;
	cursor: pointer;
	user-select: none;
	color: #333;
	background-color: #fff;
	border: 1px solid #ccc;
	border-radius: 4px;
}

.vue-form-generator .field-wrap {
	display: flex;
}

.vue-form-generator .hint {
	font-style: italic;
	font-size: 0.8em;
}
</style>
