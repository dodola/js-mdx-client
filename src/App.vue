<template lang="pug">
div(class="container")
  a-input-search(
    v-model:value="search"
    placeholder="请输入查询单词"
    style="display: block; width: 360px; margin: auto;"
    @search="onSearch"
  )
  a-tabs(:activeKey="activeKey" @update:activeKey="updateActiveKey" :animated="false" centered)
    a-tab-pane(v-for="item of dataSource" :key="item.title" :forceRender="true")
      template(#tab)
        a-tooltip(color="#1677ff")
          QuestionCircleOutlined
          template(#title)
            div(style="max-height: 480px; overflow: auto;")
              h4 {{ item.mdxHeader.Title }}
              div(v-html="item.mdxHeader.Description")
        span {{ item.title }}
      iframe(:src="item.url")
</template>

<script setup lang="ts">
import { QuestionCircleOutlined } from "@ant-design/icons-vue";
import { onMounted, ref } from "vue";

const DefaultWord = "welcome";

// ex: http://127.0.0.1:3000/?q=welcome
const genUrl = (prefix: string) => `${prefix}/${search.value}`;

const search = ref<string>();

const onSearch = () => {
  if (!search.value) search.value = DefaultWord;
  dataSource.value.forEach((it) => (it.url = genUrl(it.prefix)));
  history.pushState(null, "", `${search.value}`);
};

const activeKey = ref<string>();
const updateActiveKey = (val: string) => {
  activeKey.value = val;
  localStorage.setItem("activeKey", val || "");
};

function fmtHostname(hostname: string) {
  return hostname.replace("0.0.0.0", "127.0.0.1");
}

const dataSource = ref<
  {
    prefix: string;
    url: string;
    title: string;
    mdxHeader: IMdxHeader;
  }[]
>([]);

type IMdxHeader = {
  GeneratedByEngineVersion: string; //"2.0";
  RequiredEngineVersion: string; //"2.0";
  Format: string; //"Html";
  KeyCaseSensitive: string; //"No";
  StripKey: string; //"Yes";
  Encrypted: string; //"0";
  RegisterBy: string; //"EMail";
  Description: string; //"<p>  MADE by vivo<br /> <br /> <br /> <br /> 2022-02-22日修正版<br /> <br /> <br /> 校改若干零散错误<br /> <br /> <br /> 2022-01-06日校正版<br /> <br /> <br /> 1）在MDict中再次通读词典，修复数百处细节错误；<br /> <br /> 2）中文例句翻译中的半角标点修正为全角；<br /> <br /> 3）删除中英文例句中赘余的引号<br /> <br /> <br /> <br /> 2022-01-02日改正版<br /> <br /> <br /> 1）修复30余处词组错位等；<br /> <br /> 2）释义内不匹配的半角括号改为全角；<br /> <br /> 3）改正mdictfan提出的单词粘连问题<br /> <br /> <br /> 2021-12-27日校改版<br /> <br /> <br /> 1）快速通读整个词典，找到并更改300处左右的错误；<br /> <br /> 2）usage标签改为idiom；<br /> <br /> 3）补充缺失的phrase、idiom标签；<br /> <br /> 4）添加 guide 标签；<br /> <br /> 5）删除重复多余的“headword”标签；<br /> <br /> 6）借鉴supplement提供的css，版面略作调整<br /> <br /> <br /> 2021-12-15日初步修正版<br /> <br /> <br /> 1）替换音标，不再需要金山音标字体依赖；<br /> <br /> 2）更改黑方块（■）标志为序数形式；<br /> <br /> 3）零散修改部分错误；<br /> <br /> 4）规范class命名，略微调整CSS；<br /> <br /> 5）更改词典名称为《21世纪英汉词典》<br /> <br /> <br /> <br /> 原始MDX词典信息<br /> <br /> 数据来自：金山词霸2007 PWDECMEC.DIC，用KSDrip.exe（工具作者dwing）提取。<br /> <br /> 制作者：O 版本：v1.1，2013年10月11日 19:46:41<br /> </p>";
  Title: string; //"21世纪英汉词典";
  Encoding: string; //"UTF-8";
  CreationDate: string; //"2022-2-22";
  Compact: string; //"Yes";
  Compat: string; //"Yes";
  Left2Right: string; //"Yes";
  DataSourceFormat: string; //"106";
  StyleSheet: string; //"";
};

onMounted(async () => {
  const query = location.pathname.slice(1);

  if (query) search.value = query;
  else {
    search.value = DefaultWord;
    history.replaceState(null, "", `${DefaultWord}`);
  }

  const resp = await fetch("/api/info", { method: "POST" });
  const { data } = await resp.json();
  dataSource.value = data.map((it: any) => {
    const prefix = "http://" + fmtHostname(it.hostname) + ":" + it.port;
    const url = genUrl(prefix);

    const title = it.mdxDir.slice(it.mdxDir.lastIndexOf("/") + 1);
    return { prefix, url, title, mdxHeader: it.mdxHeader as IMdxHeader };
  });
  const prevKey = localStorage.getItem("activeKey");
  if (dataSource.value.length) {
    const titles = dataSource.value.map((it) => it.title);
    if (!prevKey) activeKey.value = titles[0];
    else if (titles.includes(prevKey)) activeKey.value = prevKey;
    else activeKey.value = titles[0];
  }
});
</script>

<style scoped lang="scss">
.container {
  padding: 4px;
  width: 375px;
  box-sizing: border-box;
  background-color: rgb(250, 250, 250);
}

iframe {
  width: 100%;
  height: max(calc(100vh - 116px), 675px);
  border: 0;
}
</style>
