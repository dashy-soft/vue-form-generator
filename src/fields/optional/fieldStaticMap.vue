<template>
	<img :src="mapLink">
</template>

<script>
import abstractField from "../abstractField";

export default {
	name: "field-staticmap",
	mixins: [abstractField],

	computed: {
		mapLink() {
			if (this.value) {
				let lat, lng;
				const opts = {
					lat: "lat",
					lng: "lng",
					zoom: 8,
					sizeX: 640,
					sizeY: 640,
					...this.fieldOptions,
				}

				lat = this.value[opts.lat];
				lng = this.value[opts.lng];

				let url = `http://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${
					opts.zoom
				}&size=${opts.sizeX}x${opts.sizeY}`;

				let props = [
					"scale",
					"format",
					"maptype",
					"language",
					"region",
					"markers",
					"path",
					"visible",
					"style",
					"key",
					"signature"
				];
				for (let prop of props) {
					if (typeof opts[prop] !== "undefined") {
						url += `&${prop}=${opts[prop]}`;
					}
				}
				if (lat && lng) {
					return url;
				}
			}
		}
	}
};
</script>

<style>
.vue-form-generator .field-staticMap img {
	display: block;
	width: auto;
	max-width: 100%;
}
</style>
