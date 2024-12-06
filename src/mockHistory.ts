import { message } from "ant-design-vue";

// 检索历史
const searchHistory: string[] = [];
// 最大历史记录
const maxLen = 50;

// 当前索引
let currIdx = -1;

// debug log searchHistory
// function logHistoryInfo() {
//   console.log(searchHistory, currIdx, searchHistory[currIdx]);
// }

// 新增检索记录
export function addRecord(word: string) {
  const len = searchHistory.length;
  if (currIdx === len - 1) {
    // 末尾
    currIdx++;
    searchHistory.push(word);
    if (len === maxLen) {
      currIdx--;
      searchHistory.shift();
    }
  } else {
    // 非末尾，比如后退2次后，再次输入新的单词时，则新增记录，并且删除末尾历史记录
    currIdx++;
    searchHistory.splice(currIdx, len - currIdx, word);
  }
  // logHistoryInfo();
}

// 模拟前进
function forward() {
  const len = searchHistory.length;
  if (currIdx < len - 1) {
    currIdx++;
    return searchHistory[currIdx];
  } else {
    message.warn({ key: "navigate", content: "已经到尾，无法前进！" });
  }
}

// 模拟后退
function back() {
  if (currIdx > 0) {
    currIdx--;
    return searchHistory[currIdx];
  } else {
    message.warn({ key: "navigate", content: "已经到头，无法后退！" });
  }
}

// 模拟跳转
export function jump(dir: 1 | -1) {
  let word: string | undefined = undefined;
  if (dir === 1) {
    word = forward();
  } else if (dir === -1) {
    word = back();
  }
  // logHistoryInfo();
  return word;
}
