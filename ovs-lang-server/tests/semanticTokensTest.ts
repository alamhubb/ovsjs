// 这是最开始触发的地方

// 注册标准的 full 请求处理器
// server.connection.languages.semanticTokens.on(async (params, token, _, resultProgress) => {
//   const uri = URI.parse(params.textDocument.uri);
//   LogUtil.log("🔥 Semantic Tokens FULL Request Received!");
//   LogUtil.log("  URI:", params.textDocument.uri);
//   LogUtil.log("  Has range:", params.range !== undefined);
//
//   const result = await worker(uri, token, async languageService => {
//     LogUtil.log("  Inside worker callback");
//     return await languageService?.getSemanticTokens(
//       uri,
//       undefined,
//       serverCapabilities.semanticTokensProvider!.legend,
//       tokens => resultProgress?.report(tokens),
//       token,
//     );
//   }) ?? {data: []};
//
//   LogUtil.log("  Returning tokens count:", result.data.length);
//   return result;
// });