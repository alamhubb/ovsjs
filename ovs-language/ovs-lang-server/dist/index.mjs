import { createConnection, createServer, createTypeScriptProject, loadTsdkByPath } from "@volar/language-server/node.js";
import * as fs from "fs";
import * as path$1 from "path";
import { fileURLToPath } from "url";
import * as nls from "vscode-nls";
import * as path from "path-browserify";
import * as semver from "semver";
import * as tsWithImportCache from "typescript-auto-import-cache";
import { URI } from "vscode-uri";
import { forEachEmbeddedCode } from "@volar/language-core";
import ts from "typescript";
import { vitePluginOvsTransform } from "ovsjs";

//#region \0@oxc-project+runtime@0.101.0/helpers/typeof.js
function _typeof(o) {
	"@babel/helpers - typeof";
	return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o$1) {
		return typeof o$1;
	} : function(o$1) {
		return o$1 && "function" == typeof Symbol && o$1.constructor === Symbol && o$1 !== Symbol.prototype ? "symbol" : typeof o$1;
	}, _typeof(o);
}

//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/toPrimitive.js
function toPrimitive(t, r) {
	if ("object" != _typeof(t) || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r || "default");
		if ("object" != _typeof(i)) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return ("string" === r ? String : Number)(t);
}

//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/toPropertyKey.js
function toPropertyKey(t) {
	var i = toPrimitive(t, "string");
	return "symbol" == _typeof(i) ? i : i + "";
}

//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/defineProperty.js
function _defineProperty(e, r, t) {
	return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
		value: t,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[r] = t, e;
}

//#endregion
//#region src/logutil.ts
var _LogUtil;
var LogUtil = class {
	static log(...datas) {
		try {
			let logMessage = `\n[${(/* @__PURE__ */ new Date()).toISOString()}]`;
			for (const data of datas) if (data !== void 0) if (typeof data === "object") logMessage += "\n" + JSON.stringify(data, null, 2);
			else logMessage += "\n" + String(data);
			logMessage += "\n" + "=".repeat(80) + "\n";
			fs.appendFileSync(this.logFilePath, logMessage);
		} catch (error) {
			console.error("Failed to write log:", error);
		}
	}
	static clear() {
		try {
			fs.writeFileSync(this.logFilePath, "=== Log Cleared ===\n");
		} catch (error) {
			console.error("Failed to clear log:", error);
		}
	}
};
_LogUtil = LogUtil;
_defineProperty(LogUtil, "logFilePath", void 0);
(() => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path$1.dirname(__filename);
	_LogUtil.logFilePath = path$1.join(__dirname, "templog.txt");
	if (!fs.existsSync(_LogUtil.logFilePath)) fs.writeFileSync(_LogUtil.logFilePath, "=== Log Started ===\n");
})();

//#endregion
//#region src/typescript/lib/shared.ts
function getConfigTitle(document) {
	if (document.languageId === "javascriptreact") return "javascript";
	if (document.languageId === "typescriptreact") return "typescript";
	return document.languageId;
}
function isTsDocument(document) {
	return document.languageId === "javascript" || document.languageId === "typescript" || document.languageId === "javascriptreact" || document.languageId === "typescriptreact";
}
function isJsonDocument(document) {
	return document.languageId === "json" || document.languageId === "jsonc";
}
function safeCall(cb) {
	try {
		return cb();
	} catch {}
}

//#endregion
//#region src/typescript/lib/plugins/directiveComment.ts
const localize$1 = nls.loadMessageBundle();
const directives = [
	{
		value: "@ts-check",
		description: localize$1("ts-check", "Enables semantic checking in a JavaScript file. Must be at the top of a file.")
	},
	{
		value: "@ts-nocheck",
		description: localize$1("ts-nocheck", "Disables semantic checking in a JavaScript file. Must be at the top of a file.")
	},
	{
		value: "@ts-ignore",
		description: localize$1("ts-ignore", "Suppresses @ts-check errors on the next line of a file.")
	},
	{
		value: "@ts-expect-error",
		description: localize$1("ts-expect-error", "Suppresses @ts-check errors on the next line of a file, expecting at least one to exist.")
	}
];
function create() {
	return {
		name: "typescript-directive-comment",
		capabilities: { completionProvider: { triggerCharacters: ["@"] } },
		create() {
			return { provideCompletionItems(document, position) {
				if (!isTsDocument(document)) return;
				const match = document.getText({
					start: {
						line: position.line,
						character: 0
					},
					end: position
				}).match(/^\s*\/\/+\s?(@[a-zA-Z\-]*)?$/);
				if (match) return {
					isIncomplete: false,
					items: directives.map((directive) => {
						const item = { label: directive.value };
						item.insertTextFormat = 2;
						item.detail = directive.description;
						item.textEdit = {
							range: {
								start: {
									line: position.line,
									character: Math.max(0, position.character - (match[1] ? match[1].length : 0))
								},
								end: position
							},
							newText: directive.value
						};
						return item;
					})
				};
			} };
		}
	};
}

//#endregion
//#region src/typescript/lib/protocol.const.ts
var _KindModifiers;
var Kind = class {};
_defineProperty(Kind, "alias", "alias");
_defineProperty(Kind, "callSignature", "call");
_defineProperty(Kind, "class", "class");
_defineProperty(Kind, "const", "const");
_defineProperty(Kind, "constructorImplementation", "constructor");
_defineProperty(Kind, "constructSignature", "construct");
_defineProperty(Kind, "directory", "directory");
_defineProperty(Kind, "enum", "enum");
_defineProperty(Kind, "enumMember", "enum member");
_defineProperty(Kind, "externalModuleName", "external module name");
_defineProperty(Kind, "function", "function");
_defineProperty(Kind, "indexSignature", "index");
_defineProperty(Kind, "interface", "interface");
_defineProperty(Kind, "keyword", "keyword");
_defineProperty(Kind, "let", "let");
_defineProperty(Kind, "localFunction", "local function");
_defineProperty(Kind, "localVariable", "local var");
_defineProperty(Kind, "method", "method");
_defineProperty(Kind, "memberGetAccessor", "getter");
_defineProperty(Kind, "memberSetAccessor", "setter");
_defineProperty(Kind, "memberVariable", "property");
_defineProperty(Kind, "module", "module");
_defineProperty(Kind, "primitiveType", "primitive type");
_defineProperty(Kind, "script", "script");
_defineProperty(Kind, "type", "type");
_defineProperty(Kind, "variable", "var");
_defineProperty(Kind, "warning", "warning");
_defineProperty(Kind, "string", "string");
_defineProperty(Kind, "parameter", "parameter");
_defineProperty(Kind, "typeParameter", "type parameter");
var DiagnosticCategory = class {};
_defineProperty(DiagnosticCategory, "error", "error");
_defineProperty(DiagnosticCategory, "warning", "warning");
_defineProperty(DiagnosticCategory, "suggestion", "suggestion");
var KindModifiers = class {};
_KindModifiers = KindModifiers;
_defineProperty(KindModifiers, "optional", "optional");
_defineProperty(KindModifiers, "deprecated", "deprecated");
_defineProperty(KindModifiers, "color", "color");
_defineProperty(KindModifiers, "dtsFile", ".d.ts");
_defineProperty(KindModifiers, "tsFile", ".ts");
_defineProperty(KindModifiers, "tsxFile", ".tsx");
_defineProperty(KindModifiers, "jsFile", ".js");
_defineProperty(KindModifiers, "jsxFile", ".jsx");
_defineProperty(KindModifiers, "jsonFile", ".json");
_defineProperty(KindModifiers, "fileExtensionKindModifiers", [
	_KindModifiers.dtsFile,
	_KindModifiers.tsFile,
	_KindModifiers.tsxFile,
	_KindModifiers.jsFile,
	_KindModifiers.jsxFile,
	_KindModifiers.jsonFile
]);
var DisplayPartKind = class {};
_defineProperty(DisplayPartKind, "functionName", "functionName");
_defineProperty(DisplayPartKind, "methodName", "methodName");
_defineProperty(DisplayPartKind, "parameterName", "parameterName");
_defineProperty(DisplayPartKind, "propertyName", "propertyName");
_defineProperty(DisplayPartKind, "punctuation", "punctuation");
_defineProperty(DisplayPartKind, "text", "text");

//#endregion
//#region src/typescript/lib/utils/modifiers.ts
function parseKindModifier(kindModifiers) {
	return new Set(kindModifiers.split(/,|\s+/g));
}

//#endregion
//#region src/typescript/lib/utils/previewer.ts
function replaceLinks(text) {
	return text.replace(/\{@(link|linkplain|linkcode) (https?:\/\/[^ |}]+?)(?:[| ]([^{}\n]+?))?\}/gi, (_, tag, link, text$1) => {
		switch (tag) {
			case "linkcode": return `[\`${text$1 ? text$1.trim() : link}\`](${link})`;
			default: return `[${text$1 ? text$1.trim() : link}](${link})`;
		}
	});
}
function processInlineTags(text) {
	return replaceLinks(text);
}
function getTagBodyText(tag, fileNameToUri, getTextDocument) {
	if (!tag.text) return;
	function makeCodeblock(text$1) {
		if (text$1.match(/^\s*[~`]{3}/g)) return text$1;
		return "```\n" + text$1 + "\n```";
	}
	const text = convertLinkTags(tag.text, fileNameToUri, getTextDocument);
	switch (tag.name) {
		case "example":
			const captionTagMatches = text.match(/<caption>(.*?)<\/caption>\s*(\r\n|\n)/);
			if (captionTagMatches && captionTagMatches.index === 0) return captionTagMatches[1] + "\n\n" + makeCodeblock(text.slice(captionTagMatches[0].length));
			else return makeCodeblock(text);
		case "author":
			const emailMatch = text.match(/(.+)\s<([-.\w]+@[-.\w]+)>/);
			if (emailMatch === null) return text;
			else return `${emailMatch[1]} ${emailMatch[2]}`;
		case "default": return makeCodeblock(text);
	}
	return processInlineTags(text);
}
function getTagDocumentation(tag, fileNameToUri, getTextDocument) {
	switch (tag.name) {
		case "augments":
		case "extends":
		case "param":
		case "template":
			const body = convertLinkTags(tag.text, fileNameToUri, getTextDocument).split(/^(\S+)\s*-?\s*/);
			if (body?.length === 3) {
				const param = body[1];
				const doc = body[2];
				const label$1 = `*@${tag.name}* \`${param}\``;
				if (!doc) return label$1;
				return label$1 + (doc.match(/\r\n|\n/g) ? "  \n" + processInlineTags(doc) : ` — ${processInlineTags(doc)}`);
			}
	}
	const label = `*@${tag.name}*`;
	const text = getTagBodyText(tag, fileNameToUri, getTextDocument);
	if (!text) return label;
	return label + (text.match(/\r\n|\n/g) ? "  \n" + text : ` — ${text}`);
}
function plainWithLinks(parts, fileNameToUri, getTextDocument) {
	return processInlineTags(convertLinkTags(parts, fileNameToUri, getTextDocument));
}
/**
* Convert `@link` inline tags to markdown links
*/
function convertLinkTags(parts, fileNameToUri, getTextDocument) {
	if (!parts) return "";
	if (typeof parts === "string") return parts;
	const out = [];
	let currentLink;
	for (const part of parts) switch (part.kind) {
		case "link":
			if (currentLink) {
				const text = currentLink.text ?? currentLink.name;
				let target = currentLink.target;
				if (typeof currentLink.target === "object" && "fileName" in currentLink.target) {
					const _target = currentLink.target;
					const fileDoc = getTextDocument(fileNameToUri(_target.fileName));
					if (fileDoc) {
						const start = fileDoc.positionAt(_target.textSpan.start);
						const end = fileDoc.positionAt(_target.textSpan.start + _target.textSpan.length);
						target = {
							file: _target.fileName,
							start: {
								line: start.line + 1,
								offset: start.character + 1
							},
							end: {
								line: end.line + 1,
								offset: end.character + 1
							}
						};
					} else target = {
						file: _target.fileName,
						start: {
							line: 1,
							offset: 1
						},
						end: {
							line: 1,
							offset: 1
						}
					};
				}
				if (target) {
					const link = fileNameToUri(target.file) + `#L${target.start.line},${target.start.offset}`;
					out.push(`[${text}](${link})`);
				} else if (text) out.push(text);
				currentLink = void 0;
			} else currentLink = {};
			break;
		case "linkName":
			if (currentLink) {
				currentLink.name = part.text;
				currentLink.target = part.target;
			}
			break;
		case "linkText":
			if (currentLink) currentLink.text = part.text;
			break;
		default:
			out.push(part.text);
			break;
	}
	return processInlineTags(out.join(""));
}
function tagsMarkdownPreview(tags, fileNameToUri, getTextDocument) {
	return tags.map((tag) => getTagDocumentation(tag, fileNameToUri, getTextDocument)).join("  \n\n");
}
function markdownDocumentation(documentation, tags, fileNameToUri, getTextDocument) {
	return addMarkdownDocumentation("", documentation, tags, fileNameToUri, getTextDocument);
}
function addMarkdownDocumentation(out, documentation, tags, fileNameToUri, getTextDocument) {
	if (documentation) out += plainWithLinks(documentation, fileNameToUri, getTextDocument);
	if (tags) {
		const tagsPreview = tagsMarkdownPreview(tags, fileNameToUri, getTextDocument);
		if (tagsPreview) out += "\n\n" + tagsPreview;
	}
	return out;
}

//#endregion
//#region src/typescript/lib/utils/typeConverters.ts
let SymbolKind;
(function(_SymbolKind2) {
	function fromProtocolScriptElementKind(kind) {
		switch (kind) {
			case Kind.module: return 2;
			case Kind.class: return 5;
			case Kind.enum: return 10;
			case Kind.enumMember: return 22;
			case Kind.interface: return 11;
			case Kind.indexSignature: return 6;
			case Kind.callSignature: return 6;
			case Kind.method: return 6;
			case Kind.memberVariable: return 7;
			case Kind.memberGetAccessor: return 7;
			case Kind.memberSetAccessor: return 7;
			case Kind.variable: return 13;
			case Kind.let: return 13;
			case Kind.const: return 13;
			case Kind.localVariable: return 13;
			case Kind.alias: return 13;
			case Kind.function: return 12;
			case Kind.localFunction: return 12;
			case Kind.constructSignature: return 9;
			case Kind.constructorImplementation: return 9;
			case Kind.typeParameter: return 26;
			case Kind.string: return 15;
			default: return 13;
		}
	}
	_SymbolKind2.fromProtocolScriptElementKind = fromProtocolScriptElementKind;
})(SymbolKind || (SymbolKind = {}));

//#endregion
//#region src/typescript/lib/utils/lspConverters.ts
function convertDiagnostic(diag, document, fileNameToUri, getTextDocument) {
	if (diag.start === void 0) return;
	if (diag.length === void 0) return;
	const diagnostic = {
		range: {
			start: document.positionAt(diag.start),
			end: document.positionAt(diag.start + diag.length)
		},
		severity: convertDiagnosticCategory(diag.category),
		source: "ts",
		code: diag.code,
		message: getMessageText(diag)
	};
	if (diag.relatedInformation) diagnostic.relatedInformation = diag.relatedInformation.map((rErr) => convertDiagnosticRelatedInformation(rErr, fileNameToUri, getTextDocument)).filter((v) => !!v);
	if (diag.reportsUnnecessary) {
		if (diagnostic.tags === void 0) diagnostic.tags = [];
		diagnostic.tags.push(1);
	}
	if (diag.reportsDeprecated) {
		if (diagnostic.tags === void 0) diagnostic.tags = [];
		diagnostic.tags.push(2);
	}
	return diagnostic;
}
function convertDiagnosticRelatedInformation(diag, fileNameToUri, getTextDocument) {
	if (diag.start === void 0) return;
	if (diag.length === void 0) return;
	let document;
	if (diag.file) document = getTextDocument(fileNameToUri(diag.file.fileName));
	if (!document) return;
	return {
		location: {
			uri: document.uri,
			range: {
				start: document.positionAt(diag.start),
				end: document.positionAt(diag.start + diag.length)
			}
		},
		message: getMessageText(diag)
	};
}
function convertDiagnosticCategory(input) {
	switch (input) {
		case 0: return 2;
		case 1: return 1;
		case 2: return 4;
		case 3: return 3;
	}
	return 1;
}
function getMessageText(diag, level = 0) {
	let messageText = "  ".repeat(level);
	if (typeof diag.messageText === "string") messageText += diag.messageText;
	else {
		messageText += diag.messageText.messageText;
		if (diag.messageText.next) for (const info of diag.messageText.next) messageText += "\n" + getMessageText(info, level + 1);
	}
	return messageText;
}
function applyCompletionEntryDetails(ts$1, item, data, document, fileNameToUri, getTextDocument) {
	const { sourceDisplay } = data;
	if (sourceDisplay) {
		item.labelDetails ?? (item.labelDetails = {});
		item.labelDetails.description = ts$1.displayPartsToString(sourceDisplay);
	}
	const detailTexts = [];
	if (data.codeActions) {
		item.additionalTextEdits ?? (item.additionalTextEdits = []);
		for (const action of data.codeActions) {
			detailTexts.push(action.description);
			for (const changes of action.changes) changes.textChanges.map((change) => convertTextSpan(change.span, document)).forEach((range, index) => {
				item.additionalTextEdits?.push({
					range,
					newText: changes.textChanges[index].newText
				});
			});
		}
	}
	if (data.displayParts) detailTexts.push(plainWithLinks(data.displayParts, fileNameToUri, getTextDocument));
	if (detailTexts.length) item.detail = detailTexts.join("\n");
	item.documentation = {
		kind: "markdown",
		value: markdownDocumentation(data.documentation, data.tags, fileNameToUri, getTextDocument)
	};
	if (data) handleKindModifiers(item, data);
}
function convertCompletionInfo(ts$1, completionContext, document, position, createData) {
	const lt_320 = semver.lt(ts$1.version, "3.2.0");
	const gte_300 = semver.gte(ts$1.version, "3.0.0");
	const wordRange = completionContext.optionalReplacementSpan ? convertTextSpan(completionContext.optionalReplacementSpan, document) : void 0;
	const line = getLineText(document, position.line);
	const dotAccessorContext = getDotAccessorContext(document);
	const entries = completionContext.entries.map((tsEntry) => ({
		...convertCompletionEntry(tsEntry, document),
		data: createData(tsEntry)
	}));
	return {
		isIncomplete: !!completionContext.isIncomplete,
		items: entries
	};
	function convertCompletionEntry(tsEntry, document$1) {
		const item = { label: tsEntry.name };
		item.kind = convertCompletionItemKind(tsEntry.kind);
		if (tsEntry.source && tsEntry.hasAction) item.sortText = "￿" + tsEntry.sortText;
		else item.sortText = tsEntry.sortText;
		const { sourceDisplay, isSnippet, labelDetails } = tsEntry;
		if (sourceDisplay) {
			item.labelDetails ?? (item.labelDetails = {});
			item.labelDetails.description = ts$1.displayPartsToString(sourceDisplay);
		}
		if (labelDetails) {
			item.labelDetails ?? (item.labelDetails = {});
			Object.assign(item.labelDetails, labelDetails);
		}
		item.preselect = tsEntry.isRecommended;
		let range = getRangeFromReplacementSpan(tsEntry, document$1);
		item.commitCharacters = getCommitCharacters(tsEntry, {
			isNewIdentifierLocation: completionContext.isNewIdentifierLocation,
			isInValidCommitCharacterContext: isInValidCommitCharacterContext(document$1, position),
			enableCallCompletions: true
		});
		item.insertText = tsEntry.insertText;
		item.insertTextFormat = isSnippet ? 2 : 1;
		item.filterText = getFilterText(tsEntry, wordRange, line, tsEntry.insertText);
		if (completionContext?.isMemberCompletion && dotAccessorContext && !isSnippet) {
			item.filterText = dotAccessorContext.text + (item.insertText || item.label);
			if (!range) {
				const replacementRange = wordRange;
				if (replacementRange) range = {
					inserting: dotAccessorContext.range,
					replacing: rangeUnion(dotAccessorContext.range, replacementRange)
				};
				else range = dotAccessorContext.range;
				item.insertText = item.filterText;
			}
		}
		handleKindModifiers(item, tsEntry);
		if (!range && wordRange) range = {
			inserting: {
				start: wordRange.start,
				end: position
			},
			replacing: wordRange
		};
		if (range) if ("start" in range) item.textEdit = {
			range,
			newText: item.insertText || item.label
		};
		else item.textEdit = {
			insert: range.inserting,
			replace: range.replacing,
			newText: item.insertText || item.label
		};
		return item;
	}
	function getDotAccessorContext(document$1) {
		let dotAccessorContext$1;
		if (gte_300) {
			if (!completionContext) return;
			if (completionContext.isMemberCompletion) {
				const dotMatch = line.slice(0, position.character).match(/\??\.\s*$/) || void 0;
				if (dotMatch) {
					const range = {
						start: {
							line: position.line,
							character: position.character - dotMatch[0].length
						},
						end: position
					};
					dotAccessorContext$1 = {
						range,
						text: document$1.getText(range)
					};
				}
			}
		}
		return dotAccessorContext$1;
	}
	function getRangeFromReplacementSpan(tsEntry, document$1) {
		if (!tsEntry.replacementSpan) return;
		let replaceRange = {
			start: document$1.positionAt(tsEntry.replacementSpan.start),
			end: document$1.positionAt(tsEntry.replacementSpan.start + tsEntry.replacementSpan.length)
		};
		if (replaceRange.start.line !== replaceRange.end.line) replaceRange = {
			start: {
				line: replaceRange.start.line,
				character: replaceRange.start.character
			},
			end: {
				line: replaceRange.start.line,
				character: document$1.positionAt(document$1.offsetAt({
					line: replaceRange.start.line + 1,
					character: 0
				}) - 1).character
			}
		};
		return {
			inserting: replaceRange,
			replacing: replaceRange
		};
	}
	function getFilterText(tsEntry, wordRange$1, line$1, insertText) {
		if (tsEntry.name.startsWith("#")) {
			const wordStart = wordRange$1 ? line$1.charAt(wordRange$1.start.character) : void 0;
			if (insertText) if (insertText.startsWith("this.#")) return wordStart === "#" ? insertText : insertText.replace(/^this\.#/, "");
			else return insertText;
			else return wordStart === "#" ? void 0 : tsEntry.name.replace(/^#/, "");
		}
		if (insertText?.startsWith("this.")) return;
		else if (insertText?.startsWith("[")) return insertText.replace(/^\[['"](.+)[['"]\]$/, ".$1");
		return insertText;
	}
	function getCommitCharacters(entry, context) {
		if (entry.kind === Kind.warning) return;
		if (context.isNewIdentifierLocation || !context.isInValidCommitCharacterContext) return;
		const commitCharacters = [
			".",
			",",
			";"
		];
		if (context.enableCallCompletions) commitCharacters.push("(");
		return commitCharacters;
	}
	function isInValidCommitCharacterContext(document$1, position$1) {
		if (lt_320) {
			if (position$1.character > 1) return document$1.getText({
				start: {
					line: position$1.line,
					character: 0
				},
				end: position$1
			}).match(/(\s|^)\.$/gi) === null;
		}
		return true;
	}
}
function convertCompletionItemKind(kind) {
	switch (kind) {
		case Kind.primitiveType:
		case Kind.keyword: return 14;
		case Kind.const:
		case Kind.let:
		case Kind.variable:
		case Kind.localVariable:
		case Kind.alias:
		case Kind.parameter: return 6;
		case Kind.memberVariable:
		case Kind.memberGetAccessor:
		case Kind.memberSetAccessor: return 5;
		case Kind.function:
		case Kind.localFunction: return 3;
		case Kind.method:
		case Kind.constructSignature:
		case Kind.callSignature:
		case Kind.indexSignature: return 2;
		case Kind.enum: return 13;
		case Kind.enumMember: return 20;
		case Kind.module:
		case Kind.externalModuleName: return 9;
		case Kind.class:
		case Kind.type: return 7;
		case Kind.interface: return 8;
		case Kind.warning: return 1;
		case Kind.script: return 17;
		case Kind.directory: return 19;
		case Kind.string: return 21;
		default: return 10;
	}
}
function handleKindModifiers(item, tsEntry) {
	if (tsEntry.kindModifiers) {
		const kindModifiers = parseKindModifier(tsEntry.kindModifiers);
		if (kindModifiers.has(KindModifiers.optional)) {
			if (!item.insertText) item.insertText = item.label;
			if (!item.filterText) item.filterText = item.label;
			item.label += "?";
		}
		if (kindModifiers.has(KindModifiers.deprecated)) item.tags = [1];
		if (kindModifiers.has(KindModifiers.color)) item.kind = 16;
		if (tsEntry.kind === Kind.script) {
			for (const extModifier of KindModifiers.fileExtensionKindModifiers) if (kindModifiers.has(extModifier)) {
				if (tsEntry.name.toLowerCase().endsWith(extModifier)) item.detail = tsEntry.name;
				else item.detail = tsEntry.name + extModifier;
				break;
			}
		}
	}
}
function rangeUnion(a, b) {
	return {
		start: a.start.line < b.start.line || a.start.line === b.start.line && a.start.character < b.start.character ? a.start : b.start,
		end: a.end.line > b.end.line || a.end.line === b.end.line && a.end.character > b.end.character ? a.end : b.end
	};
}
function getLineText(document, line) {
	const endOffset = document.offsetAt({
		line: line + 1,
		character: 0
	});
	const end = document.positionAt(endOffset);
	return document.getText({
		start: {
			line,
			character: 0
		},
		end: end.line === line ? end : document.positionAt(endOffset - 1)
	});
}
function convertNavigateToItem(item, document) {
	const info = {
		name: getLabel(item),
		kind: convertScriptElementKind(item.kind),
		location: {
			uri: document.uri,
			range: convertTextSpan(item.textSpan, document)
		}
	};
	if ((item.kindModifiers ? parseKindModifier(item.kindModifiers) : void 0)?.has(KindModifiers.deprecated)) info.tags = [1];
	return info;
}
function getLabel(item) {
	const label = item.name;
	if (item.kind === "method" || item.kind === "function") return label + "()";
	return label;
}
function convertScriptElementKind(kind) {
	switch (kind) {
		case Kind.method: return 6;
		case Kind.enum: return 10;
		case Kind.enumMember: return 22;
		case Kind.function: return 12;
		case Kind.class: return 5;
		case Kind.interface: return 11;
		case Kind.type: return 5;
		case Kind.memberVariable: return 8;
		case Kind.memberGetAccessor: return 8;
		case Kind.memberSetAccessor: return 8;
		case Kind.variable: return 13;
		default: return 13;
	}
}
function convertInlayHint(hint, document) {
	const result = {
		position: document.positionAt(hint.position),
		label: hint.text,
		kind: hint.kind === "Type" ? 1 : hint.kind === "Parameter" ? 2 : void 0
	};
	result.paddingLeft = hint.whitespaceBefore;
	result.paddingRight = hint.whitespaceAfter;
	return result;
}
function convertHighlightSpan(span, document) {
	return {
		kind: span.kind === "writtenReference" ? 3 : 2,
		range: convertTextSpan(span.textSpan, document)
	};
}
function convertSelectionRange(range, document) {
	return {
		parent: range.parent ? convertSelectionRange(range.parent, document) : void 0,
		range: convertTextSpan(range.textSpan, document)
	};
}
function convertFileTextChanges(changes, fileNameToUri, getTextDocument) {
	const workspaceEdit = {};
	for (const change of changes) {
		if (!workspaceEdit.documentChanges) workspaceEdit.documentChanges = [];
		const uri = fileNameToUri(change.fileName);
		if (change.isNewFile) {
			workspaceEdit.documentChanges.push({
				kind: "create",
				uri: uri.toString()
			});
			workspaceEdit.documentChanges.push({
				textDocument: {
					uri: uri.toString(),
					version: null
				},
				edits: change.textChanges.map((edit) => ({
					newText: edit.newText,
					range: {
						start: {
							line: 0,
							character: edit.span.start
						},
						end: {
							line: 0,
							character: edit.span.start + edit.span.length
						}
					}
				}))
			});
		} else {
			const doc = getTextDocument(uri);
			workspaceEdit.documentChanges.push({
				textDocument: {
					uri: uri.toString(),
					version: null
				},
				edits: change.textChanges.map((edit) => convertTextChange(edit, doc))
			});
		}
	}
	return workspaceEdit;
}
function convertRenameLocations(newText, locations, fileNameToUri, getTextDocument) {
	const workspaceEdit = {};
	for (const location of locations) {
		if (!workspaceEdit.changes) workspaceEdit.changes = {};
		const uri = fileNameToUri(location.fileName);
		const doc = getTextDocument(uri);
		if (!workspaceEdit.changes[uri.toString()]) workspaceEdit.changes[uri.toString()] = [];
		let _newText = newText;
		if (location.prefixText) _newText = location.prefixText + _newText;
		if (location.suffixText) _newText = _newText + location.suffixText;
		workspaceEdit.changes[uri.toString()].push({
			newText: _newText,
			range: convertTextSpan(location.textSpan, doc)
		});
	}
	return workspaceEdit;
}
function convertQuickInfo(ts$1, info, document, fileNameToUri, getTextDocument) {
	const parts = [];
	const displayString = ts$1.displayPartsToString(info.displayParts);
	const documentation = markdownDocumentation(info.documentation ?? [], info.tags, fileNameToUri, getTextDocument);
	if (displayString) parts.push([
		"```typescript",
		displayString,
		"```"
	].join("\n"));
	if (documentation) parts.push(documentation);
	return {
		contents: {
			kind: "markdown",
			value: parts.join("\n\n")
		},
		range: convertTextSpan(info.textSpan, document)
	};
}
function convertNavTree(item, document) {
	if (!shouldIncludeEntry(item)) return [];
	let remain = item.childItems ?? [];
	return item.spans.map((span) => {
		const childItems = [];
		remain = remain.filter((child) => {
			const childStart = child.spans[0].start;
			const childEnd = child.spans[child.spans.length - 1].start + child.spans[child.spans.length - 1].length;
			if (childStart >= span.start && childEnd <= span.start + span.length) {
				childItems.push(child);
				return false;
			}
			return true;
		});
		const nameSpan = item.spans.length === 1 ? item.nameSpan ?? span : span;
		const fullRange = {
			start: Math.min(span.start, nameSpan.start),
			end: Math.max(span.start + span.length, nameSpan.start + nameSpan.length)
		};
		const symbol = {
			name: item.text,
			kind: getSymbolKind(item.kind),
			range: convertTextSpan({
				start: fullRange.start,
				length: fullRange.end - fullRange.start
			}, document),
			selectionRange: convertTextSpan(nameSpan, document),
			children: childItems.map((item$1) => convertNavTree(item$1, document)).flat()
		};
		if (parseKindModifier(item.kindModifiers).has(KindModifiers.deprecated)) {
			symbol.deprecated = true;
			symbol.tags ?? (symbol.tags = []);
			symbol.tags.push(1);
		}
		return symbol;
	});
}
const getSymbolKind = (kind) => {
	switch (kind) {
		case Kind.module: return 2;
		case Kind.class: return 5;
		case Kind.enum: return 10;
		case Kind.interface: return 11;
		case Kind.method: return 6;
		case Kind.memberVariable: return 7;
		case Kind.memberGetAccessor: return 7;
		case Kind.memberSetAccessor: return 7;
		case Kind.variable: return 13;
		case Kind.const: return 13;
		case Kind.localVariable: return 13;
		case Kind.function: return 12;
		case Kind.localFunction: return 12;
		case Kind.constructSignature: return 9;
		case Kind.constructorImplementation: return 9;
	}
	return 13;
};
function shouldIncludeEntry(item) {
	if (item.kind === Kind.alias) return false;
	return !!(item.text && item.text !== "<function>" && item.text !== "<class>");
}
function convertOutliningSpan(outliningSpan, document) {
	const start = document.positionAt(outliningSpan.textSpan.start);
	const end = adjustFoldingEnd(start, document.positionAt(outliningSpan.textSpan.start + outliningSpan.textSpan.length), document);
	return {
		startLine: start.line,
		endLine: end.line,
		startCharacter: start.character,
		endCharacter: end.character,
		kind: convertOutliningSpanKind(outliningSpan.kind)
	};
}
function convertOutliningSpanKind(kind) {
	switch (kind) {
		case "comment": return "comment";
		case "region": return "region";
		case "imports": return "imports";
		case "code":
		default: return;
	}
}
const foldEndPairCharacters = [
	"}",
	"]",
	")",
	"`"
];
function adjustFoldingEnd(start, end, document) {
	if (end.character > 0) {
		const foldEndCharacter = document.getText({
			start: {
				line: end.line,
				character: end.character - 1
			},
			end
		});
		if (foldEndPairCharacters.includes(foldEndCharacter)) {
			const endOffset = Math.max(document.offsetAt({
				line: end.line,
				character: 0
			}) - 1, document.offsetAt(start));
			return document.positionAt(endOffset);
		}
	}
	return end;
}
function convertTextChange(edit, document) {
	return {
		range: convertTextSpan(edit.span, document),
		newText: edit.newText
	};
}
function convertCallHierarchyIncomingCall(item, ctx) {
	const uri = ctx.fileNameToUri(item.from.file);
	const document = ctx.getTextDocument(uri);
	return {
		from: convertCallHierarchyItem(item.from, ctx),
		fromRanges: item.fromSpans.map((span) => convertTextSpan(span, document)).filter((span) => !!span)
	};
}
function convertCallHierarchyOutgoingCall(item, fromDocument, ctx) {
	return {
		to: convertCallHierarchyItem(item.to, ctx),
		fromRanges: item.fromSpans.map((span) => convertTextSpan(span, fromDocument)).filter((span) => !!span)
	};
}
function convertCallHierarchyItem(item, ctx) {
	const rootPath = ctx.languageService.getProgram()?.getCompilerOptions().rootDir ?? "";
	const uri = ctx.fileNameToUri(item.file);
	const document = ctx.getTextDocument(uri);
	const useFileName = isSourceFileItem(item);
	const name = useFileName ? path.basename(item.file) : item.name;
	const detail = useFileName ? path.relative(rootPath, path.dirname(item.file)) : item.containerName ?? "";
	const result = {
		kind: SymbolKind.fromProtocolScriptElementKind(item.kind),
		name,
		detail,
		uri: uri.toString(),
		range: convertTextSpan(item.span, document),
		selectionRange: convertTextSpan(item.selectionSpan, document)
	};
	if ((item.kindModifiers ? parseKindModifier(item.kindModifiers) : void 0)?.has(KindModifiers.deprecated)) result.tags = [1];
	return result;
}
function isSourceFileItem(item) {
	return item.kind === Kind.script || item.kind === Kind.module && item.selectionSpan.start === 0;
}
function convertDocumentSpanToLocation(documentSpan, ctx) {
	const uri = ctx.fileNameToUri(documentSpan.fileName);
	const document = ctx.getTextDocument(uri);
	const range = convertTextSpan(documentSpan.textSpan, document);
	return {
		uri: uri.toString(),
		range
	};
}
function convertDefinitionInfoAndBoundSpan(info, document, ctx) {
	if (!info.definitions) return [];
	const originSelectionRange = convertTextSpan(info.textSpan, document);
	return info.definitions.map((entry) => {
		const link = convertDocumentSpantoLocationLink(entry, ctx);
		if (link) {
			link.originSelectionRange ?? (link.originSelectionRange = originSelectionRange);
			return link;
		}
	}).filter((entry) => !!entry);
}
function convertDocumentSpantoLocationLink(documentSpan, ctx) {
	const targetUri = ctx.fileNameToUri(documentSpan.fileName);
	const document = ctx.getTextDocument(targetUri);
	const targetSelectionRange = convertTextSpan(documentSpan.textSpan, document);
	const targetRange = documentSpan.contextSpan ? convertTextSpan(documentSpan.contextSpan, document) : targetSelectionRange;
	const originSelectionRange = documentSpan.originalTextSpan ? convertTextSpan(documentSpan.originalTextSpan, document) : void 0;
	return {
		targetUri: targetUri.toString(),
		targetRange,
		targetSelectionRange,
		originSelectionRange
	};
}
function convertTextSpan(textSpan, document) {
	if (!document) return {
		start: {
			line: 0,
			character: 0
		},
		end: {
			line: 0,
			character: 0
		}
	};
	return {
		start: document.positionAt(textSpan.start),
		end: document.positionAt(textSpan.start + textSpan.length)
	};
}

//#endregion
//#region src/typescript/lib/configs/getFormatCodeSettings.ts
async function getFormatCodeSettings(ctx, document, options) {
	const config = await ctx.env.getConfiguration?.(getConfigTitle(document) + ".format") ?? {};
	return {
		convertTabsToSpaces: options?.insertSpaces,
		tabSize: options?.tabSize,
		indentSize: options?.tabSize,
		indentStyle: 2,
		newLineCharacter: "\n",
		insertSpaceAfterCommaDelimiter: config.insertSpaceAfterCommaDelimiter ?? true,
		insertSpaceAfterConstructor: config.insertSpaceAfterConstructor ?? false,
		insertSpaceAfterSemicolonInForStatements: config.insertSpaceAfterSemicolonInForStatements ?? true,
		insertSpaceBeforeAndAfterBinaryOperators: config.insertSpaceBeforeAndAfterBinaryOperators ?? true,
		insertSpaceAfterKeywordsInControlFlowStatements: config.insertSpaceAfterKeywordsInControlFlowStatements ?? true,
		insertSpaceAfterFunctionKeywordForAnonymousFunctions: config.insertSpaceAfterFunctionKeywordForAnonymousFunctions ?? true,
		insertSpaceBeforeFunctionParenthesis: config.insertSpaceBeforeFunctionParenthesis ?? false,
		insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: config.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis ?? false,
		insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: config.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets ?? false,
		insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: config.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces ?? true,
		insertSpaceAfterOpeningAndBeforeClosingEmptyBraces: config.insertSpaceAfterOpeningAndBeforeClosingEmptyBraces ?? true,
		insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: config.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces ?? false,
		insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: config.insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces ?? false,
		insertSpaceAfterTypeAssertion: config.insertSpaceAfterTypeAssertion ?? false,
		placeOpenBraceOnNewLineForFunctions: config.placeOpenBraceOnNewLineForFunctions ?? false,
		placeOpenBraceOnNewLineForControlBlocks: config.placeOpenBraceOnNewLineForControlBlocks ?? false,
		semicolons: config.semicolons ?? "ignore"
	};
}

//#endregion
//#region src/typescript/lib/syntaxOnlyService.ts
function createSyntaxOnlyService(ts$1, syntaxOnly) {
	let currentProjectVersion = -1;
	let fileNames = [];
	const scriptInfos = /* @__PURE__ */ new Map();
	const host = {
		getProjectVersion: () => currentProjectVersion.toString(),
		getScriptFileNames: () => fileNames,
		getScriptSnapshot: (fileName) => scriptInfos.get(fileName).snapshot,
		getScriptKind: (fileName) => scriptInfos.get(fileName).kind,
		getScriptVersion: (fileName) => scriptInfos.get(fileName).version.toString(),
		getCompilationSettings: () => ({}),
		getCurrentDirectory: () => "",
		getDefaultLibFileName: () => "",
		readFile: () => void 0,
		fileExists: (fileName) => scriptInfos.has(fileName)
	};
	return {
		languageService: syntaxOnly ? ts$1.createLanguageService(host, void 0, ts$1.LanguageServiceMode.Syntactic) : ts$1.createLanguageService(host),
		updateFile
	};
	function updateFile(fileName, snapshot, scriptKind) {
		let scriptInfo = scriptInfos.get(fileName);
		if (scriptInfo?.snapshot === snapshot && scriptInfo.kind === scriptKind) return;
		currentProjectVersion++;
		scriptInfo = {
			snapshot,
			kind: scriptKind,
			version: (scriptInfo?.version ?? 0) + 1
		};
		const filesChanged = !scriptInfos.has(fileName);
		scriptInfos.set(fileName, scriptInfo);
		if (filesChanged) fileNames = [...scriptInfos.keys()];
	}
}

//#endregion
//#region src/typescript/lib/plugins/syntactic.ts
const snapshots = /* @__PURE__ */ new WeakMap();
let created;
function getLanguageServiceByDocument(ts$1, document) {
	if (!created) created = createSyntaxOnlyService(ts$1, true);
	let cache = snapshots.get(document);
	if (!cache || cache[0] !== document.version) {
		const snapshot = ts$1.ScriptSnapshot.fromString(document.getText());
		cache = [document.version, snapshot];
		snapshots.set(document, cache);
		created.updateFile(document.uri, cache[1], document.languageId === "javascript" ? ts$1.ScriptKind.JS : document.languageId === "javascriptreact" ? ts$1.ScriptKind.JSX : document.languageId === "typescriptreact" ? ts$1.ScriptKind.TSX : ts$1.ScriptKind.TS);
	}
	return {
		languageService: created.languageService,
		fileName: document.uri
	};
}
function create$3(ts$1, { isFormattingEnabled = async (document, context) => {
	return await context.env.getConfiguration?.(getConfigTitle(document) + ".format.enable") ?? true;
} } = {}) {
	return {
		name: "typescript-syntactic",
		capabilities: {
			autoInsertionProvider: {
				triggerCharacters: [">", ">"],
				configurationSections: ["javascript.autoClosingTags", "typescript.autoClosingTags"]
			},
			foldingRangeProvider: true,
			selectionRangeProvider: true,
			documentSymbolProvider: true,
			documentFormattingProvider: true,
			documentOnTypeFormattingProvider: { triggerCharacters: [
				";",
				"}",
				"\n"
			] }
		},
		create(context) {
			return {
				async provideAutoInsertSnippet(document, selection, change) {
					if (document.offsetAt(selection) !== change.rangeOffset + change.text.length) return;
					if ((document.languageId === "javascriptreact" || document.languageId === "typescriptreact") && change.text.endsWith(">") && (await context.env.getConfiguration?.(getConfigTitle(document) + ".autoClosingTags") ?? true)) {
						const { languageService, fileName } = getLanguageServiceByDocument(ts$1, document);
						const close = languageService.getJsxClosingTagAtPosition(fileName, document.offsetAt(selection));
						if (close) return "$0" + close.newText;
					}
				},
				provideFoldingRanges(document) {
					if (!isTsDocument(document)) return;
					const { languageService, fileName } = getLanguageServiceByDocument(ts$1, document);
					const outliningSpans = safeCall(() => languageService.getOutliningSpans(fileName));
					if (!outliningSpans) return [];
					return outliningSpans.map((span) => convertOutliningSpan(span, document));
				},
				provideSelectionRanges(document, positions) {
					if (!isTsDocument(document)) return;
					const { languageService, fileName } = getLanguageServiceByDocument(ts$1, document);
					const ranges = positions.map((position) => {
						const offset = document.offsetAt(position);
						const range = safeCall(() => languageService.getSmartSelectionRange(fileName, offset));
						if (!range) return;
						return convertSelectionRange(range, document);
					});
					if (ranges.every((range) => !!range)) return ranges;
				},
				provideDocumentSymbols(document) {
					if (!isTsDocument(document)) return;
					const { languageService, fileName } = getLanguageServiceByDocument(ts$1, document);
					const barItems = safeCall(() => languageService.getNavigationTree(fileName));
					if (!barItems) return [];
					return barItems.childItems?.map((item) => convertNavTree(item, document)).flat() ?? [];
				},
				async provideDocumentFormattingEdits(document, range, options, codeOptions) {
					if (!isTsDocument(document)) return;
					if (!await isFormattingEnabled(document, context)) return;
					const tsOptions = await getFormatCodeSettings(context, document, options);
					if (codeOptions) tsOptions.baseIndentSize = codeOptions.initialIndentLevel * options.tabSize;
					const { languageService, fileName } = getLanguageServiceByDocument(ts$1, document);
					const scriptEdits = range ? safeCall(() => languageService.getFormattingEditsForRange(fileName, document.offsetAt(range.start), document.offsetAt(range.end), tsOptions)) : safeCall(() => languageService.getFormattingEditsForDocument(fileName, tsOptions));
					if (!scriptEdits) return [];
					return scriptEdits.map((edit) => convertTextChange(edit, document));
				},
				async provideOnTypeFormattingEdits(document, position, key, options, codeOptions) {
					if (!isTsDocument(document)) return;
					if (!await isFormattingEnabled(document, context)) return;
					const tsOptions = await getFormatCodeSettings(context, document, options);
					if (codeOptions) tsOptions.baseIndentSize = codeOptions.initialIndentLevel * options.tabSize;
					const { languageService, fileName } = getLanguageServiceByDocument(ts$1, document);
					const scriptEdits = safeCall(() => languageService.getFormattingEditsAfterKeystroke(fileName, document.offsetAt(position), key, tsOptions));
					if (!scriptEdits) return [];
					return scriptEdits.map((edit) => convertTextChange(edit, document));
				}
			};
		}
	};
}

//#endregion
//#region src/typescript/lib/plugins/docCommentTemplate.ts
const localize = nls.loadMessageBundle();
const defaultJsDoc = `/**\n * $0\n */`;
function create$1(ts$1) {
	return {
		name: "typescript-doc-comment-template",
		capabilities: { completionProvider: { triggerCharacters: ["*"] } },
		create() {
			return { provideCompletionItems(document, position) {
				if (!isTsDocument(document)) return;
				if (!isPotentiallyValidDocCompletionPosition(document, position)) return;
				const { languageService, fileName } = getLanguageServiceByDocument(ts$1, document);
				const offset = document.offsetAt(position);
				const docCommentTemplate = languageService.getDocCommentTemplateAtPosition(fileName, offset);
				if (!docCommentTemplate) return;
				let insertText;
				if (docCommentTemplate.newText === "/** */") insertText = defaultJsDoc;
				else insertText = templateToSnippet(docCommentTemplate.newText);
				return {
					isIncomplete: false,
					items: [createCompletionItem(document, position, insertText)]
				};
			} };
		}
	};
}
function createCompletionItem(document, position, insertText) {
	const item = { label: "/** */" };
	item.kind = 1;
	item.detail = localize("typescript.jsDocCompletionItem.documentation", "JSDoc comment");
	item.sortText = "\0";
	item.insertTextFormat = 2;
	const line = getLineText(document, position.line);
	const prefix = line.slice(0, position.character).match(/\/\**\s*$/);
	const suffix = line.slice(position.character).match(/^\s*\**\//);
	item.textEdit = {
		range: {
			start: {
				line: position.line,
				character: position.character + (prefix ? -prefix[0].length : 0)
			},
			end: {
				line: position.line,
				character: position.character + (suffix ? suffix[0].length : 0)
			}
		},
		newText: insertText
	};
	return item;
}
function isPotentiallyValidDocCompletionPosition(document, position) {
	const line = getLineText(document, position.line);
	const prefix = line.slice(0, position.character);
	if (!/^\s*$|\/\*\*\s*$|^\s*\/\*\*+\s*$/.test(prefix)) return false;
	const suffix = line.slice(position.character);
	return /^\s*(\*+\/)?\s*$/.test(suffix);
}
function templateToSnippet(template) {
	let snippetIndex = 1;
	template = template.replace(/\$/g, "\\$");
	template = template.replace(/^[ \t]*(?=(\/|[ ]\*))/gm, "");
	template = template.replace(/^(\/\*\*\s*\*[ ]*)$/m, (x) => x + `\$0`);
	template = template.replace(/\* @param([ ]\{\S+\})?\s+(\S+)[ \t]*$/gm, (_param, type, post) => {
		let out = "* @param ";
		if (type === " {any}" || type === " {*}") out += `{\$\{${snippetIndex++}:*\}} `;
		else if (type) out += type + " ";
		out += post + ` \${${snippetIndex++}}`;
		return out;
	});
	template = template.replace(/\* @returns[ \t]*$/gm, `* @returns \${${snippetIndex++}}`);
	return template;
}

//#endregion
//#region src/typescript/lib/configs/getUserPreferences.ts
async function getUserPreferences(ctx, document) {
	let currentDirectory = "";
	if (ctx.project.typescript) currentDirectory = ctx.project.typescript.languageServiceHost.getCurrentDirectory();
	const uri = URI.parse(document.uri);
	const documentUri = ctx.decodeEmbeddedDocumentUri(uri)?.[0] ?? uri;
	const config = await ctx.env.getConfiguration?.(getConfigTitle(document)) ?? {};
	const preferencesConfig = config?.preferences ?? {};
	return {
		...config.unstable ?? {},
		quotePreference: getQuoteStylePreference(preferencesConfig),
		importModuleSpecifierPreference: getImportModuleSpecifierPreference(preferencesConfig),
		importModuleSpecifierEnding: getImportModuleSpecifierEndingPreference(preferencesConfig),
		jsxAttributeCompletionStyle: getJsxAttributeCompletionStyle(preferencesConfig),
		allowTextChangesInNewFiles: documentUri.scheme === "file",
		providePrefixAndSuffixTextForRename: (preferencesConfig.renameShorthandProperties ?? true) === false ? false : preferencesConfig.useAliasesForRenames ?? true,
		allowRenameOfImportPath: true,
		includeAutomaticOptionalChainCompletions: config.suggest?.includeAutomaticOptionalChainCompletions ?? true,
		provideRefactorNotApplicableReason: true,
		generateReturnInDocTemplate: config.suggest?.jsdoc?.generateReturns ?? true,
		includeCompletionsForImportStatements: config.suggest?.includeCompletionsForImportStatements ?? true,
		includeCompletionsWithSnippetText: config.suggest?.includeCompletionsWithSnippetText ?? true,
		includeCompletionsWithClassMemberSnippets: config.suggest?.classMemberSnippets?.enabled ?? true,
		includeCompletionsWithObjectLiteralMethodSnippets: config.suggest?.objectLiteralMethodSnippets?.enabled ?? true,
		autoImportFileExcludePatterns: getAutoImportFileExcludePatternsPreference(preferencesConfig, currentDirectory),
		useLabelDetailsInCompletionEntries: true,
		allowIncompleteCompletions: true,
		displayPartsForJSDoc: true,
		includeInlayParameterNameHints: getInlayParameterNameHintsPreference(config),
		includeInlayParameterNameHintsWhenArgumentMatchesName: !(config.inlayHints?.parameterNames?.suppressWhenArgumentMatchesName ?? true),
		includeInlayFunctionParameterTypeHints: config.inlayHints?.parameterTypes?.enabled ?? true,
		includeInlayVariableTypeHints: config.inlayHints?.variableTypes?.enabled ?? true,
		includeInlayVariableTypeHintsWhenTypeMatchesName: !(config.inlayHints?.variableTypes?.suppressWhenTypeMatchesName ?? true),
		includeInlayPropertyDeclarationTypeHints: config.inlayHints?.propertyDeclarationTypes?.enabled ?? true,
		includeInlayFunctionLikeReturnTypeHints: config.inlayHints?.functionLikeReturnTypes?.enabled ?? true,
		includeInlayEnumMemberValueHints: config.inlayHints?.enumMemberValues?.enabled ?? true,
		includeCompletionsForModuleExports: config.suggest?.autoImports ?? true,
		includeCompletionsWithInsertText: true,
		includePackageJsonAutoImports: preferencesConfig.includePackageJsonAutoImports ?? "auto"
	};
}
function getQuoteStylePreference(config) {
	switch (config.quoteStyle) {
		case "single": return "single";
		case "double": return "double";
		default: return "auto";
	}
}
function getAutoImportFileExcludePatternsPreference(config, workspacePath) {
	return workspacePath && config.autoImportFileExcludePatterns?.map((p) => {
		const slashNormalized = p.replace(/\\/g, "/");
		const isRelative = /^\.\.?($|\/)/.test(slashNormalized);
		return path.isAbsolute(p) ? p : p.startsWith("*") ? "/" + slashNormalized : isRelative ? path.join(workspacePath, p) : "/**/" + slashNormalized;
	});
}
function getImportModuleSpecifierPreference(config) {
	switch (config.importModuleSpecifier) {
		case "project-relative": return "project-relative";
		case "relative": return "relative";
		case "non-relative": return "non-relative";
		default: return;
	}
}
function getImportModuleSpecifierEndingPreference(config) {
	switch (config.importModuleSpecifierEnding) {
		case "minimal": return "minimal";
		case "index": return "index";
		case "js": return "js";
		default: return "minimal";
	}
}
function getJsxAttributeCompletionStyle(config) {
	switch (config.jsxAttributeCompletionStyle) {
		case "braces": return "braces";
		case "none": return "none";
		default: return "auto";
	}
}
function getInlayParameterNameHintsPreference(config) {
	switch (config.inlayHints?.parameterNames?.enabled) {
		case "none": return "none";
		case "literals": return "literals";
		case "all": return "all";
		default: return;
	}
}

//#endregion
//#region src/typescript/lib/utils/fixNames.ts
const awaitInSyncFunction = "fixAwaitInSyncFunction";
const classIncorrectlyImplementsInterface = "fixClassIncorrectlyImplementsInterface";
const unreachableCode = "fixUnreachableCode";
const unusedIdentifier = "unusedIdentifier";
const fixImport = "import";

//#endregion
//#region src/typescript/lib/semanticFeatures/codeActionResolve.ts
function register$2(ctx) {
	return async (codeAction, formattingOptions) => {
		const data = codeAction.data;
		const document = ctx.getTextDocument(URI.parse(data.uri));
		const [formatOptions, preferences] = await Promise.all([getFormatCodeSettings(ctx, document, formattingOptions), getUserPreferences(ctx, document)]);
		if (data?.type === "fixAll") resolveFixAllCodeAction(ctx, codeAction, data, formatOptions, preferences);
		else if (data?.type === "refactor") resolveRefactorCodeAction(ctx, codeAction, data, document, formatOptions, preferences);
		else if (data?.type === "organizeImports") resolveOrganizeImportsCodeAction(ctx, codeAction, data, formatOptions, preferences);
		return codeAction;
	};
}
function resolveFixAllCodeAction(ctx, codeAction, data, formatOptions, preferences) {
	codeAction.edit = convertFileTextChanges(data.fixIds.map((fixId) => safeCall(() => ctx.languageService.getCombinedCodeFix({
		type: "file",
		fileName: data.fileName
	}, fixId, formatOptions, preferences))).map((fix) => fix?.changes ?? []).flat(), ctx.fileNameToUri, ctx.getTextDocument);
}
function resolveRefactorCodeAction(ctx, codeAction, data, document, formatOptions, preferences) {
	const editInfo = safeCall(() => ctx.languageService.getEditsForRefactor(data.fileName, formatOptions, data.range, data.refactorName, data.actionName, preferences));
	if (!editInfo) return;
	codeAction.edit = convertFileTextChanges(editInfo.edits, ctx.fileNameToUri, ctx.getTextDocument);
	if (editInfo.renameLocation !== void 0 && editInfo.renameFilename !== void 0) codeAction.command = ctx.commands.rename.create(document.uri, document.positionAt(editInfo.renameLocation));
}
function resolveOrganizeImportsCodeAction(ctx, codeAction, data, formatOptions, preferences) {
	codeAction.edit = convertFileTextChanges(safeCall(() => ctx.languageService.organizeImports({
		type: "file",
		fileName: data.fileName
	}, formatOptions, preferences)) ?? [], ctx.fileNameToUri, ctx.getTextDocument);
}

//#endregion
//#region src/typescript/lib/semanticFeatures/codeAction.ts
const renameCommandRefactors = new Set([
	"refactor.rewrite.property.generateAccessors",
	"refactor.extract.type",
	"refactor.extract.interface",
	"refactor.extract.typedef",
	"refactor.extract.constant",
	"refactor.extract.function"
]);
function register$1(ctx) {
	let resolveCommandSupport = ctx.env.clientCapabilities?.textDocument?.codeAction?.resolveSupport?.properties?.includes("command");
	let resolveEditSupport = ctx.env.clientCapabilities?.textDocument?.codeAction?.resolveSupport?.properties?.includes("edit");
	let loged = false;
	const wranUnsupportResolve = () => {
		if (loged) return;
		loged = true;
		console.warn("[volar-service-typescript] The language client lacks support for the command/edit properties in the resolve code action. Therefore, the code action resolve is pre-calculated.");
	};
	if (!ctx.env.clientCapabilities) {
		resolveCommandSupport = true;
		resolveEditSupport = true;
	}
	return async (uri, document, range, context, formattingOptions) => {
		const [formatOptions, preferences] = await Promise.all([getFormatCodeSettings(ctx, document, formattingOptions), getUserPreferences(ctx, document)]);
		const fileName = ctx.uriToFileName(uri);
		const start = document.offsetAt(range.start);
		const end = document.offsetAt(range.end);
		let result = [];
		const onlyQuickFix = matchOnlyKind(`quickfix.ts`);
		if (!context.only || onlyQuickFix) for (const error of context.diagnostics) {
			const codeFixes = safeCall(() => ctx.languageService.getCodeFixesAtPosition(fileName, document.offsetAt(error.range.start), document.offsetAt(error.range.end), [Number(error.code)], formatOptions, preferences)) ?? [];
			for (const codeFix of codeFixes) result = result.concat(convertCodeFixAction(codeFix, [error], onlyQuickFix ?? ""));
		}
		if (context.only) {
			for (const only of context.only) if (only.split(".")[0] === "refactor") {
				const refactors = safeCall(() => ctx.languageService.getApplicableRefactors(fileName, {
					pos: start,
					end
				}, preferences, void 0, only)) ?? [];
				for (const refactor of refactors) result = result.concat(convertApplicableRefactorInfo(refactor));
			}
		} else {
			const refactors = safeCall(() => ctx.languageService.getApplicableRefactors(fileName, {
				pos: start,
				end
			}, preferences, void 0, void 0)) ?? [];
			for (const refactor of refactors) result = result.concat(convertApplicableRefactorInfo(refactor));
		}
		const onlySourceOrganizeImports = matchOnlyKind(`source.organizeImports.ts`);
		if (onlySourceOrganizeImports) {
			const action = {
				title: "Organize Imports",
				kind: onlySourceOrganizeImports
			};
			const data = {
				type: "organizeImports",
				uri: document.uri,
				fileName
			};
			if (resolveEditSupport) action.data = data;
			else {
				wranUnsupportResolve();
				resolveOrganizeImportsCodeAction(ctx, action, data, formatOptions, preferences);
			}
			result.push(action);
		}
		const onlySourceFixAll = matchOnlyKind(`source.fixAll.ts`);
		if (onlySourceFixAll) {
			const action = {
				title: "Fix All",
				kind: onlySourceFixAll
			};
			const data = {
				uri: document.uri,
				type: "fixAll",
				fileName,
				fixIds: [
					classIncorrectlyImplementsInterface,
					awaitInSyncFunction,
					unreachableCode
				]
			};
			if (resolveEditSupport) action.data = data;
			else {
				wranUnsupportResolve();
				resolveFixAllCodeAction(ctx, action, data, formatOptions, preferences);
			}
			result.push(action);
		}
		const onlyRemoveUnused = matchOnlyKind(`source.removeUnused.ts`);
		if (onlyRemoveUnused) {
			const action = {
				title: "Remove all unused code",
				kind: onlyRemoveUnused
			};
			const data = {
				uri: document.uri,
				type: "fixAll",
				fileName,
				fixIds: [
					unusedIdentifier,
					"unusedIdentifier_prefix",
					"unusedIdentifier_deleteImports",
					"unusedIdentifier_delete",
					"unusedIdentifier_infer"
				]
			};
			if (resolveEditSupport) action.data = data;
			else {
				wranUnsupportResolve();
				resolveFixAllCodeAction(ctx, action, data, formatOptions, preferences);
			}
			result.push(action);
		}
		const onlyAddMissingImports = matchOnlyKind(`source.addMissingImports.ts`);
		if (onlyAddMissingImports) {
			const action = {
				title: "Add all missing imports",
				kind: onlyAddMissingImports
			};
			const data = {
				uri: document.uri,
				type: "fixAll",
				fileName,
				fixIds: [fixImport, "fixMissingImport"]
			};
			if (resolveEditSupport) action.data = data;
			else {
				wranUnsupportResolve();
				resolveFixAllCodeAction(ctx, action, data, formatOptions, preferences);
			}
			result.push(action);
		}
		for (const codeAction of result) if (codeAction.diagnostics === void 0) codeAction.diagnostics = context.diagnostics;
		return result;
		function matchOnlyKind(kind) {
			if (context.only) for (const only of context.only) {
				const a = only.split(".");
				const b = kind.split(".");
				if (a.length <= b.length) {
					let matchNums = 0;
					for (let i = 0; i < a.length; i++) if (a[i] == b[i]) matchNums++;
					if (matchNums === a.length) return only;
				}
			}
		}
		function convertCodeFixAction(codeFix, diagnostics, kind) {
			const edit = convertFileTextChanges(codeFix.changes, ctx.fileNameToUri, ctx.getTextDocument);
			const codeActions = [];
			const fix = {
				title: codeFix.description,
				kind,
				edit
			};
			fix.diagnostics = diagnostics;
			codeActions.push(fix);
			if (codeFix.fixAllDescription && codeFix.fixId) {
				const fixAll = {
					title: codeFix.fixAllDescription,
					kind
				};
				const data = {
					uri: document.uri,
					type: "fixAll",
					fileName,
					fixIds: [codeFix.fixId]
				};
				if (resolveEditSupport) fixAll.data = data;
				else {
					wranUnsupportResolve();
					resolveFixAllCodeAction(ctx, fixAll, data, formatOptions, preferences);
				}
				fixAll.diagnostics = diagnostics;
				codeActions.push(fixAll);
			}
			return codeActions;
		}
		function convertApplicableRefactorInfo(refactor) {
			const codeActions = [];
			for (const action of refactor.actions) {
				const codeAction = {
					title: action.description,
					kind: action.kind
				};
				if (action.notApplicableReason) codeAction.disabled = { reason: action.notApplicableReason };
				if (refactor.inlineable) codeAction.isPreferred = true;
				const data = {
					uri: document.uri,
					type: "refactor",
					fileName,
					range: {
						pos: start,
						end
					},
					refactorName: refactor.name,
					actionName: action.name
				};
				const hasCommand = renameCommandRefactors.has(action.kind);
				if (hasCommand && resolveCommandSupport && resolveEditSupport) codeAction.data = data;
				else if (!hasCommand && resolveEditSupport) codeAction.data = data;
				else if (!codeAction.disabled) {
					wranUnsupportResolve();
					resolveRefactorCodeAction(ctx, codeAction, data, document, formatOptions, preferences);
				}
				codeActions.push(codeAction);
			}
			return codeActions;
		}
	};
}

//#endregion
//#region src/typescript/lib/semanticFeatures/semanticTokens.ts
function register(ts$1, ctx) {
	return (uri, document, range, legend) => {
		console.log("chufale tokens de shiyan ");
		const fileName = ctx.uriToFileName(uri);
		const start = range ? document.offsetAt(range.start) : 0;
		const length = range ? document.offsetAt(range.end) - start : document.getText().length;
		if (ctx.project.typescript?.languageServiceHost.getCancellationToken?.().isCancellationRequested()) return;
		const response = safeCall(() => ctx.languageService.getEncodedSemanticClassifications(fileName, {
			start,
			length
		}, ts$1.SemanticClassificationFormat.TwentyTwenty));
		if (!response) return;
		let tokenModifiersTable = [];
		tokenModifiersTable[TokenModifier.async] = 1 << legend.tokenModifiers.indexOf("async");
		tokenModifiersTable[TokenModifier.declaration] = 1 << legend.tokenModifiers.indexOf("declaration");
		tokenModifiersTable[TokenModifier.readonly] = 1 << legend.tokenModifiers.indexOf("readonly");
		tokenModifiersTable[TokenModifier.static] = 1 << legend.tokenModifiers.indexOf("static");
		tokenModifiersTable[TokenModifier.local] = 1 << legend.tokenModifiers.indexOf("local");
		tokenModifiersTable[TokenModifier.defaultLibrary] = 1 << legend.tokenModifiers.indexOf("defaultLibrary");
		tokenModifiersTable = tokenModifiersTable.map((mod) => Math.max(mod, 0));
		const end = start + length;
		const tokenSpan = response.spans;
		const tokens = [];
		let i = 0;
		while (i < tokenSpan.length) {
			const offset = tokenSpan[i++];
			if (offset >= end) break;
			const length$1 = tokenSpan[i++];
			const tsClassification = tokenSpan[i++];
			const tokenType = getTokenTypeFromClassification(tsClassification);
			if (tokenType === void 0) continue;
			const startPos = document.positionAt(offset);
			const endPos = document.positionAt(offset + length$1);
			const serverToken = tsTokenTypeToServerTokenType(tokenType);
			if (serverToken === void 0) continue;
			const serverTokenModifiers = tsTokenModifierToServerTokenModifier(getTokenModifierFromClassification(tsClassification));
			for (let line = startPos.line; line <= endPos.line; line++) {
				const startCharacter = line === startPos.line ? startPos.character : 0;
				const endCharacter = line === endPos.line ? endPos.character : docLineLength(document, line);
				tokens.push([
					line,
					startCharacter,
					endCharacter - startCharacter,
					serverToken,
					serverTokenModifiers
				]);
			}
		}
		return tokens;
		function tsTokenTypeToServerTokenType(tokenType) {
			return legend.tokenTypes.indexOf(tokenTypes[tokenType]);
		}
		function tsTokenModifierToServerTokenModifier(input) {
			let m = 0;
			let i$1 = 0;
			while (input) {
				if (input & 1) m |= tokenModifiersTable[i$1];
				input = input >> 1;
				i$1++;
			}
			return m;
		}
	};
}
function docLineLength(document, line) {
	const currentLineOffset = document.offsetAt({
		line,
		character: 0
	});
	return document.offsetAt({
		line: line + 1,
		character: 0
	}) - currentLineOffset;
}
var TokenType = /* @__PURE__ */ function(TokenType$1) {
	TokenType$1[TokenType$1["class"] = 0] = "class";
	TokenType$1[TokenType$1["enum"] = 1] = "enum";
	TokenType$1[TokenType$1["interface"] = 2] = "interface";
	TokenType$1[TokenType$1["namespace"] = 3] = "namespace";
	TokenType$1[TokenType$1["typeParameter"] = 4] = "typeParameter";
	TokenType$1[TokenType$1["type"] = 5] = "type";
	TokenType$1[TokenType$1["parameter"] = 6] = "parameter";
	TokenType$1[TokenType$1["variable"] = 7] = "variable";
	TokenType$1[TokenType$1["enumMember"] = 8] = "enumMember";
	TokenType$1[TokenType$1["property"] = 9] = "property";
	TokenType$1[TokenType$1["function"] = 10] = "function";
	TokenType$1[TokenType$1["method"] = 11] = "method";
	TokenType$1[TokenType$1["_"] = 12] = "_";
	return TokenType$1;
}(TokenType || {});
var TokenModifier = /* @__PURE__ */ function(TokenModifier$1) {
	TokenModifier$1[TokenModifier$1["declaration"] = 0] = "declaration";
	TokenModifier$1[TokenModifier$1["static"] = 1] = "static";
	TokenModifier$1[TokenModifier$1["async"] = 2] = "async";
	TokenModifier$1[TokenModifier$1["readonly"] = 3] = "readonly";
	TokenModifier$1[TokenModifier$1["defaultLibrary"] = 4] = "defaultLibrary";
	TokenModifier$1[TokenModifier$1["local"] = 5] = "local";
	TokenModifier$1[TokenModifier$1["_"] = 6] = "_";
	return TokenModifier$1;
}(TokenModifier || {});
var TokenEncodingConsts = /* @__PURE__ */ function(TokenEncodingConsts$1) {
	TokenEncodingConsts$1[TokenEncodingConsts$1["typeOffset"] = 8] = "typeOffset";
	TokenEncodingConsts$1[TokenEncodingConsts$1["modifierMask"] = 255] = "modifierMask";
	return TokenEncodingConsts$1;
}(TokenEncodingConsts || {});
function getTokenTypeFromClassification(tsClassification) {
	if (tsClassification > TokenEncodingConsts.modifierMask) return (tsClassification >> TokenEncodingConsts.typeOffset) - 1;
}
function getTokenModifierFromClassification(tsClassification) {
	return tsClassification & TokenEncodingConsts.modifierMask;
}
const tokenTypes = [];
tokenTypes[TokenType.class] = "class";
tokenTypes[TokenType.enum] = "enum";
tokenTypes[TokenType.interface] = "interface";
tokenTypes[TokenType.namespace] = "namespace";
tokenTypes[TokenType.typeParameter] = "typeParameter";
tokenTypes[TokenType.type] = "type";
tokenTypes[TokenType.parameter] = "parameter";
tokenTypes[TokenType.variable] = "variable";
tokenTypes[TokenType.enumMember] = "enumMember";
tokenTypes[TokenType.property] = "property";
tokenTypes[TokenType.function] = "function";
tokenTypes[TokenType.method] = "method";
const tokenModifiers = [];
tokenModifiers[TokenModifier.async] = "async";
tokenModifiers[TokenModifier.declaration] = "declaration";
tokenModifiers[TokenModifier.readonly] = "readonly";
tokenModifiers[TokenModifier.static] = "static";
tokenModifiers[TokenModifier.local] = "local";
tokenModifiers[TokenModifier.defaultLibrary] = "defaultLibrary";
let ClassificationType = /* @__PURE__ */ function(ClassificationType$1) {
	ClassificationType$1[ClassificationType$1["comment"] = 1] = "comment";
	ClassificationType$1[ClassificationType$1["identifier"] = 2] = "identifier";
	ClassificationType$1[ClassificationType$1["keyword"] = 3] = "keyword";
	ClassificationType$1[ClassificationType$1["numericLiteral"] = 4] = "numericLiteral";
	ClassificationType$1[ClassificationType$1["operator"] = 5] = "operator";
	ClassificationType$1[ClassificationType$1["stringLiteral"] = 6] = "stringLiteral";
	ClassificationType$1[ClassificationType$1["regularExpressionLiteral"] = 7] = "regularExpressionLiteral";
	ClassificationType$1[ClassificationType$1["whiteSpace"] = 8] = "whiteSpace";
	ClassificationType$1[ClassificationType$1["text"] = 9] = "text";
	ClassificationType$1[ClassificationType$1["punctuation"] = 10] = "punctuation";
	ClassificationType$1[ClassificationType$1["className"] = 11] = "className";
	ClassificationType$1[ClassificationType$1["enumName"] = 12] = "enumName";
	ClassificationType$1[ClassificationType$1["interfaceName"] = 13] = "interfaceName";
	ClassificationType$1[ClassificationType$1["moduleName"] = 14] = "moduleName";
	ClassificationType$1[ClassificationType$1["typeParameterName"] = 15] = "typeParameterName";
	ClassificationType$1[ClassificationType$1["typeAliasName"] = 16] = "typeAliasName";
	ClassificationType$1[ClassificationType$1["parameterName"] = 17] = "parameterName";
	ClassificationType$1[ClassificationType$1["docCommentTagName"] = 18] = "docCommentTagName";
	ClassificationType$1[ClassificationType$1["jsxOpenTagName"] = 19] = "jsxOpenTagName";
	ClassificationType$1[ClassificationType$1["jsxCloseTagName"] = 20] = "jsxCloseTagName";
	ClassificationType$1[ClassificationType$1["jsxSelfClosingTagName"] = 21] = "jsxSelfClosingTagName";
	ClassificationType$1[ClassificationType$1["jsxAttribute"] = 22] = "jsxAttribute";
	ClassificationType$1[ClassificationType$1["jsxText"] = 23] = "jsxText";
	ClassificationType$1[ClassificationType$1["jsxAttributeStringLiteralValue"] = 24] = "jsxAttributeStringLiteralValue";
	ClassificationType$1[ClassificationType$1["bigintLiteral"] = 25] = "bigintLiteral";
	return ClassificationType$1;
}({});
const tokenTypeMap = [];
const ExperimentalProtocol = { ClassificationType };
tokenTypeMap[ExperimentalProtocol.ClassificationType.className] = TokenType.class;
tokenTypeMap[ExperimentalProtocol.ClassificationType.enumName] = TokenType.enum;
tokenTypeMap[ExperimentalProtocol.ClassificationType.interfaceName] = TokenType.interface;
tokenTypeMap[ExperimentalProtocol.ClassificationType.moduleName] = TokenType.namespace;
tokenTypeMap[ExperimentalProtocol.ClassificationType.typeParameterName] = TokenType.typeParameter;
tokenTypeMap[ExperimentalProtocol.ClassificationType.typeAliasName] = TokenType.type;
tokenTypeMap[ExperimentalProtocol.ClassificationType.parameterName] = TokenType.parameter;

//#endregion
//#region src/typescript/lib/utils/snippetForFunctionCall.ts
function snippetForFunctionCall(item, displayParts) {
	if (item.insertText && typeof item.insertText !== "string") return {
		snippet: item.insertText,
		parameterCount: 0
	};
	let _tabstop = 1;
	const parameterListParts = getParameterListParts(displayParts);
	let snippet = "";
	snippet += `${item.insertText || item.label}(`;
	snippet = appendJoinedPlaceholders(snippet, parameterListParts.parts, ", ");
	if (parameterListParts.hasOptionalParameters) snippet += "$" + _tabstop++;
	snippet += ")";
	snippet += "$" + _tabstop++;
	return {
		snippet,
		parameterCount: parameterListParts.parts.length + (parameterListParts.hasOptionalParameters ? 1 : 0)
	};
	function appendJoinedPlaceholders(snippet$1, parts, joiner) {
		for (let i = 0; i < parts.length; ++i) {
			const paramterPart = parts[i];
			snippet$1 += "${" + _tabstop++ + ":" + paramterPart.text + "}";
			if (i !== parts.length - 1) snippet$1 += joiner;
		}
		return snippet$1;
	}
}
function getParameterListParts(displayParts) {
	const parts = [];
	let isInMethod = false;
	let hasOptionalParameters = false;
	let parenCount = 0;
	let braceCount = 0;
	outer: for (let i = 0; i < displayParts.length; ++i) {
		const part = displayParts[i];
		switch (part.kind) {
			case DisplayPartKind.methodName:
			case DisplayPartKind.functionName:
			case DisplayPartKind.text:
			case DisplayPartKind.propertyName:
				if (parenCount === 0 && braceCount === 0) isInMethod = true;
				break;
			case DisplayPartKind.parameterName:
				if (parenCount === 1 && braceCount === 0 && isInMethod) {
					const next = displayParts[i + 1];
					const nameIsFollowedByOptionalIndicator = next && next.text === "?";
					const nameIsThis = part.text === "this";
					if (!nameIsFollowedByOptionalIndicator && !nameIsThis) parts.push(part);
					hasOptionalParameters = hasOptionalParameters || nameIsFollowedByOptionalIndicator;
				}
				break;
			case DisplayPartKind.punctuation:
				if (part.text === "(") ++parenCount;
				else if (part.text === ")") {
					--parenCount;
					if (parenCount <= 0 && isInMethod) break outer;
				} else if (part.text === "..." && parenCount === 1) {
					hasOptionalParameters = true;
					break outer;
				} else if (part.text === "{") ++braceCount;
				else if (part.text === "}") --braceCount;
				break;
		}
	}
	return {
		hasOptionalParameters,
		parts
	};
}

//#endregion
//#region src/typescript/lib/plugins/semantic.ts
const documentRegistries = [];
function getDocumentRegistry(ts$1, useCaseSensitiveFileNames, currentDirectory) {
	let documentRegistry = documentRegistries.find((item) => item[0] === useCaseSensitiveFileNames && item[1] === currentDirectory)?.[2];
	if (!documentRegistry) {
		documentRegistry = ts$1.createDocumentRegistry(useCaseSensitiveFileNames, currentDirectory);
		documentRegistries.push([
			useCaseSensitiveFileNames,
			currentDirectory,
			documentRegistry
		]);
	}
	return documentRegistry;
}
function create$2(ts$1, { disableAutoImportCache = false, isValidationEnabled = async (document, context) => {
	return await context.env.getConfiguration?.(getConfigTitle(document) + ".validate.enable") ?? true;
}, isSuggestionsEnabled = async (document, context) => {
	return await context.env.getConfiguration?.(getConfigTitle(document) + ".suggest.enabled") ?? true;
} } = {}) {
	return {
		name: "typescript-semantic",
		capabilities: {
			completionProvider: {
				triggerCharacters: getBasicTriggerCharacters(ts$1.version),
				resolveProvider: true
			},
			renameProvider: { prepareProvider: true },
			fileRenameEditsProvider: true,
			codeActionProvider: {
				codeActionKinds: [
					"",
					"quickfix",
					"refactor",
					"refactor.extract",
					"refactor.inline",
					"refactor.rewrite",
					"source",
					"source.fixAll",
					"source.organizeImports"
				],
				resolveProvider: true
			},
			inlayHintProvider: {},
			callHierarchyProvider: true,
			definitionProvider: true,
			typeDefinitionProvider: true,
			diagnosticProvider: {
				interFileDependencies: true,
				workspaceDiagnostics: false
			},
			hoverProvider: true,
			implementationProvider: true,
			referencesProvider: true,
			fileReferencesProvider: true,
			documentHighlightProvider: true,
			semanticTokensProvider: { legend: {
				tokenTypes: [
					"namespace",
					"class",
					"enum",
					"interface",
					"typeParameter",
					"type",
					"parameter",
					"variable",
					"property",
					"enumMember",
					"function",
					"method"
				],
				tokenModifiers: [
					"declaration",
					"readonly",
					"static",
					"async",
					"defaultLibrary",
					"local"
				]
			} },
			workspaceSymbolProvider: {},
			signatureHelpProvider: {
				triggerCharacters: [
					"(",
					",",
					"<"
				],
				retriggerCharacters: [")"]
			}
		},
		create(context) {
			if (!context.project.typescript) {
				console.warn(`[volar] typescript-semantic requires typescript project.`);
				return {};
			}
			const { sys, languageServiceHost, uriConverter, getExtraServiceScript } = context.project.typescript;
			let languageService;
			let created$1;
			if (disableAutoImportCache) languageService = ts$1.createLanguageService(languageServiceHost, getDocumentRegistry(ts$1, sys.useCaseSensitiveFileNames, languageServiceHost.getCurrentDirectory()));
			else {
				created$1 = tsWithImportCache.createLanguageService(ts$1, sys, languageServiceHost, (proxiedHost) => ts$1.createLanguageService(proxiedHost, getDocumentRegistry(ts$1, sys.useCaseSensitiveFileNames, languageServiceHost.getCurrentDirectory())));
				languageService = created$1.languageService;
			}
			const ctx = {
				...context,
				languageServiceHost,
				languageService,
				uriToFileName(uri) {
					const virtualScript = getVirtualScriptByUri(uri);
					if (virtualScript) return virtualScript.fileName;
					return uriConverter.asFileName(uri);
				},
				fileNameToUri(fileName) {
					const extraServiceScript = getExtraServiceScript(fileName);
					if (extraServiceScript) {
						const sourceScript$1 = context.language.scripts.fromVirtualCode(extraServiceScript.code);
						return context.encodeEmbeddedDocumentUri(sourceScript$1.id, extraServiceScript.code.id);
					}
					const uri = uriConverter.asUri(fileName);
					const sourceScript = context.language.scripts.get(uri);
					const serviceScript = sourceScript?.generated?.languagePlugin.typescript?.getServiceScript(sourceScript.generated.root);
					if (sourceScript && serviceScript) return context.encodeEmbeddedDocumentUri(sourceScript.id, serviceScript.code.id);
					return uri;
				},
				getTextDocument(uri) {
					const decoded = context.decodeEmbeddedDocumentUri(uri);
					if (decoded) {
						const virtualCode = context.language.scripts.get(decoded[0])?.generated?.embeddedCodes.get(decoded[1]);
						if (virtualCode) return context.documents.get(uri, virtualCode.languageId, virtualCode.snapshot);
					} else {
						const sourceFile = context.language.scripts.get(uri);
						if (sourceFile) return context.documents.get(uri, sourceFile.languageId, sourceFile.snapshot);
					}
				}
			};
			const getCodeActions = register$1(ctx);
			const doCodeActionResolve = register$2(ctx);
			const getDocumentSemanticTokens = register(ts$1, ctx);
			const renameInfoOptions = { allowRenameOfImportPath: true };
			let formattingOptions;
			if (created$1?.setPreferences && context.env.getConfiguration) {
				updatePreferences();
				context.env.onDidChangeConfiguration?.(updatePreferences);
				async function updatePreferences() {
					const preferences = await context.env.getConfiguration?.("typescript.preferences");
					if (preferences) created$1.setPreferences?.(preferences);
				}
			}
			if (created$1?.projectUpdated) {
				const sourceScriptNames = /* @__PURE__ */ new Set();
				const normalizeFileName = sys.useCaseSensitiveFileNames ? (id) => id : (id) => id.toLowerCase();
				updateSourceScriptFileNames();
				context.env.onDidChangeWatchedFiles?.((params) => {
					if (params.changes.some((change) => change.type !== 2)) updateSourceScriptFileNames();
					for (const change of params.changes) {
						const fileName = uriConverter.asFileName(URI.parse(change.uri));
						if (sourceScriptNames.has(normalizeFileName(fileName))) created$1.projectUpdated?.(languageServiceHost.getCurrentDirectory());
					}
				});
				function updateSourceScriptFileNames() {
					sourceScriptNames.clear();
					for (const fileName of languageServiceHost.getScriptFileNames()) {
						const maybeEmbeddedUri = ctx.fileNameToUri(fileName);
						const decoded = context.decodeEmbeddedDocumentUri(maybeEmbeddedUri);
						const uri = decoded ? decoded[0] : maybeEmbeddedUri;
						const sourceScript = context.language.scripts.get(uri);
						if (sourceScript?.generated) {
							if (sourceScript.generated.languagePlugin.typescript?.getServiceScript(sourceScript.generated.root)) sourceScriptNames.add(normalizeFileName(fileName));
						} else if (sourceScript) sourceScriptNames.add(normalizeFileName(fileName));
					}
				}
			}
			return {
				provide: {
					"typescript/languageService": () => languageService,
					"typescript/languageServiceHost": () => languageServiceHost,
					"typescript/documentFileName": (uri) => ctx.uriToFileName(uri),
					"typescript/documentUri": (fileName) => ctx.fileNameToUri(fileName)
				},
				dispose() {
					languageService.dispose();
				},
				provideDocumentFormattingEdits(_document, _range, options) {
					formattingOptions = options;
				},
				provideOnTypeFormattingEdits(_document, _position, _key, options) {
					formattingOptions = options;
				},
				async provideCompletionItems(document, position, completeContext, token) {
					const uri = URI.parse(document.uri);
					if (!isSemanticDocument(uri, document)) return;
					if (!await isSuggestionsEnabled(document, context)) return;
					if (await isCancellationRequestedWhileSync(token)) return;
					const preferences = await getUserPreferences(ctx, document);
					const fileName = ctx.uriToFileName(uri);
					const offset = document.offsetAt(position);
					const opts = {
						...preferences,
						triggerCharacter: completeContext.triggerCharacter,
						triggerKind: completeContext.triggerKind
					};
					const info = safeCall(() => ctx.languageService.getCompletionsAtPosition(fileName, offset, opts));
					if (info) return convertCompletionInfo(ts$1, info, document, position, (tsEntry) => ({
						uri: document.uri,
						fileName,
						offset,
						originalItem: {
							name: tsEntry.name,
							source: tsEntry.source,
							data: tsEntry.data,
							labelDetails: tsEntry.labelDetails
						}
					}));
				},
				async resolveCompletionItem(item, token) {
					if (await isCancellationRequestedWhileSync(token)) return item;
					const data = item.data;
					if (!data) return item;
					const { fileName, offset } = data;
					const uri = URI.parse(data.uri);
					const document = ctx.getTextDocument(uri);
					const [formatOptions, preferences] = await Promise.all([getFormatCodeSettings(ctx, document, formattingOptions), getUserPreferences(ctx, document)]);
					const details = safeCall(() => ctx.languageService.getCompletionEntryDetails(fileName, offset, data.originalItem.name, formatOptions, data.originalItem.source, preferences, data.originalItem.data));
					LogUtil.log("=== resolveCompletionItem ===");
					LogUtil.log("completionName: " + data.originalItem.name);
					LogUtil.log("importSource: " + (data.originalItem.source || "null"));
					LogUtil.log("hasCodeActions: " + !!details?.codeActions?.length);
					if (details?.codeActions?.length) {
						LogUtil.log("codeActions:");
						for (const action of details.codeActions) {
							LogUtil.log("  description: " + action.description);
							for (const change of action.changes) {
								LogUtil.log("  file: " + change.fileName);
								for (const textChange of change.textChanges) {
									LogUtil.log("    span: " + JSON.stringify(textChange.span));
									LogUtil.log("    newText: " + textChange.newText.substring(0, 100));
								}
							}
						}
					}
					if (!details) return item;
					if (data.originalItem.labelDetails) {
						item.labelDetails ?? (item.labelDetails = {});
						Object.assign(item.labelDetails, data.originalItem.labelDetails);
					}
					applyCompletionEntryDetails(ts$1, item, details, document, ctx.fileNameToUri, ctx.getTextDocument);
					if ((await ctx.env.getConfiguration?.(getConfigTitle(document) + ".suggest.completeFunctionCalls") ?? false) && (item.kind === 3 || item.kind === 2)) {
						if (isValidFunctionCompletionContext(ctx.languageService, fileName, offset, document)) {
							const { snippet, parameterCount } = snippetForFunctionCall({
								insertText: item.insertText ?? item.textEdit?.newText,
								label: item.label
							}, details.displayParts);
							if (item.textEdit) item.textEdit.newText = snippet;
							if (item.insertText) item.insertText = snippet;
							item.insertTextFormat = 2;
							if (parameterCount > 0) {}
						}
					}
					return item;
					function isValidFunctionCompletionContext(client, filepath, offset$1, document$1) {
						try {
							const response = client.getQuickInfoAtPosition(filepath, offset$1);
							if (response) switch (response.kind) {
								case "var":
								case "let":
								case "const":
								case "alias": return false;
							}
						} catch {}
						const position = document$1.positionAt(offset$1);
						return getLineText(document$1, position.line).slice(position.character).match(/^[a-z_$0-9]*\s*\(/gi) === null;
					}
				},
				async provideRenameRange(document, position, token) {
					const uri = URI.parse(document.uri);
					if (!isSemanticDocument(uri, document)) return;
					if (await isCancellationRequestedWhileSync(token)) return;
					const fileName = ctx.uriToFileName(uri);
					const offset = document.offsetAt(position);
					const renameInfo = safeCall(() => ctx.languageService.getRenameInfo(fileName, offset, renameInfoOptions));
					if (!renameInfo) return;
					if (!renameInfo.canRename) return { message: renameInfo.localizedErrorMessage };
					return convertTextSpan(renameInfo.triggerSpan, document);
				},
				async provideRenameEdits(document, position, newName, token) {
					const uri = URI.parse(document.uri);
					if (!isSemanticDocument(uri, document, true)) return;
					if (await isCancellationRequestedWhileSync(token)) return;
					const fileName = ctx.uriToFileName(uri);
					const offset = document.offsetAt(position);
					const renameInfo = safeCall(() => ctx.languageService.getRenameInfo(fileName, offset, renameInfoOptions));
					if (!renameInfo?.canRename) return;
					if (renameInfo.fileToRename) {
						const [formatOptions, preferences] = await Promise.all([getFormatCodeSettings(ctx, document, formattingOptions), getUserPreferences(ctx, document)]);
						return renameFile(renameInfo.fileToRename, newName, formatOptions, preferences);
					}
					const { providePrefixAndSuffixTextForRename } = await getUserPreferences(ctx, document);
					const entries = ctx.languageService.findRenameLocations(fileName, offset, false, false, providePrefixAndSuffixTextForRename);
					if (!entries) return;
					return convertRenameLocations(newName, entries, ctx.fileNameToUri, ctx.getTextDocument);
					function renameFile(fileToRename, newName$1, formatOptions, preferences) {
						if (!path.extname(newName$1)) newName$1 += path.extname(fileToRename);
						const dirname = path.dirname(fileToRename);
						const newFilePath = path.join(dirname, newName$1);
						const response = safeCall(() => ctx.languageService.getEditsForFileRename(fileToRename, newFilePath, formatOptions, preferences));
						if (!response) return;
						const edits = convertFileTextChanges(response, ctx.fileNameToUri, ctx.getTextDocument);
						if (!edits.documentChanges) edits.documentChanges = [];
						edits.documentChanges.push({
							kind: "rename",
							oldUri: ctx.fileNameToUri(fileToRename).toString(),
							newUri: ctx.fileNameToUri(newFilePath).toString()
						});
						return edits;
					}
				},
				async provideCodeActions(document, range, context$1, token) {
					const uri = URI.parse(document.uri);
					if (!isSemanticDocument(uri, document)) return;
					if (await isCancellationRequestedWhileSync(token)) return;
					return getCodeActions(uri, document, range, context$1, formattingOptions);
				},
				async resolveCodeAction(codeAction, token) {
					if (await isCancellationRequestedWhileSync(token)) return codeAction;
					return doCodeActionResolve(codeAction, formattingOptions);
				},
				async provideInlayHints(document, range, token) {
					const uri = URI.parse(document.uri);
					if (!isSemanticDocument(uri, document)) return;
					if (await isCancellationRequestedWhileSync(token)) return;
					const preferences = await getUserPreferences(ctx, document);
					const fileName = ctx.uriToFileName(uri);
					const start = document.offsetAt(range.start);
					const end = document.offsetAt(range.end);
					const inlayHints = safeCall(() => "provideInlayHints" in ctx.languageService ? ctx.languageService.provideInlayHints(fileName, {
						start,
						length: end - start
					}, preferences) : []);
					if (!inlayHints) return [];
					return inlayHints.map((hint) => convertInlayHint(hint, document));
				},
				async provideCallHierarchyItems(document, position, token) {
					const uri = URI.parse(document.uri);
					if (!isSemanticDocument(uri, document)) return;
					if (await isCancellationRequestedWhileSync(token)) return;
					const fileName = ctx.uriToFileName(uri);
					const offset = document.offsetAt(position);
					const calls = safeCall(() => ctx.languageService.prepareCallHierarchy(fileName, offset));
					if (!calls) return [];
					return (Array.isArray(calls) ? calls : [calls]).map((item) => convertCallHierarchyItem(item, ctx));
				},
				async provideCallHierarchyIncomingCalls(item, token) {
					if (await isCancellationRequestedWhileSync(token)) return [];
					const uri = URI.parse(item.uri);
					const document = ctx.getTextDocument(uri);
					const fileName = ctx.uriToFileName(uri);
					const offset = document.offsetAt(item.selectionRange.start);
					const calls = safeCall(() => ctx.languageService.provideCallHierarchyIncomingCalls(fileName, offset));
					if (!calls) return [];
					return (Array.isArray(calls) ? calls : [calls]).map((item$1) => convertCallHierarchyIncomingCall(item$1, ctx));
				},
				async provideCallHierarchyOutgoingCalls(item, token) {
					if (await isCancellationRequestedWhileSync(token)) return [];
					const uri = URI.parse(item.uri);
					const document = ctx.getTextDocument(uri);
					const fileName = ctx.uriToFileName(uri);
					const offset = document.offsetAt(item.selectionRange.start);
					const calls = safeCall(() => ctx.languageService.provideCallHierarchyOutgoingCalls(fileName, offset));
					if (!calls) return [];
					return (Array.isArray(calls) ? calls : [calls]).map((item$1) => convertCallHierarchyOutgoingCall(item$1, document, ctx));
				},
				async provideDefinition(document, position, token) {
					const uri = URI.parse(document.uri);
					if (!isSemanticDocument(uri, document)) return;
					if (await isCancellationRequestedWhileSync(token)) return;
					const fileName = ctx.uriToFileName(uri);
					const offset = document.offsetAt(position);
					const info = safeCall(() => ctx.languageService.getDefinitionAndBoundSpan(fileName, offset));
					if (!info) return [];
					return convertDefinitionInfoAndBoundSpan(info, document, ctx);
				},
				async provideTypeDefinition(document, position, token) {
					const uri = URI.parse(document.uri);
					if (!isSemanticDocument(uri, document)) return;
					if (await isCancellationRequestedWhileSync(token)) return;
					const fileName = ctx.uriToFileName(uri);
					const offset = document.offsetAt(position);
					const entries = safeCall(() => ctx.languageService.getTypeDefinitionAtPosition(fileName, offset));
					if (!entries) return [];
					return entries.map((entry) => convertDocumentSpantoLocationLink(entry, ctx));
				},
				async provideDiagnostics(document, token) {
					return [...await provideDiagnosticsWorker(document, token, "syntactic") ?? [], ...await provideDiagnosticsWorker(document, token, "semantic") ?? []];
				},
				async provideHover(document, position, token) {
					const uri = URI.parse(document.uri);
					if (!isSemanticDocument(uri, document)) return;
					if (await isCancellationRequestedWhileSync(token)) return;
					const fileName = ctx.uriToFileName(uri);
					const offset = document.offsetAt(position);
					const info = safeCall(() => ctx.languageService.getQuickInfoAtPosition(fileName, offset));
					if (!info) return;
					return convertQuickInfo(ts$1, info, document, ctx.fileNameToUri, ctx.getTextDocument);
				},
				async provideImplementation(document, position, token) {
					const uri = URI.parse(document.uri);
					if (!isSemanticDocument(uri, document)) return;
					if (await isCancellationRequestedWhileSync(token)) return;
					const fileName = ctx.uriToFileName(uri);
					const offset = document.offsetAt(position);
					const entries = safeCall(() => ctx.languageService.getImplementationAtPosition(fileName, offset));
					if (!entries) return [];
					return entries.map((entry) => convertDocumentSpantoLocationLink(entry, ctx));
				},
				async provideReferences(document, position, referenceContext, token) {
					const uri = URI.parse(document.uri);
					if (!isSemanticDocument(uri, document, true)) return;
					if (await isCancellationRequestedWhileSync(token)) return;
					const fileName = ctx.uriToFileName(uri);
					const offset = document.offsetAt(position);
					const references = safeCall(() => ctx.languageService.findReferences(fileName, offset));
					if (!references) return [];
					const result = [];
					for (const reference of references) {
						if (referenceContext.includeDeclaration) {
							const definition = convertDocumentSpanToLocation(reference.definition, ctx);
							if (definition) result.push(definition);
						}
						for (const referenceEntry of reference.references) {
							const reference$1 = convertDocumentSpanToLocation(referenceEntry, ctx);
							if (reference$1) result.push(reference$1);
						}
					}
					return result;
				},
				async provideFileReferences(document, token) {
					const uri = URI.parse(document.uri);
					if (!isSemanticDocument(uri, document, true)) return;
					if (await isCancellationRequestedWhileSync(token)) return;
					const fileName = ctx.uriToFileName(uri);
					const entries = safeCall(() => ctx.languageService.getFileReferences(fileName));
					if (!entries) return [];
					return entries.map((entry) => convertDocumentSpanToLocation(entry, ctx));
				},
				async provideDocumentHighlights(document, position, token) {
					const uri = URI.parse(document.uri);
					if (!isSemanticDocument(uri, document)) return;
					if (await isCancellationRequestedWhileSync(token)) return;
					const fileName = ctx.uriToFileName(uri);
					const offset = document.offsetAt(position);
					const highlights = safeCall(() => ctx.languageService.getDocumentHighlights(fileName, offset, [fileName]));
					if (!highlights) return [];
					const results = [];
					for (const highlight of highlights) for (const span of highlight.highlightSpans) results.push(convertHighlightSpan(span, document));
					return results;
				},
				async provideDocumentSemanticTokens(document, range, legend, token) {
					const uri = URI.parse(document.uri);
					if (!isSemanticDocument(uri, document)) return;
					if (await isCancellationRequestedWhileSync(token)) return;
					return getDocumentSemanticTokens(uri, document, range, legend);
				},
				async provideWorkspaceSymbols(query, token) {
					if (await isCancellationRequestedWhileSync(token)) return;
					const items = safeCall(() => ctx.languageService.getNavigateToItems(query));
					if (!items) return [];
					return items.filter((item) => item.containerName || item.kind !== "alias").map((item) => convertNavigateToItem(item, ctx.getTextDocument(ctx.fileNameToUri(item.fileName)))).filter((item) => !!item);
				},
				async provideFileRenameEdits(oldUri, newUri, token) {
					if (await isCancellationRequestedWhileSync(token)) return;
					const document = ctx.getTextDocument(oldUri);
					const [formatOptions, preferences] = await Promise.all([getFormatCodeSettings(ctx, document, formattingOptions), getUserPreferences(ctx, document)]);
					const fileToRename = ctx.uriToFileName(oldUri);
					const newFilePath = ctx.uriToFileName(newUri);
					const response = safeCall(() => ctx.languageService.getEditsForFileRename(fileToRename, newFilePath, formatOptions, preferences));
					if (!response?.length) return;
					return convertFileTextChanges(response, ctx.fileNameToUri, ctx.getTextDocument);
				},
				async provideSignatureHelp(document, position, context$1, token) {
					const uri = URI.parse(document.uri);
					if (!isSemanticDocument(uri, document)) return;
					if (await isCancellationRequestedWhileSync(token)) return;
					const options = {};
					if (context$1?.triggerKind === 1) options.triggerReason = { kind: "invoked" };
					else if (context$1?.triggerKind === 2) options.triggerReason = {
						kind: "characterTyped",
						triggerCharacter: context$1.triggerCharacter
					};
					else if (context$1?.triggerKind === 3) options.triggerReason = {
						kind: "retrigger",
						triggerCharacter: context$1.triggerCharacter
					};
					const fileName = ctx.uriToFileName(uri);
					const offset = document.offsetAt(position);
					const helpItems = safeCall(() => ctx.languageService.getSignatureHelpItems(fileName, offset, options));
					if (!helpItems) return;
					return {
						activeSignature: helpItems.selectedItemIndex,
						activeParameter: helpItems.argumentIndex,
						signatures: helpItems.items.map((item) => {
							const signature = {
								label: "",
								documentation: void 0,
								parameters: []
							};
							signature.label += ts$1.displayPartsToString(item.prefixDisplayParts);
							item.parameters.forEach((p, i, a) => {
								const label = ts$1.displayPartsToString(p.displayParts);
								const parameter = {
									label,
									documentation: ts$1.displayPartsToString(p.documentation)
								};
								signature.label += label;
								signature.parameters.push(parameter);
								if (i < a.length - 1) signature.label += ts$1.displayPartsToString(item.separatorDisplayParts);
							});
							signature.label += ts$1.displayPartsToString(item.suffixDisplayParts);
							return signature;
						})
					};
				}
			};
			async function provideDiagnosticsWorker(document, token, mode) {
				const uri = URI.parse(document.uri);
				if (!isSemanticDocument(uri, document)) return;
				if (!await isValidationEnabled(document, context)) return;
				if (mode === "semantic" && await isCancellationRequestedWhileSync(token)) return;
				const fileName = ctx.uriToFileName(uri);
				const program = ctx.languageService.getProgram();
				const sourceFile = program?.getSourceFile(fileName);
				if (!program || !sourceFile) return [];
				const tsToken = {
					isCancellationRequested() {
						return ctx.project.typescript?.languageServiceHost.getCancellationToken?.().isCancellationRequested() ?? false;
					},
					throwIfCancellationRequested() {}
				};
				if (mode === "syntactic") {
					const syntacticDiagnostics = safeCall(() => program.getSyntacticDiagnostics(sourceFile, tsToken)) ?? [];
					const suggestionDiagnostics = safeCall(() => ctx.languageService.getSuggestionDiagnostics(fileName)) ?? [];
					return [...syntacticDiagnostics, ...suggestionDiagnostics].map((diagnostic) => convertDiagnostic(diagnostic, document, ctx.fileNameToUri, ctx.getTextDocument)).filter((diagnostic) => !!diagnostic);
				} else if (mode === "semantic") {
					const semanticDiagnostics = safeCall(() => program.getSemanticDiagnostics(sourceFile, tsToken)) ?? [];
					const declarationDiagnostics = getEmitDeclarations(program.getCompilerOptions()) ? safeCall(() => program.getDeclarationDiagnostics(sourceFile, tsToken)) ?? [] : [];
					try {
						for (const semanticDiagnostic of semanticDiagnostics);
					} catch (e) {}
					return [...semanticDiagnostics, ...declarationDiagnostics].map((diagnostic) => convertDiagnostic(diagnostic, document, ctx.fileNameToUri, ctx.getTextDocument)).filter((diagnostic) => !!diagnostic);
				}
			}
			function getEmitDeclarations(compilerOptions) {
				return !!(compilerOptions.declaration || compilerOptions.composite);
			}
			function isSemanticDocument(uri, document, withJson = false) {
				if (getVirtualScriptByUri(uri)) return true;
				if (withJson && isJsonDocument(document)) return true;
				return isTsDocument(document);
			}
			async function isCancellationRequestedWhileSync(token) {
				if (sys.sync) {
					let oldSysVersion;
					let newSysVersion = sys.version;
					do {
						oldSysVersion = newSysVersion;
						languageService.getProgram();
						newSysVersion = await aggressiveSync(sys.sync);
					} while (newSysVersion !== oldSysVersion && !token.isCancellationRequested);
				}
				return token.isCancellationRequested;
			}
			async function aggressiveSync(fn) {
				const promise = fn();
				let newVersion;
				let syncing = true;
				promise.then((version) => {
					newVersion = version;
					syncing = false;
				});
				while (syncing) {
					languageService.getProgram();
					await Promise.race([promise, sleep(10)]);
				}
				return newVersion;
			}
			function sleep(ms) {
				return new Promise((resolve) => setTimeout(resolve, ms));
			}
			function getVirtualScriptByUri(uri) {
				const decoded = context.decodeEmbeddedDocumentUri(uri);
				const sourceScript = decoded && context.language.scripts.get(decoded[0]);
				const virtualCode = decoded && sourceScript?.generated?.embeddedCodes.get(decoded[1]);
				if (virtualCode && sourceScript?.generated?.languagePlugin.typescript) {
					const { getServiceScript, getExtraServiceScripts } = sourceScript.generated?.languagePlugin.typescript;
					const sourceFileName = uriConverter.asFileName(sourceScript.id);
					if (getServiceScript(sourceScript.generated.root)?.code === virtualCode) return {
						fileName: sourceFileName,
						code: virtualCode
					};
					for (const extraScript of getExtraServiceScripts?.(sourceFileName, sourceScript.generated.root) ?? []) if (extraScript.code === virtualCode) return extraScript;
				}
			}
		}
	};
}
function getBasicTriggerCharacters(tsVersion) {
	const triggerCharacters = [
		".",
		"\"",
		"'",
		"`",
		"/",
		"<"
	];
	if (semver.lt(tsVersion, "3.1.0") || semver.gte(tsVersion, "3.2.0")) triggerCharacters.push("@");
	if (semver.gte(tsVersion, "3.8.1")) triggerCharacters.push("#");
	return triggerCharacters;
}

//#endregion
//#region src/typescript/index.ts
function createTypeScriptServices(ts$1, options) {
	return [
		create$2(ts$1, options),
		create$3(ts$1, options),
		create$1(ts$1),
		create()
	];
}

//#endregion
//#region src/OvsLanguagePlugin.ts
const ovsLanguagePlugin = {
	getLanguageId(uri) {
		if (uri.path.endsWith(".ovs")) return "ovs";
	},
	createVirtualCode(_uri, languageId, snapshot) {
		if (languageId === "ovs") return new OvsVirtualCode(snapshot);
	},
	typescript: {
		extraFileExtensions: [{
			extension: "ovs",
			isMixedContent: true,
			scriptKind: ts.ScriptKind.Deferred
		}],
		getServiceScript() {},
		getExtraServiceScripts(fileName, root) {
			const scripts = [];
			const ary = [...forEachEmbeddedCode(root)];
			for (const code of ary) if (code.languageId === "js") scripts.push({
				fileName: fileName + "." + code.id + ".js",
				code,
				extension: ".js",
				scriptKind: ts.ScriptKind.JS
			});
			return scripts;
		}
	}
};
var MappingConverter = class {
	static convertMappings(mappings) {
		return mappings.filter((mapping) => {
			return mapping.source && mapping.generate;
		}).map((mapping, index) => {
			return {
				original: {
					offset: mapping.source.index,
					length: mapping.source.length
				},
				generated: {
					offset: mapping.generate.index,
					length: mapping.generate.length
				}
			};
		});
	}
};
var OvsVirtualCode = class {
	constructor(snapshot) {
		this.snapshot = snapshot;
		_defineProperty(this, "id", "root");
		_defineProperty(this, "languageId", "qqovs");
		_defineProperty(this, "mappings", void 0);
		_defineProperty(this, "embeddedCodes", []);
		this.mappings = [{
			sourceOffsets: [0],
			generatedOffsets: [0],
			lengths: [snapshot.getLength()],
			data: {
				completion: true,
				format: true,
				navigation: true,
				semantic: true,
				structure: true,
				verification: true
			}
		}];
		const styleText = snapshot.getText(0, snapshot.getLength());
		let newCode = styleText;
		LogUtil.log("=== OVS Transform Start ===");
		let mapping = [];
		try {
			LogUtil.log("Input code length: " + styleText.length);
			const res = vitePluginOvsTransform(styleText);
			newCode = res.code;
			mapping = res.mapping;
			LogUtil.log("=== OVS Transform Success ===");
			LogUtil.log("Output code length: " + newCode.length);
		} catch (e) {
			LogUtil.log("=== OVS Transform Error ===");
			if (e instanceof Error) {
				LogUtil.log("Error type: " + e.constructor.name);
				LogUtil.log("Error message: " + e.message);
				LogUtil.log("Error stack: " + e.stack);
			} else LogUtil.log("Unknown error: " + String(e));
			newCode = styleText;
			mapping = [];
		}
		const offsets = MappingConverter.convertMappings(mapping);
		LogUtil.log("mappings ascopy mapping");
		LogUtil.log(styleText);
		LogUtil.log(newCode);
		this.embeddedCodes = [{
			id: "ovsts",
			languageId: "js",
			snapshot: {
				getText: (start, end) => newCode.substring(start, end),
				getLength: () => newCode.length,
				getChangeRange: () => void 0
			},
			mappings: [{
				sourceOffsets: offsets.map((item) => item.original.offset),
				generatedOffsets: offsets.map((item) => item.generated.offset),
				lengths: offsets.map((item) => item.original.length),
				generatedLengths: offsets.map((item) => item.generated.length),
				data: {
					completion: true,
					format: true,
					navigation: true,
					semantic: true,
					structure: true,
					verification: true
				}
			}],
			embeddedCodes: []
		}];
	}
};

//#endregion
//#region src/index.ts
const connection = createConnection();
const server = createServer(connection);
connection.listen();
connection.onInitialize((params) => {
	LogUtil.log("onInitialize params:");
	LogUtil.log(params);
	try {
		const tsdkPath = params.initializationOptions?.typescript?.tsdk;
		if (!tsdkPath) LogUtil.log("Warning: No tsdk path provided, using fallback");
		const tsdk = loadTsdkByPath(tsdkPath, params.locale);
		const languagePlugins = [ovsLanguagePlugin];
		const languageServicePlugins = [...createTypeScriptServices(tsdk.typescript)];
		const tsProject = createTypeScriptProject(tsdk.typescript, tsdk.diagnosticMessages, () => ({ languagePlugins }));
		const res = server.initialize(params, tsProject, [...languageServicePlugins]);
		LogUtil.log("Server initialized with capabilities:");
		LogUtil.log(res.capabilities);
		return res;
	} catch (e) {
		LogUtil.log("Error during initialization:");
		LogUtil.log(e.message);
		throw e;
	}
});
connection.onInitialized(server.initialized);
connection.onShutdown(server.shutdown);

//#endregion
export {  };