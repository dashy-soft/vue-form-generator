<template>
	<input :id="randomId"
		type="checkbox"
		v-model="value"
		:autocomplete="schema.autocomplete"
		:disabled="disabled"
		:name="inputName + '-' + randomId"
		:class="fieldClasses"
		:required="required"
		v-attributes="'input'" >
</template>

<script>
import abstractField from "../abstractField";

export default {
	name: "field-checkbox",
	mixins: [abstractField],
	computed: {
		randomId() {
			return this.fieldID + '-' + Math.trunc(Math.random()*100000);
		}
	}
};
</script>

<style>
.vue-form-generator .field-checkbox input {
	margin-left: 12px;
}
</style>
