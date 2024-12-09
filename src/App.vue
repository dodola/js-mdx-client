<template lang="pug">
div(class="container")
  div(style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 352px; margin: 0 auto;")
    a-tooltip(placement="topLeft")
      template(#title)
        div 快捷操作： 
        ol(style="margin: 0; padding-inline-start: 20px;")
          li 后退: <LeftOutlined /> 或 <ArrowLeftOutlined />
          li 前进: <RightOutlined /> 或 <ArrowRightOutlined />
          li 查词: 双击单词
      QuestionCircleOutlined(style="color: #1677ff;")
    a-input-search(
      v-model:value="search"
      placeholder="请输入单词"
      style="display: block; width: 352px; margin: 0 auto;"
      @search="onSearch"
    )
  a-tabs(
    :activeKey="currMdx"
    @update:activeKey="selectMdx"
    :animated="false"
    :centered="dataSource.length<3"
    size="small"
  )
    a-tab-pane(v-for="item of dataSource" :key="item.title" :forceRender="true")
      template(#tab)
        a-tooltip(color="#1677ff")
          QuestionCircleOutlined(style="font-size: 12px;")
          template(#title)
            div(style="max-height: 480px; overflow: auto;")
              h4 {{ item.mdxHeader.Title }}
              div(v-html="item.mdxHeader.Description")
        span(style="user-select: none;" :title="item.title") {{ item.title }}
      iframe(:src="item.url" :title="item.title" frameborder="0")
</template>

<script setup lang="ts">
import {
  QuestionCircleOutlined,
  LeftOutlined,
  RightOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons-vue";
import { onMounted, ref } from "vue";
import { addRecord, jump } from "./mockHistory";

const search = ref<string>();

// ex: http://127.0.0.1:3000/welcome
const genUrl = (prefix: string) => `${prefix}/${search.value}`;

const onSearch = () => {
  if (!search.value) return;

  // 更新iframe链接
  dataSource.value.forEach((it) => (it.url = genUrl(it.prefix)));
  history.replaceState(null, "", `${search.value}`);
  addRecord(search.value);
};

// 表示当前选中的mdx
const currMdx = ref<string>();

// 点击tab，选中新的mdx
const selectMdx = (val: string) => {
  currMdx.value = val;
  localStorage.setItem("currMdx", val || "");
};

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

const DefaultWord = "welcome";

onMounted(async () => {
  // http://localhost:5173/{word}
  const query = location.pathname.slice(1);

  if (query) {
    search.value = query;
  } else {
    search.value = DefaultWord;
    history.replaceState(null, "", `${DefaultWord}`);
  }

  addRecord(search.value);

  const resp = await fetch("/api/info", { method: "POST" });
  const { data } = await resp.json();
  dataSource.value = data.map((it: any) => {
    const prefix = "http://" + location.hostname + ":" + it.port;
    const url = genUrl(prefix);

    return { prefix, url, title: it.title, mdxHeader: it.mdxHeader as IMdxHeader };
  });

  const prevMdx = localStorage.getItem("currMdx");
  if (dataSource.value.length) {
    const titles = dataSource.value.map((it) => it.title);
    if (!prevMdx) currMdx.value = titles[0];
    else if (titles.includes(prevMdx)) currMdx.value = prevMdx;
    else currMdx.value = titles[0];
  }
});

function mockJump(dir: 1 | -1) {
  if (dir === undefined) return;

  const word = jump(dir);
  if (!word) return;

  search.value = word;
  // 更新iframe链接
  dataSource.value.forEach((it) => (it.url = genUrl(it.prefix)));
  history.replaceState(null, "", `${search.value}`);
}

const left = [",", "<", "，", "《", "ArrowLeft"];
const right = [".", ">", "。", "》", "ArrowRight"];

document.addEventListener("keyup", (e) => {
  // 存在输入时，不响应跳转逻辑
  if (document.activeElement?.tagName === "INPUT") return;

  let dir: 1 | -1 | undefined = undefined;

  if (left.includes(e.key)) dir = -1;
  else if (right.includes(e.key)) dir = 1;

  if (dir === undefined) return;

  e.preventDefault();
  e.stopPropagation();
  mockJump(dir);
});

window.addEventListener(
  "message",
  ({
    data,
  }: MessageEvent<{
    jump?: -1 | 1;
    select?: string;
  }>) => {
    // 前后跳转
    if ("jump" in data) {
      const dir = data.jump;
      if (dir === undefined) return;

      mockJump(dir);
    }
    // 选中跳转
    else if ("select" in data) {
      if (!data.select) return;
      if (search.value === data.select) return;

      search.value = data.select;
      onSearch();
    }
  }
);
</script>

<style lang="scss">
.ant-tabs {
  flex: 1;
}
.ant-tabs-nav {
  margin-bottom: 0;
}
.anticon {
  margin-right: 4px !important;
}

.ant-tabs-tab {
  max-width: 120px;
  overflow: hidden;

  .ant-tabs-tab-btn {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

.ant-tabs-content-holder {
  flex: 1;
}
.ant-tabs-content {
  height: 100%;
}
.ant-tabs-tabpane {
  display: flex;
  flex: 1;
}
</style>

<style scoped lang="scss">
.container {
  padding: 8px 4px;
  height: 100%;

  box-sizing: border-box;
  background-color: rgb(253, 253, 253);

  display: flex;
  flex-direction: column;
}

iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
