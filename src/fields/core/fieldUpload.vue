<template >
	<div class="wrapper"
		v-attributes="'wrapper'">
		<input class="form-control"
			:id="fieldID"
			type="file"
			:name="inputName"
			@change="onChange"
			:accept="fieldOptions.accept"
			:multiple="fieldOptions.multiple"
			:placeholder="placeholder"
			:readonly="readonly"
			:required="schema.required"
			:disabled="disabled"
			v-attributes="'input'">
	</div>
</template>

<script>
import abstractField from "../abstractField";

export default {
	name: "field-upload",
	mixins: [abstractField],
	methods: {
		onChange($event) {
			if (typeof this.fieldOptions.onChanged === "function") {
				// Schema has defined onChange method.
				this.fieldOptions.onChanged.call(this, this.model, this.schema, $event, this);
			}
		}
	}
};
</script>

<style scoped>
.wrapper {
	width: 100%;
}
.helper {
	margin: auto 0.5em;
}
</style>
