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
<script setup lang="ts">
import { computed, defineProps, nextTick, onMounted, useTemplateRef } from 'vue';
const props = defineProps({
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
		validator(value: any) {
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
});
let validationClass = {};
const groupRef = useTemplateRef('group');

onMounted(() => {
	props.eventBus.$on("field-validated", () => {
		nextTick(() => {
			let containFieldWithError: any;
			if(groupRef.value) {
				containFieldWithError =
				groupRef.value.querySelector(
						".form-element." + props.options.validationErrorClass || "error"
					) !== null;
			} else {
				containFieldWithError = false;
			}
			validationClass = {
				[props.options.validationErrorClass || "error"]: containFieldWithError,
				[props.options.validationSuccessClass || "valid"]: !containFieldWithError
			};
		});
	});
});

const getStyleClasses = (field: Record<string, any>, baseClasses: Record<string, any>) => {
	let styleClasses = field.styleClasses;

	if (Array.isArray(styleClasses)) {
		styleClasses.forEach((c: string) => {
			baseClasses[c] = true;
		});
	} else if (typeof styleClasses === 'string' && styleClasses !== '') {
		baseClasses[styleClasses] = true;
	}
	return baseClasses;
};

// Get visible prop of field
const fieldVisible = (field: any) => {
	if (typeof field.visible === "function") {
		return field.visible.call(this, props.model, field, this);
	}

	if (field.visible == null) {
		return true;
	}

	return field.visible;
};

const getGroupTag = (field: any) => {
	if (!field.tag == null) {
		return field.tag;
	} else {
		return props.tag;
	}
};
const groupLegend = computed(() => {
	if (props.group && props.group.legend) {
		return props.group.legend;
	}
});

const groupRowClasses = computed(() => {
	// TODO find a way to detect errors in child to add some classes (error/valid/etc)
	let baseClasses: Record<string, boolean> = {
		"field-group": true
	};
	if (!props.group == null) {
		baseClasses = getStyleClasses(props.group, baseClasses);
	}
	return baseClasses;
});

</script>
