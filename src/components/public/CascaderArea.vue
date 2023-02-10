<script>
import { getAreaList } from "@/api/public/index";
export default {
  props: {
    placeholder: {
      type: String,
    },
    showLevel: {
      type: Number,
      default: 3,
    },
    width: {
      type: String,
      default: "300px",
    },
    value: {
      type: [Array, String],
    },
  },
  data() {
    var that = this;
    return {
      props: {
        lazy: true,
        lazyLoad(node, resolve) {
          if (node.data) {
            const {
              data: { level, value },
            } = node;
            that.init(parseInt(level) + 1, value).then(list => {
              resolve(list);
            });
          } else {
            that.init(1).then(list => {
              resolve(list);
            });
          }
        },
      },
    };
  },
  watch: {
    value() {
      // this.$refs.cascader.panel.lazyLoad();
    },
  },
  methods: {
    async init(level, parentId) {
      // 数据请求
      const {
        data: { list: data },
      } = await getAreaList({ level, parentId });
      return data.map(item => {
        return { label: item.name, value: item.id, level: item.level, leaf: level > this.showLevel - 1 };
      });
    },
    handleChange(value) {
      this.$emit("changeArea", value);
    },
  },
  render(h) {
    return h("el-cascader", {
      props: {
        value: this.value,
        props: this.props,
      },
      ref: "cascader",
      attrs: {
        placeholder: this.placeholder,
      },
      style: {
        width: this.width,
      },
      on: {
        change: this.handleChange,
      },
    });
  },
};
</script>

<style></style>
