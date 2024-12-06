import { createApp } from "vue";
import { message } from "ant-design-vue";

import "./style.css";
import App from "./App.vue";

createApp(App).mount("#app");

message.config({ top: `30px` });
