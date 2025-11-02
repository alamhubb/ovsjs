Subhuti (सुभूति)

Automatic conversion between two different programming languages through two grammar files that define the same grammar structure and grammar name

meaning: Make the conversion between programming languages as flexible as the 72 transformations of the Monkey King Sun Wukong, who was taught by Subhuti

---

## 🎉 Latest Update [2025-11-02]

**重大修复：回溯机制优化（写时复制）**

修复了 Or 规则回溯时的 CST 污染问题，通过写时复制策略：
- ✅ 空节点从 80%+ 降低到 13%（合理范围）
- ✅ 无重复 token 节点
- ✅ CST 结构完全正确
- ✅ 性能影响可忽略

详见：[docs/BACKTRACK_FIX.md](./docs/BACKTRACK_FIX.md)

---

test
```
1. npm i
2. npm run test
```

todo

需要支持多parser的组合， particula 方式