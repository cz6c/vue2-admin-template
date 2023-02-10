<template functional>
  <div class="text-map">
    <span :style="`color:${props.map[props.text].color}`">
      {{ props.map[props.text].name }}
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
export interface Map {
  [propName: string]: {
    name: string;
    color?: string;
  };
}

@Component({
  name: "TextMap",
})
export default class TextMap extends Vue {
  @Prop({ type: Object, required: true })
  map!: Map;

  @Prop({ type: String, required: true })
  text!: string;
}
</script>
