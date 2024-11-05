<template lang="pug">
div(class="container")
  a-input-search(
    v-model:value="search"
    placeholder="请输入查询单词"
    style="display: block; width: 360px; margin: auto;"
    @search="onSearch"
  )
  a-tabs(v-model:activeKey="activeKey")
    a-tab-pane(v-for="item of dataSource" :key="item.prefix" :tab="item.title")
      iframe(:src="item.url")
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

const DefaultWord = "welcome";

const search = ref<string>(location.pathname.slice(1) || DefaultWord);

const onSearch = () => {
  console.log(search.value);
  if (!search.value) search.value = DefaultWord;
  dataSource.value.forEach((it) => (it.url = it.prefix + "/" + search.value));
};

const activeKey = ref<string>();

function zero2Local(hostname: string) {
  return hostname.replace("0.0.0.0", "localhost");
}

const dataSource = ref<
  {
    prefix: string;
    url: string;
    title: string;
  }[]
>([]);

onMounted(async () => {
  const resp = await fetch("/info", { method: "POST" });
  const { data } = await resp.json();
  dataSource.value = data.map((it: any) => {
    const prefix = "http://" + zero2Local(it.hostname) + ":" + it.port;
    const url = prefix + "/" + search.value;
    const title = it.mdxHeader?.Title || it.mdxDir.slice(it.mdxDir.lastIndexOf("/") + 1);
    return { prefix, url, title };
  });
  if (dataSource.value.length) activeKey.value = dataSource.value[0].prefix;
});
</script>

<style scoped lang="scss">
.container {
  padding: 8px;
  width: 375px;
  background-color: rgb(250, 250, 250);
}

iframe {
  width: 375px;
  height: max(calc(100vh - 116px), 675px);
  border: 0;
}
</style>
