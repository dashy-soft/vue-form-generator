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
			const crypto = window.crypto || window.msCrypto;
			const array = new Uint32Array(1);

			return this.fieldID + '-' + crypto.getRandomValues(array)[0];
		}
	}
};
</script>

<style>
.vue-form-generator .field-checkbox input {
	margin-left: 12px;
}
</style>
