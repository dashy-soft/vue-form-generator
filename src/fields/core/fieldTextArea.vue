<template>
	<div>
	<textarea class="form-control"
		v-model="value"
		:id="fieldUID"
		:class="fieldClasses"
		:disabled="disabled"
		:maxlength="schema.max"
		:minlength="schema.min"
		:placeholder="placeholder"
		:required="required"
		:readonly="readonly"
		:rows="schema.rows || 2"
		:name="inputName"
		v-attributes="'input'"></textarea>

	</div>
</template>

<script lang="ts">
import abstractField from "../abstractField";

export default {
	name: "field-textArea",
	mixins: [abstractField]
};
</script>
