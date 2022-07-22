<template>
	<input :id="fieldID"
		type="submit"
		:value="schema.buttonText"
		@click="onClick"
		:name="inputName"
		:disabled="disabled"
		:class="fieldClasses"
		v-attributes="'input'">
</template>

<script>
import abstractField from "../abstractField";
import { isEmpty } from "lodash";

export default {
	name: "field-submit",
	mixins: [abstractField],

	methods: {
		onClick($event) {
			if (this.schema.validateBeforeSubmit === true) {
				// prevent a <form /> from having it's submit event triggered
				// when we have to validate data first
				$event.preventDefault();

				this.eventBus.$emit("fields-validation-trigger");
				this.eventBus.$on("fields-validation-terminated", (formErrors) => {
					if (!isEmpty(formErrors) && typeof this.schema.onValidationError === "function") {
						this.schema.onValidationError(this.model, this.schema, formErrors, $event);
					} else if (typeof this.schema.onSubmit === "function") {
						this.schema.onSubmit(this.model, this.schema, $event);
					}
				});
			} else if (typeof this.schema.onSubmit === "function") {
				// if we aren't validating, just pass the onSubmit handler the $event
				// so it can be handled there
				this.schema.onSubmit(this.model, this.schema, $event);
			}
		}
	}
};
</script>

<style >
.vue-form-generator .field-submit input {
	color: #fff !important;
	background-color: #337ab7 !important;
	border-color: #2e6da4 !important;
}
</style>
