<template>
	<fieldset v-if="fields"
		:is="tag"
		:class="[groupRowClasses, validationClass]"
		ref="group">
		<slot
			name="group-legend"
			:group="group"
			:group-legend="groupLegend"></slot>
		<slot
			name="group-help"
			:group="group"></slot>
		<template v-for="(field, index) in fields">
			<template v-if="fieldVisible(field)">
				<template v-if="field.type === 'group'">
					<vfg-form-group :fields="field.fields"
						:group="field"
						:tag="getGroupTag(field)"
						:model="model"
						:options="options"
						:errors="errors"
						:event-bus="eventBus"
						:key="index"
						:parent-groups="[...parentGroups, this]">
						<template #group-legend="slotProps">
							<slot
								name="group-legend"
								:group="slotProps.group"
								:group-legend="slotProps.groupLegend"
							/>
						</template>
						<template #group-help="slotProps">
							<slot
								name="group-help"
								:group="slotProps.group"
							/>
						</template>

						<template #element="slotProps">
							<slot name="element"
								:field="slotProps.field"
								:model="slotProps.model"
								:options="slotProps.options"
								:errors="slotProps.errors"
								:eventBus="slotProps.eventBus"
							/>
						</template>
					</vfg-form-group>
				</template>
				<template v-else>
					<slot name="element"
						:field="field"
						:model="model"
						:options="options"
						:errors="errors"
						:eventBus="eventBus"
					/>
				</template>
			</template>
			<template v-else>
				<slot name="field-invisible"
					:field="field"
					:model="model"
					:options="options"
					:errors="errors"
					:eventBus="eventBus"
				/>
			</template>
		</template>
	</fieldset>
</template>
<script>
import formMixin from "./formMixin.js";

export default {
	name: "vfg-form-group",
	mixins: [formMixin],
	props: {
		fields: {
			type: Array,
			default() {
				return [];
			}
		},
		group: {
			type: Object,
			default() {
				return {};
			}
		},
		tag: {
			type: String,
			default: "fieldset",
			validator(value) {
				return value.length > 0;
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
				return {};
			}
		},
		errors: {
			type: Array,
			default() {
				return [];
			}
		},
		eventBus: {
			type: Object,
			default() {
				return {};
			}
		},
		parentGroups: {
			type: Array,
			default: () => [],
		},
	},
	data() {
		return {
			validationClass: {}
		};
	},
	computed: {
		groupLegend() {
			if (this.group && this.group.legend) {
				return this.group.legend;
			}
		},
		groupRowClasses() {
			// TODO find a way to detect errors in child to add some classes (error/valid/etc)
			let baseClasses = {
				"field-group": true
			};
			if (!this.group == null) {
				baseClasses = this.getStyleClasses(this.group, baseClasses);
			}
			return baseClasses;
		}
	},
	methods: {
		// Get visible prop of field
		fieldVisible(field) {
			if (typeof field.visible === "function") {
				return field.visible.call(this, this.model, field, this);
			}

			if (field.visible == null) {
				return true;
			}

			return field.visible;
		},

		getGroupTag(field) {
			if (!field.tag == null) {
				return field.tag;
			} else {
				return this.tag;
			}
		}
	},
	created() {
		this.eventBus.$on("field-validated", () => {
			this.$nextTick(() => {
				let containFieldWithError;
				if(this.$refs.group) {
					containFieldWithError =
						this.$refs.group.querySelector(
							".form-element." + this.options.validationErrorClass || "error"
						) !== null;
				} else {
					containFieldWithError = false;
				}
				this.validationClass = {
					[this.options.validationErrorClass || "error"]: containFieldWithError,
					[this.options.validationSuccessClass || "valid"]: !containFieldWithError
				};
			});
		});
	}
};
</script>
