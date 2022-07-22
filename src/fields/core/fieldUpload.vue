<template >
	<div class="wrapper"
		v-attributes="'wrapper'">
		<input class="form-control"
			:id="fieldID"
			type="file"
			:name="inputName"
			@change="onChange"
			:accept="schema.accept"
			:multiple="schema.multiple"
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
			if (typeof this.schema.onChanged === "function") {
				// Schema has defined onChange method.
				this.schema.onChanged.call(this, this.model, this.schema, $event, this);
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
