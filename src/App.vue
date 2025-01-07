<template lang="pug">
div(class="app-container")
  div(class="search-container")
    a-tooltip(placement="topLeft" class="help-tooltip")
      template(#title)
        div(class="help-content") 
          h4 快捷操作：
          ol
            li 后退: <LeftOutlined /> 或 <ArrowLeftOutlined />
            li 前进: <RightOutlined /> 或 <ArrowRightOutlined />
            li 查词: 双击单词
      QuestionCircleOutlined
    a-input-search(
      v-model:value="search"
      placeholder="请输入单词"
      class="search-input"
      @search="onSearch"
      @input="onInput"
      size="large"
    )
    a-select-dropdown(
      v-if="suggestions.length > 0"
      :visible="true"
      class="suggestion-dropdown"
    )
      a-select-item(
        v-for="suggestion in suggestions"
        :key="suggestion"
        @click="selectSuggestion(suggestion)"
        class="suggestion-item"
        :class="{ 'selected': suggestion === search }"
      ) {{ suggestion }}
  a-tabs(
    :activeKey="currMdx"
    @update:activeKey="selectMdx"
    :animated="{ inkBar: true, tabPane: false }"
    :centered="dataSource.length<3"
    class="content-tabs"
  )
    a-tab-pane(v-for="item of dataSource" :key="item.title" :forceRender="true")
      template(#tab)
        div(class="tab-item")
          a-tooltip(color="#1677ff")
            QuestionCircleOutlined(class="info-icon")
            template(#title)
              div(class="mdx-info")
                h4 {{ item.mdxHeader.Title }}
                div(v-html="item.mdxHeader.Description")
          span(class="tab-title" :title="item.title") {{ item.title }}
      iframe(:src="item.url" loading="lazy" :title="item.title" frameborder="0" class="content-frame")
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
const suggestions = ref<string[]>([]);

const fetchSuggestions = async (query: string) => {
  try {
    const response = await fetch(`/api/wq?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    suggestions.value = data.suggestions || [];
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    suggestions.value = [];
  }
};

const onInput = async (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  if (value && value.length > 0) {
    await fetchSuggestions(value);
  } else {
    suggestions.value = [];
  }
};

const selectSuggestion = (suggestion: string) => {
  search.value = suggestion;
  suggestions.value = [];
  onSearch();
};

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
// 添加响应式断点变量
$screen-xs: 480px;
$screen-sm: 576px;
$screen-md: 768px;
$screen-lg: 992px;
$screen-xl: 1200px;

.app-container {
  max-width: $screen-xl;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #ffffff;
  box-sizing: border-box;

  @media (max-width: $screen-md) {
    padding: 12px;
    gap: 16px;
  }

  @media (max-width: $screen-sm) {
    padding: 8px;
    gap: 12px;
  }
}

.search-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  position: relative;

  @media (max-width: $screen-sm) {
    max-width: 100%;
    gap: 8px;
  }
}

.help-tooltip {
  position: absolute;
  left: -32px;
  top: 50%;
  transform: translateY(-50%);

  @media (max-width: $screen-sm) {
    position: static;
    transform: none;
  }

  .anticon {
    color: #1677ff;
    font-size: 16px;
    transition: all 0.3s ease;

    &:hover {
      color: #4096ff;
      transform: scale(1.1);
    }

    @media (max-width: $screen-sm) {
      font-size: 14px;
    }
  }
}

.help-content {
  h4 {
    margin: 0 0 8px;
    color: #ffffff;

    @media (max-width: $screen-sm) {
      font-size: 14px;
      margin-bottom: 4px;
    }
  }

  ol {
    margin: 0;
    padding-inline-start: 20px;
    color: #ffffff;

    @media (max-width: $screen-sm) {
      font-size: 12px;
      padding-inline-start: 16px;
    }
  }
}

.search-input {
  width: 100%;

  .ant-input {
    border-radius: 8px;

    &:hover,
    &:focus {
      border-color: #4096ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }

    @media (max-width: $screen-sm) {
      font-size: 14px;
      height: 32px;
    }
  }

  .ant-input-search-button {
    border-radius: 0 8px 8px 0;
    height: 40px;

    @media (max-width: $screen-sm) {
      height: 32px;
    }
  }
}

.content-tabs {
  flex: 1;
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  min-height: 0;

  @media (max-width: $screen-md) {
    padding: 12px;
  }

  @media (max-width: $screen-sm) {
    padding: 8px;
    border-radius: 4px;
  }

  .ant-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .ant-tabs-content-holder {
    flex: 1;
    min-height: 0;
  }

  .ant-tabs-content {
    height: 100%;
  }

  .ant-tabs-tabpane {
    height: 100%;
  }

  .ant-tabs-nav {
    margin-bottom: 16px;

    @media (max-width: $screen-sm) {
      margin-bottom: 8px;
    }

    &::before {
      border-bottom-color: #f0f0f0;
    }
  }

  .ant-tabs-tab {
    transition: all 0.3s ease;
    padding: 8px 16px;

    @media (max-width: $screen-md) {
      padding: 6px 12px;
    }

    @media (max-width: $screen-sm) {
      padding: 4px 8px;
    }

    &:hover {
      color: #1677ff;
    }

    &.ant-tabs-tab-active {
      .tab-title {
        color: #1677ff;
      }
    }
  }
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;

  @media (max-width: $screen-sm) {
    gap: 4px;
    padding: 2px 0;
  }
}

.info-icon {
  font-size: 14px;
  color: #8c8c8c;
  transition: color 0.3s ease;

  @media (max-width: $screen-sm) {
    font-size: 12px;
  }

  &:hover {
    color: #1677ff;
  }
}

.tab-title {
  user-select: none;
  font-size: 14px;
  color: #262626;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: $screen-md) {
    max-width: 100px;
    font-size: 13px;
  }

  @media (max-width: $screen-sm) {
    max-width: 80px;
    font-size: 12px;
  }
}

.mdx-info {
  max-height: 480px;
  overflow: auto;
  padding: 12px;

  @media (max-width: $screen-sm) {
    max-height: 320px;
    padding: 8px;
  }

  h4 {
    margin: 0 0 8px;
    color: #ffffff;

    @media (max-width: $screen-sm) {
      font-size: 14px;
      margin-bottom: 4px;
    }
  }
}

.content-frame {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  padding: 12px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  @media (max-width: $screen-md) {
    border-radius: 6px;
  }

  @media (max-width: $screen-sm) {
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  }
}

// Override some Ant Design styles
.ant-tooltip {
  max-width: 400px;

  @media (max-width: $screen-md) {
    max-width: 300px;
  }

  @media (max-width: $screen-sm) {
    max-width: 250px;
  }
}

.anticon {
  margin-right: 4px !important;

  @media (max-width: $screen-sm) {
    margin-right: 2px !important;
  }
}

.suggestion-dropdown {
  width: 100%;
  max-height: 240px;
  overflow-y: auto;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border-radius: 8px;
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08),
              0 3px 6px -4px rgba(0, 0, 0, 0.12),
              0 9px 28px 8px rgba(0, 0, 0, 0.05);
  margin-top: 4px;
  padding: 4px 0;
  opacity: 0;
  transform: translateY(-10px);
  animation: dropdownEnter 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;

  @keyframes dropdownEnter {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #e6e6e6;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  .suggestion-item {
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-left: 3px solid transparent;
    line-height: 1.5;
    font-size: 14px;

    &:hover {
      background-color: #f5f5f5;
      border-left-color: #1890ff;
    }

    &:active {
      background-color: #e6f4ff;
    }

    &.selected {
      background-color: #e6f4ff;
      border-left-color: #1890ff;
      color: #1890ff;
      font-weight: 500;
    }
  }
}
</style>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}
</style>

<style scoped lang="scss">
// .container {
//   padding: 8px 4px;
//   height: 100%;

//   box-sizing: border-box;
//   background-color: rgb(253, 253, 253);

//   display: flex;
//   flex-direction: column;
// }

iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
