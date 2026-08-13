// 💡 开发模式下：仅匹配 Example 或空白页，避免刷掉复杂的 Google 生产环境
// 💡 生产构建下：匹配所有网页 (*://*/*)
const targetMatches = import.meta.env.DEV
  ? ['https://example.com/*', 'https://httpbin.org/*']
  : ['<all_urls>']; 

export default defineContentScript({
  matches: targetMatches,
  // 💡 如果在生产环境中你不需要默认自动注入，完全可以保留 [] 匹配或通过 command 手动触发
  runAt: 'document_idle', // 推荐：等待页面空闲时注入，提升网页加载性能

  main(ctx) {
    console.log(`[PulseTimer] Content script initialized in ${import.meta.env.MODE} mode.`);

    // 这里编写你的核心业务逻辑
  },
});