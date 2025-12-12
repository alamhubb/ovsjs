/**
 * CsstsAtoms 接口 - 原子类类型定义（唯一数据源）
 * 
 * 自动生成，请勿手动修改
 * 生成时间: 2025-12-12T04:51:11.660Z
 * 数据来源: css-tree
 * 
 * 命名规则:
 * - CSS 类名: property_value（用 _ 分隔属性和值）
 * - TS 变量名: propertyValue（camelCase）
 * - 小数点: 用 p 代替（1.25 → 1p25）
 */

export interface CsstsAtoms {
  // ==================== display ====================
  readonly displayBlock: { 'display_block': true }
  readonly displayContents: { 'display_contents': true }
  readonly displayFlex: { 'display_flex': true }
  readonly displayFlow: { 'display_flow': true }
  readonly displayFlowRoot: { 'display_flow-root': true }
  readonly displayGrid: { 'display_grid': true }
  readonly displayInline: { 'display_inline': true }
  readonly displayInlineBlock: { 'display_inline-block': true }
  readonly displayInlineFlex: { 'display_inline-flex': true }
  readonly displayInlineGrid: { 'display_inline-grid': true }
  readonly displayInlineListItem: { 'display_inline-list-item': true }
  readonly displayInlineTable: { 'display_inline-table': true }
  readonly displayListItem: { 'display_list-item': true }
  readonly displayNone: { 'display_none': true }
  readonly displayRuby: { 'display_ruby': true }
  readonly displayRubyBase: { 'display_ruby-base': true }
  readonly displayRubyBaseContainer: { 'display_ruby-base-container': true }
  readonly displayRubyText: { 'display_ruby-text': true }
  readonly displayRubyTextContainer: { 'display_ruby-text-container': true }
  readonly displayRunIn: { 'display_run-in': true }
  readonly displayTable: { 'display_table': true }
  readonly displayTableCaption: { 'display_table-caption': true }
  readonly displayTableCell: { 'display_table-cell': true }
  readonly displayTableColumn: { 'display_table-column': true }
  readonly displayTableColumnGroup: { 'display_table-column-group': true }
  readonly displayTableFooterGroup: { 'display_table-footer-group': true }
  readonly displayTableHeaderGroup: { 'display_table-header-group': true }
  readonly displayTableRow: { 'display_table-row': true }
  readonly displayTableRowGroup: { 'display_table-row-group': true }

  // ==================== position ====================
  readonly positionAbsolute: { 'position_absolute': true }
  readonly positionFixed: { 'position_fixed': true }
  readonly positionRelative: { 'position_relative': true }
  readonly positionStatic: { 'position_static': true }
  readonly positionSticky: { 'position_sticky': true }

  // ==================== float ====================
  readonly floatInlineEnd: { 'float_inline-end': true }
  readonly floatInlineStart: { 'float_inline-start': true }
  readonly floatLeft: { 'float_left': true }
  readonly floatNone: { 'float_none': true }
  readonly floatRight: { 'float_right': true }

  // ==================== clear ====================
  readonly clearBoth: { 'clear_both': true }
  readonly clearInlineEnd: { 'clear_inline-end': true }
  readonly clearInlineStart: { 'clear_inline-start': true }
  readonly clearLeft: { 'clear_left': true }
  readonly clearNone: { 'clear_none': true }
  readonly clearRight: { 'clear_right': true }

  // ==================== flex-direction ====================
  readonly flexDirectionColumn: { 'flex-direction_column': true }
  readonly flexDirectionColumnReverse: { 'flex-direction_column-reverse': true }
  readonly flexDirectionRow: { 'flex-direction_row': true }
  readonly flexDirectionRowReverse: { 'flex-direction_row-reverse': true }

  // ==================== flex-wrap ====================
  readonly flexWrapNowrap: { 'flex-wrap_nowrap': true }
  readonly flexWrapWrap: { 'flex-wrap_wrap': true }
  readonly flexWrapWrapReverse: { 'flex-wrap_wrap-reverse': true }

  // ==================== flex-grow ====================
  readonly flexGrow0: { 'flex-grow_0': true }
  readonly flexGrow1: { 'flex-grow_1': true }

  // ==================== flex-shrink ====================
  readonly flexShrink0: { 'flex-shrink_0': true }
  readonly flexShrink1: { 'flex-shrink_1': true }

  // ==================== flex-basis ====================
  readonly flexBasisContent: { 'flex-basis_content': true }

  // ==================== justify-content ====================
  readonly justifyContentCenter: { 'justify-content_center': true }
  readonly justifyContentEnd: { 'justify-content_end': true }
  readonly justifyContentFlexEnd: { 'justify-content_flex-end': true }
  readonly justifyContentFlexStart: { 'justify-content_flex-start': true }
  readonly justifyContentLeft: { 'justify-content_left': true }
  readonly justifyContentNormal: { 'justify-content_normal': true }
  readonly justifyContentRight: { 'justify-content_right': true }
  readonly justifyContentSafe: { 'justify-content_safe': true }
  readonly justifyContentSpaceAround: { 'justify-content_space-around': true }
  readonly justifyContentSpaceBetween: { 'justify-content_space-between': true }
  readonly justifyContentSpaceEvenly: { 'justify-content_space-evenly': true }
  readonly justifyContentStart: { 'justify-content_start': true }
  readonly justifyContentStretch: { 'justify-content_stretch': true }
  readonly justifyContentUnsafe: { 'justify-content_unsafe': true }

  // ==================== align-items ====================
  readonly alignItemsBaseline: { 'align-items_baseline': true }
  readonly alignItemsCenter: { 'align-items_center': true }
  readonly alignItemsEnd: { 'align-items_end': true }
  readonly alignItemsFirst: { 'align-items_first': true }
  readonly alignItemsFlexEnd: { 'align-items_flex-end': true }
  readonly alignItemsFlexStart: { 'align-items_flex-start': true }
  readonly alignItemsLast: { 'align-items_last': true }
  readonly alignItemsNormal: { 'align-items_normal': true }
  readonly alignItemsSafe: { 'align-items_safe': true }
  readonly alignItemsSelfEnd: { 'align-items_self-end': true }
  readonly alignItemsSelfStart: { 'align-items_self-start': true }
  readonly alignItemsStart: { 'align-items_start': true }
  readonly alignItemsStretch: { 'align-items_stretch': true }
  readonly alignItemsUnsafe: { 'align-items_unsafe': true }

  // ==================== align-self ====================
  readonly alignSelfAuto: { 'align-self_auto': true }
  readonly alignSelfBaseline: { 'align-self_baseline': true }
  readonly alignSelfCenter: { 'align-self_center': true }
  readonly alignSelfEnd: { 'align-self_end': true }
  readonly alignSelfFirst: { 'align-self_first': true }
  readonly alignSelfFlexEnd: { 'align-self_flex-end': true }
  readonly alignSelfFlexStart: { 'align-self_flex-start': true }
  readonly alignSelfLast: { 'align-self_last': true }
  readonly alignSelfNormal: { 'align-self_normal': true }
  readonly alignSelfSafe: { 'align-self_safe': true }
  readonly alignSelfSelfEnd: { 'align-self_self-end': true }
  readonly alignSelfSelfStart: { 'align-self_self-start': true }
  readonly alignSelfStart: { 'align-self_start': true }
  readonly alignSelfStretch: { 'align-self_stretch': true }
  readonly alignSelfUnsafe: { 'align-self_unsafe': true }

  // ==================== align-content ====================
  readonly alignContentBaseline: { 'align-content_baseline': true }
  readonly alignContentCenter: { 'align-content_center': true }
  readonly alignContentEnd: { 'align-content_end': true }
  readonly alignContentFirst: { 'align-content_first': true }
  readonly alignContentFlexEnd: { 'align-content_flex-end': true }
  readonly alignContentFlexStart: { 'align-content_flex-start': true }
  readonly alignContentLast: { 'align-content_last': true }
  readonly alignContentNormal: { 'align-content_normal': true }
  readonly alignContentSafe: { 'align-content_safe': true }
  readonly alignContentSpaceAround: { 'align-content_space-around': true }
  readonly alignContentSpaceBetween: { 'align-content_space-between': true }
  readonly alignContentSpaceEvenly: { 'align-content_space-evenly': true }
  readonly alignContentStart: { 'align-content_start': true }
  readonly alignContentStretch: { 'align-content_stretch': true }
  readonly alignContentUnsafe: { 'align-content_unsafe': true }

  // ==================== order ====================
  readonly order1: { 'order_-1': true }
  readonly order0: { 'order_0': true }
  readonly order2: { 'order_2': true }
  readonly order3: { 'order_3': true }
  readonly order4: { 'order_4': true }
  readonly order5: { 'order_5': true }

  // ==================== width ====================
  readonly widthAuto: { 'width_auto': true }
  readonly widthFitContent: { 'width_fit-content': true }
  readonly widthIntrinsic: { 'width_intrinsic': true }
  readonly widthMaxContent: { 'width_max-content': true }
  readonly widthMinContent: { 'width_min-content': true }
  readonly widthMinIntrinsic: { 'width_min-intrinsic': true }
  readonly widthStretch: { 'width_stretch': true }
  readonly width0: { 'width_0': true }
  readonly width24: { 'width_24': true }
  readonly width32: { 'width_32': true }
  readonly width40: { 'width_40': true }
  readonly width48: { 'width_48': true }
  readonly width64: { 'width_64': true }
  readonly width80: { 'width_80': true }
  readonly width100: { 'width_100': true }
  readonly width120: { 'width_120': true }
  readonly width160: { 'width_160': true }
  readonly width200: { 'width_200': true }
  readonly width240: { 'width_240': true }
  readonly width320: { 'width_320': true }
  readonly widthFull: { 'width_full': true }
  readonly widthHalf: { 'width_half': true }
  readonly widthScreen: { 'width_screen': true }

  // ==================== height ====================
  readonly heightAuto: { 'height_auto': true }
  readonly heightFitContent: { 'height_fit-content': true }
  readonly heightIntrinsic: { 'height_intrinsic': true }
  readonly heightMaxContent: { 'height_max-content': true }
  readonly heightMinContent: { 'height_min-content': true }
  readonly heightMinIntrinsic: { 'height_min-intrinsic': true }
  readonly heightStretch: { 'height_stretch': true }
  readonly height0: { 'height_0': true }
  readonly height24: { 'height_24': true }
  readonly height32: { 'height_32': true }
  readonly height40: { 'height_40': true }
  readonly height48: { 'height_48': true }
  readonly height64: { 'height_64': true }
  readonly height80: { 'height_80': true }
  readonly height100: { 'height_100': true }
  readonly height120: { 'height_120': true }
  readonly heightFull: { 'height_full': true }
  readonly heightHalf: { 'height_half': true }
  readonly heightScreen: { 'height_screen': true }

  // ==================== min-width ====================
  readonly minWidthAuto: { 'min-width_auto': true }
  readonly minWidthFitContent: { 'min-width_fit-content': true }
  readonly minWidthIntrinsic: { 'min-width_intrinsic': true }
  readonly minWidthMaxContent: { 'min-width_max-content': true }
  readonly minWidthMinContent: { 'min-width_min-content': true }
  readonly minWidthMinIntrinsic: { 'min-width_min-intrinsic': true }
  readonly minWidthStretch: { 'min-width_stretch': true }

  // ==================== max-width ====================
  readonly maxWidthFitContent: { 'max-width_fit-content': true }
  readonly maxWidthIntrinsic: { 'max-width_intrinsic': true }
  readonly maxWidthMaxContent: { 'max-width_max-content': true }
  readonly maxWidthMinContent: { 'max-width_min-content': true }
  readonly maxWidthMinIntrinsic: { 'max-width_min-intrinsic': true }
  readonly maxWidthNone: { 'max-width_none': true }
  readonly maxWidthStretch: { 'max-width_stretch': true }

  // ==================== min-height ====================
  readonly minHeightAuto: { 'min-height_auto': true }
  readonly minHeightFitContent: { 'min-height_fit-content': true }
  readonly minHeightIntrinsic: { 'min-height_intrinsic': true }
  readonly minHeightMaxContent: { 'min-height_max-content': true }
  readonly minHeightMinContent: { 'min-height_min-content': true }
  readonly minHeightMinIntrinsic: { 'min-height_min-intrinsic': true }
  readonly minHeightStretch: { 'min-height_stretch': true }

  // ==================== max-height ====================
  readonly maxHeightFitContent: { 'max-height_fit-content': true }
  readonly maxHeightIntrinsic: { 'max-height_intrinsic': true }
  readonly maxHeightMaxContent: { 'max-height_max-content': true }
  readonly maxHeightMinContent: { 'max-height_min-content': true }
  readonly maxHeightMinIntrinsic: { 'max-height_min-intrinsic': true }
  readonly maxHeightNone: { 'max-height_none': true }
  readonly maxHeightStretch: { 'max-height_stretch': true }

  // ==================== padding ====================
  readonly padding0: { 'padding_0': true }
  readonly padding2: { 'padding_2': true }
  readonly padding4: { 'padding_4': true }
  readonly padding6: { 'padding_6': true }
  readonly padding8: { 'padding_8': true }
  readonly padding10: { 'padding_10': true }
  readonly padding12: { 'padding_12': true }
  readonly padding14: { 'padding_14': true }
  readonly padding16: { 'padding_16': true }
  readonly padding20: { 'padding_20': true }
  readonly padding24: { 'padding_24': true }
  readonly padding32: { 'padding_32': true }
  readonly padding40: { 'padding_40': true }
  readonly padding48: { 'padding_48': true }
  readonly padding64: { 'padding_64': true }

  // ==================== margin ====================
  readonly marginAuto: { 'margin_auto': true }
  readonly margin0: { 'margin_0': true }
  readonly margin2: { 'margin_2': true }
  readonly margin4: { 'margin_4': true }
  readonly margin6: { 'margin_6': true }
  readonly margin8: { 'margin_8': true }
  readonly margin10: { 'margin_10': true }
  readonly margin12: { 'margin_12': true }
  readonly margin14: { 'margin_14': true }
  readonly margin16: { 'margin_16': true }
  readonly margin20: { 'margin_20': true }
  readonly margin24: { 'margin_24': true }
  readonly margin32: { 'margin_32': true }
  readonly margin40: { 'margin_40': true }
  readonly margin48: { 'margin_48': true }
  readonly margin64: { 'margin_64': true }

  // ==================== gap ====================
  readonly gap0: { 'gap_0': true }
  readonly gap2: { 'gap_2': true }
  readonly gap4: { 'gap_4': true }
  readonly gap6: { 'gap_6': true }
  readonly gap8: { 'gap_8': true }
  readonly gap10: { 'gap_10': true }
  readonly gap12: { 'gap_12': true }
  readonly gap16: { 'gap_16': true }
  readonly gap20: { 'gap_20': true }
  readonly gap24: { 'gap_24': true }
  readonly gap32: { 'gap_32': true }

  // ==================== font-size ====================
  readonly fontSizeLarge: { 'font-size_large': true }
  readonly fontSizeLarger: { 'font-size_larger': true }
  readonly fontSizeMedium: { 'font-size_medium': true }
  readonly fontSizeSmall: { 'font-size_small': true }
  readonly fontSizeSmaller: { 'font-size_smaller': true }
  readonly fontSizeXLarge: { 'font-size_x-large': true }
  readonly fontSizeXSmall: { 'font-size_x-small': true }
  readonly fontSizeXxLarge: { 'font-size_xx-large': true }
  readonly fontSizeXxSmall: { 'font-size_xx-small': true }
  readonly fontSizeXxxLarge: { 'font-size_xxx-large': true }
  readonly fontSize10: { 'font-size_10': true }
  readonly fontSize11: { 'font-size_11': true }
  readonly fontSize12: { 'font-size_12': true }
  readonly fontSize13: { 'font-size_13': true }
  readonly fontSize14: { 'font-size_14': true }
  readonly fontSize15: { 'font-size_15': true }
  readonly fontSize16: { 'font-size_16': true }
  readonly fontSize18: { 'font-size_18': true }
  readonly fontSize20: { 'font-size_20': true }
  readonly fontSize24: { 'font-size_24': true }
  readonly fontSize28: { 'font-size_28': true }
  readonly fontSize32: { 'font-size_32': true }
  readonly fontSize36: { 'font-size_36': true }
  readonly fontSize48: { 'font-size_48': true }

  // ==================== font-weight ====================
  readonly fontWeightBold: { 'font-weight_bold': true }
  readonly fontWeightBolder: { 'font-weight_bolder': true }
  readonly fontWeightLighter: { 'font-weight_lighter': true }
  readonly fontWeightNormal: { 'font-weight_normal': true }

  // ==================== font-style ====================
  readonly fontStyleItalic: { 'font-style_italic': true }
  readonly fontStyleNormal: { 'font-style_normal': true }
  readonly fontStyleOblique: { 'font-style_oblique': true }

  // ==================== line-height ====================
  readonly lineHeightNormal: { 'line-height_normal': true }
  readonly lineHeight1: { 'line-height_1': true }
  readonly lineHeight1p25: { 'line-height_1p25': true }
  readonly lineHeight1p5: { 'line-height_1p5': true }
  readonly lineHeight1p75: { 'line-height_1p75': true }
  readonly lineHeight2: { 'line-height_2': true }

  // ==================== text-align ====================
  readonly textAlignCenter: { 'text-align_center': true }
  readonly textAlignEnd: { 'text-align_end': true }
  readonly textAlignJustify: { 'text-align_justify': true }
  readonly textAlignLeft: { 'text-align_left': true }
  readonly textAlignMatchParent: { 'text-align_match-parent': true }
  readonly textAlignRight: { 'text-align_right': true }
  readonly textAlignStart: { 'text-align_start': true }

  // ==================== text-transform ====================
  readonly textTransformCapitalize: { 'text-transform_capitalize': true }
  readonly textTransformFullSizeKana: { 'text-transform_full-size-kana': true }
  readonly textTransformFullWidth: { 'text-transform_full-width': true }
  readonly textTransformLowercase: { 'text-transform_lowercase': true }
  readonly textTransformNone: { 'text-transform_none': true }
  readonly textTransformUppercase: { 'text-transform_uppercase': true }

  // ==================== white-space ====================
  readonly whiteSpaceBreakSpaces: { 'white-space_break-spaces': true }
  readonly whiteSpaceNormal: { 'white-space_normal': true }
  readonly whiteSpaceNowrap: { 'white-space_nowrap': true }
  readonly whiteSpacePre: { 'white-space_pre': true }
  readonly whiteSpacePreLine: { 'white-space_pre-line': true }
  readonly whiteSpacePreWrap: { 'white-space_pre-wrap': true }

  // ==================== word-break ====================
  readonly wordBreakAutoPhrase: { 'word-break_auto-phrase': true }
  readonly wordBreakBreakAll: { 'word-break_break-all': true }
  readonly wordBreakBreakWord: { 'word-break_break-word': true }
  readonly wordBreakKeepAll: { 'word-break_keep-all': true }
  readonly wordBreakNormal: { 'word-break_normal': true }

  // ==================== overflow-wrap ====================
  readonly overflowWrapAnywhere: { 'overflow-wrap_anywhere': true }
  readonly overflowWrapBreakWord: { 'overflow-wrap_break-word': true }
  readonly overflowWrapNormal: { 'overflow-wrap_normal': true }

  // ==================== vertical-align ====================
  readonly verticalAlignBaseline: { 'vertical-align_baseline': true }
  readonly verticalAlignBottom: { 'vertical-align_bottom': true }
  readonly verticalAlignMiddle: { 'vertical-align_middle': true }
  readonly verticalAlignSub: { 'vertical-align_sub': true }
  readonly verticalAlignSuper: { 'vertical-align_super': true }
  readonly verticalAlignTextBottom: { 'vertical-align_text-bottom': true }
  readonly verticalAlignTextTop: { 'vertical-align_text-top': true }
  readonly verticalAlignTop: { 'vertical-align_top': true }

  // ==================== border-style ====================
  readonly borderStyleDashed: { 'border-style_dashed': true }
  readonly borderStyleDotted: { 'border-style_dotted': true }
  readonly borderStyleDouble: { 'border-style_double': true }
  readonly borderStyleGroove: { 'border-style_groove': true }
  readonly borderStyleHidden: { 'border-style_hidden': true }
  readonly borderStyleInset: { 'border-style_inset': true }
  readonly borderStyleNone: { 'border-style_none': true }
  readonly borderStyleOutset: { 'border-style_outset': true }
  readonly borderStyleRidge: { 'border-style_ridge': true }
  readonly borderStyleSolid: { 'border-style_solid': true }

  // ==================== border-radius ====================
  readonly borderRadius0: { 'border-radius_0': true }
  readonly borderRadius2: { 'border-radius_2': true }
  readonly borderRadius4: { 'border-radius_4': true }
  readonly borderRadius6: { 'border-radius_6': true }
  readonly borderRadius8: { 'border-radius_8': true }
  readonly borderRadius12: { 'border-radius_12': true }
  readonly borderRadius16: { 'border-radius_16': true }
  readonly borderRadius9999: { 'border-radius_9999': true }

  // ==================== box-shadow ====================
  readonly boxShadowAccentColor: { 'box-shadow_AccentColor': true }
  readonly boxShadowAccentColorText: { 'box-shadow_AccentColorText': true }
  readonly boxShadowActiveText: { 'box-shadow_ActiveText': true }
  readonly boxShadowButtonBorder: { 'box-shadow_ButtonBorder': true }
  readonly boxShadowButtonFace: { 'box-shadow_ButtonFace': true }
  readonly boxShadowButtonText: { 'box-shadow_ButtonText': true }
  readonly boxShadowCanvas: { 'box-shadow_Canvas': true }
  readonly boxShadowCanvasText: { 'box-shadow_CanvasText': true }
  readonly boxShadowField: { 'box-shadow_Field': true }
  readonly boxShadowFieldText: { 'box-shadow_FieldText': true }
  readonly boxShadowGrayText: { 'box-shadow_GrayText': true }
  readonly boxShadowHighlight: { 'box-shadow_Highlight': true }
  readonly boxShadowHighlightText: { 'box-shadow_HighlightText': true }
  readonly boxShadowLinkText: { 'box-shadow_LinkText': true }
  readonly boxShadowMark: { 'box-shadow_Mark': true }
  readonly boxShadowMarkText: { 'box-shadow_MarkText': true }
  readonly boxShadowSelectedItem: { 'box-shadow_SelectedItem': true }
  readonly boxShadowSelectedItemText: { 'box-shadow_SelectedItemText': true }
  readonly boxShadowVisitedText: { 'box-shadow_VisitedText': true }
  readonly boxShadowA98Rgb: { 'box-shadow_a98-rgb': true }
  readonly boxShadowAliceblue: { 'box-shadow_aliceblue': true }
  readonly boxShadowAntiquewhite: { 'box-shadow_antiquewhite': true }
  readonly boxShadowAqua: { 'box-shadow_aqua': true }
  readonly boxShadowAquamarine: { 'box-shadow_aquamarine': true }
  readonly boxShadowAzure: { 'box-shadow_azure': true }
  readonly boxShadowBeige: { 'box-shadow_beige': true }
  readonly boxShadowBisque: { 'box-shadow_bisque': true }
  readonly boxShadowBlack: { 'box-shadow_black': true }
  readonly boxShadowBlanchedalmond: { 'box-shadow_blanchedalmond': true }
  readonly boxShadowBlue: { 'box-shadow_blue': true }
  readonly boxShadowBlueviolet: { 'box-shadow_blueviolet': true }
  readonly boxShadowBrown: { 'box-shadow_brown': true }
  readonly boxShadowBurlywood: { 'box-shadow_burlywood': true }
  readonly boxShadowCadetblue: { 'box-shadow_cadetblue': true }
  readonly boxShadowChartreuse: { 'box-shadow_chartreuse': true }
  readonly boxShadowChocolate: { 'box-shadow_chocolate': true }
  readonly boxShadowCoral: { 'box-shadow_coral': true }
  readonly boxShadowCornflowerblue: { 'box-shadow_cornflowerblue': true }
  readonly boxShadowCornsilk: { 'box-shadow_cornsilk': true }
  readonly boxShadowCrimson: { 'box-shadow_crimson': true }
  readonly boxShadowCurrentColor: { 'box-shadow_currentColor': true }
  readonly boxShadowCyan: { 'box-shadow_cyan': true }
  readonly boxShadowDarkblue: { 'box-shadow_darkblue': true }
  readonly boxShadowDarkcyan: { 'box-shadow_darkcyan': true }
  readonly boxShadowDarkgoldenrod: { 'box-shadow_darkgoldenrod': true }
  readonly boxShadowDarkgray: { 'box-shadow_darkgray': true }
  readonly boxShadowDarkgreen: { 'box-shadow_darkgreen': true }
  readonly boxShadowDarkgrey: { 'box-shadow_darkgrey': true }
  readonly boxShadowDarkkhaki: { 'box-shadow_darkkhaki': true }
  readonly boxShadowDarkmagenta: { 'box-shadow_darkmagenta': true }
  readonly boxShadowDarkolivegreen: { 'box-shadow_darkolivegreen': true }
  readonly boxShadowDarkorange: { 'box-shadow_darkorange': true }
  readonly boxShadowDarkorchid: { 'box-shadow_darkorchid': true }
  readonly boxShadowDarkred: { 'box-shadow_darkred': true }
  readonly boxShadowDarksalmon: { 'box-shadow_darksalmon': true }
  readonly boxShadowDarkseagreen: { 'box-shadow_darkseagreen': true }
  readonly boxShadowDarkslateblue: { 'box-shadow_darkslateblue': true }
  readonly boxShadowDarkslategray: { 'box-shadow_darkslategray': true }
  readonly boxShadowDarkslategrey: { 'box-shadow_darkslategrey': true }
  readonly boxShadowDarkturquoise: { 'box-shadow_darkturquoise': true }
  readonly boxShadowDarkviolet: { 'box-shadow_darkviolet': true }
  readonly boxShadowDecreasing: { 'box-shadow_decreasing': true }
  readonly boxShadowDeeppink: { 'box-shadow_deeppink': true }
  readonly boxShadowDeepskyblue: { 'box-shadow_deepskyblue': true }
  readonly boxShadowDimgray: { 'box-shadow_dimgray': true }
  readonly boxShadowDimgrey: { 'box-shadow_dimgrey': true }
  readonly boxShadowDisplayP3: { 'box-shadow_display-p3': true }
  readonly boxShadowDodgerblue: { 'box-shadow_dodgerblue': true }
  readonly boxShadowFirebrick: { 'box-shadow_firebrick': true }
  readonly boxShadowFloralwhite: { 'box-shadow_floralwhite': true }
  readonly boxShadowForestgreen: { 'box-shadow_forestgreen': true }
  readonly boxShadowFuchsia: { 'box-shadow_fuchsia': true }
  readonly boxShadowGainsboro: { 'box-shadow_gainsboro': true }
  readonly boxShadowGhostwhite: { 'box-shadow_ghostwhite': true }
  readonly boxShadowGold: { 'box-shadow_gold': true }
  readonly boxShadowGoldenrod: { 'box-shadow_goldenrod': true }
  readonly boxShadowGray: { 'box-shadow_gray': true }
  readonly boxShadowGreen: { 'box-shadow_green': true }
  readonly boxShadowGreenyellow: { 'box-shadow_greenyellow': true }
  readonly boxShadowGrey: { 'box-shadow_grey': true }
  readonly boxShadowHoneydew: { 'box-shadow_honeydew': true }
  readonly boxShadowHotpink: { 'box-shadow_hotpink': true }
  readonly boxShadowHsl: { 'box-shadow_hsl': true }
  readonly boxShadowHue: { 'box-shadow_hue': true }
  readonly boxShadowHwb: { 'box-shadow_hwb': true }
  readonly boxShadowIn: { 'box-shadow_in': true }
  readonly boxShadowIncreasing: { 'box-shadow_increasing': true }
  readonly boxShadowIndianred: { 'box-shadow_indianred': true }
  readonly boxShadowIndigo: { 'box-shadow_indigo': true }
  readonly boxShadowInset: { 'box-shadow_inset': true }
  readonly boxShadowIvory: { 'box-shadow_ivory': true }
  readonly boxShadowKhaki: { 'box-shadow_khaki': true }
  readonly boxShadowLab: { 'box-shadow_lab': true }
  readonly boxShadowLavender: { 'box-shadow_lavender': true }
  readonly boxShadowLavenderblush: { 'box-shadow_lavenderblush': true }
  readonly boxShadowLawngreen: { 'box-shadow_lawngreen': true }
  readonly boxShadowLch: { 'box-shadow_lch': true }
  readonly boxShadowLemonchiffon: { 'box-shadow_lemonchiffon': true }
  readonly boxShadowLightblue: { 'box-shadow_lightblue': true }
  readonly boxShadowLightcoral: { 'box-shadow_lightcoral': true }
  readonly boxShadowLightcyan: { 'box-shadow_lightcyan': true }
  readonly boxShadowLightgoldenrodyellow: { 'box-shadow_lightgoldenrodyellow': true }
  readonly boxShadowLightgray: { 'box-shadow_lightgray': true }
  readonly boxShadowLightgreen: { 'box-shadow_lightgreen': true }
  readonly boxShadowLightgrey: { 'box-shadow_lightgrey': true }
  readonly boxShadowLightpink: { 'box-shadow_lightpink': true }
  readonly boxShadowLightsalmon: { 'box-shadow_lightsalmon': true }
  readonly boxShadowLightseagreen: { 'box-shadow_lightseagreen': true }
  readonly boxShadowLightskyblue: { 'box-shadow_lightskyblue': true }
  readonly boxShadowLightslategray: { 'box-shadow_lightslategray': true }
  readonly boxShadowLightslategrey: { 'box-shadow_lightslategrey': true }
  readonly boxShadowLightsteelblue: { 'box-shadow_lightsteelblue': true }
  readonly boxShadowLightyellow: { 'box-shadow_lightyellow': true }
  readonly boxShadowLime: { 'box-shadow_lime': true }
  readonly boxShadowLimegreen: { 'box-shadow_limegreen': true }
  readonly boxShadowLinen: { 'box-shadow_linen': true }
  readonly boxShadowLonger: { 'box-shadow_longer': true }
  readonly boxShadowMagenta: { 'box-shadow_magenta': true }
  readonly boxShadowMaroon: { 'box-shadow_maroon': true }
  readonly boxShadowMediumaquamarine: { 'box-shadow_mediumaquamarine': true }
  readonly boxShadowMediumblue: { 'box-shadow_mediumblue': true }
  readonly boxShadowMediumorchid: { 'box-shadow_mediumorchid': true }
  readonly boxShadowMediumpurple: { 'box-shadow_mediumpurple': true }
  readonly boxShadowMediumseagreen: { 'box-shadow_mediumseagreen': true }
  readonly boxShadowMediumslateblue: { 'box-shadow_mediumslateblue': true }
  readonly boxShadowMediumspringgreen: { 'box-shadow_mediumspringgreen': true }
  readonly boxShadowMediumturquoise: { 'box-shadow_mediumturquoise': true }
  readonly boxShadowMediumvioletred: { 'box-shadow_mediumvioletred': true }
  readonly boxShadowMidnightblue: { 'box-shadow_midnightblue': true }
  readonly boxShadowMintcream: { 'box-shadow_mintcream': true }
  readonly boxShadowMistyrose: { 'box-shadow_mistyrose': true }
  readonly boxShadowMoccasin: { 'box-shadow_moccasin': true }
  readonly boxShadowNavajowhite: { 'box-shadow_navajowhite': true }
  readonly boxShadowNavy: { 'box-shadow_navy': true }
  readonly boxShadowNone: { 'box-shadow_none': true }
  readonly boxShadowOklab: { 'box-shadow_oklab': true }
  readonly boxShadowOklch: { 'box-shadow_oklch': true }
  readonly boxShadowOldlace: { 'box-shadow_oldlace': true }
  readonly boxShadowOlive: { 'box-shadow_olive': true }
  readonly boxShadowOlivedrab: { 'box-shadow_olivedrab': true }
  readonly boxShadowOrange: { 'box-shadow_orange': true }
  readonly boxShadowOrangered: { 'box-shadow_orangered': true }
  readonly boxShadowOrchid: { 'box-shadow_orchid': true }
  readonly boxShadowPalegoldenrod: { 'box-shadow_palegoldenrod': true }
  readonly boxShadowPalegreen: { 'box-shadow_palegreen': true }
  readonly boxShadowPaleturquoise: { 'box-shadow_paleturquoise': true }
  readonly boxShadowPalevioletred: { 'box-shadow_palevioletred': true }
  readonly boxShadowPapayawhip: { 'box-shadow_papayawhip': true }
  readonly boxShadowPeachpuff: { 'box-shadow_peachpuff': true }
  readonly boxShadowPeru: { 'box-shadow_peru': true }
  readonly boxShadowPink: { 'box-shadow_pink': true }
  readonly boxShadowPlum: { 'box-shadow_plum': true }
  readonly boxShadowPowderblue: { 'box-shadow_powderblue': true }
  readonly boxShadowProphotoRgb: { 'box-shadow_prophoto-rgb': true }
  readonly boxShadowPurple: { 'box-shadow_purple': true }
  readonly boxShadowRebeccapurple: { 'box-shadow_rebeccapurple': true }
  readonly boxShadowRec2020: { 'box-shadow_rec2020': true }
  readonly boxShadowRed: { 'box-shadow_red': true }
  readonly boxShadowRosybrown: { 'box-shadow_rosybrown': true }
  readonly boxShadowRoyalblue: { 'box-shadow_royalblue': true }
  readonly boxShadowSaddlebrown: { 'box-shadow_saddlebrown': true }
  readonly boxShadowSalmon: { 'box-shadow_salmon': true }
  readonly boxShadowSandybrown: { 'box-shadow_sandybrown': true }
  readonly boxShadowSeagreen: { 'box-shadow_seagreen': true }
  readonly boxShadowSeashell: { 'box-shadow_seashell': true }
  readonly boxShadowShorter: { 'box-shadow_shorter': true }
  readonly boxShadowSienna: { 'box-shadow_sienna': true }
  readonly boxShadowSilver: { 'box-shadow_silver': true }
  readonly boxShadowSkyblue: { 'box-shadow_skyblue': true }
  readonly boxShadowSlateblue: { 'box-shadow_slateblue': true }
  readonly boxShadowSlategray: { 'box-shadow_slategray': true }
  readonly boxShadowSlategrey: { 'box-shadow_slategrey': true }
  readonly boxShadowSnow: { 'box-shadow_snow': true }
  readonly boxShadowSpringgreen: { 'box-shadow_springgreen': true }
  readonly boxShadowSrgb: { 'box-shadow_srgb': true }
  readonly boxShadowSrgbLinear: { 'box-shadow_srgb-linear': true }
  readonly boxShadowSteelblue: { 'box-shadow_steelblue': true }
  readonly boxShadowTan: { 'box-shadow_tan': true }
  readonly boxShadowTeal: { 'box-shadow_teal': true }
  readonly boxShadowThistle: { 'box-shadow_thistle': true }
  readonly boxShadowTomato: { 'box-shadow_tomato': true }
  readonly boxShadowTransparent: { 'box-shadow_transparent': true }
  readonly boxShadowTurquoise: { 'box-shadow_turquoise': true }
  readonly boxShadowViolet: { 'box-shadow_violet': true }
  readonly boxShadowWheat: { 'box-shadow_wheat': true }
  readonly boxShadowWhite: { 'box-shadow_white': true }
  readonly boxShadowWhitesmoke: { 'box-shadow_whitesmoke': true }
  readonly boxShadowXyz: { 'box-shadow_xyz': true }
  readonly boxShadowXyzD50: { 'box-shadow_xyz-d50': true }
  readonly boxShadowXyzD65: { 'box-shadow_xyz-d65': true }
  readonly boxShadowYellow: { 'box-shadow_yellow': true }
  readonly boxShadowYellowgreen: { 'box-shadow_yellowgreen': true }

  // ==================== opacity ====================
  readonly opacity0: { 'opacity_0': true }
  readonly opacity0p25: { 'opacity_0p25': true }
  readonly opacity0p5: { 'opacity_0p5': true }
  readonly opacity0p75: { 'opacity_0p75': true }
  readonly opacity1: { 'opacity_1': true }

  // ==================== visibility ====================
  readonly visibilityCollapse: { 'visibility_collapse': true }
  readonly visibilityHidden: { 'visibility_hidden': true }
  readonly visibilityVisible: { 'visibility_visible': true }

  // ==================== overflow ====================
  readonly overflowAuto: { 'overflow_auto': true }
  readonly overflowClip: { 'overflow_clip': true }
  readonly overflowHidden: { 'overflow_hidden': true }
  readonly overflowOverlay: { 'overflow_overlay': true }
  readonly overflowScroll: { 'overflow_scroll': true }
  readonly overflowVisible: { 'overflow_visible': true }

  // ==================== overflow-x ====================
  readonly overflowXAuto: { 'overflow-x_auto': true }
  readonly overflowXClip: { 'overflow-x_clip': true }
  readonly overflowXHidden: { 'overflow-x_hidden': true }
  readonly overflowXScroll: { 'overflow-x_scroll': true }
  readonly overflowXVisible: { 'overflow-x_visible': true }

  // ==================== overflow-y ====================
  readonly overflowYAuto: { 'overflow-y_auto': true }
  readonly overflowYClip: { 'overflow-y_clip': true }
  readonly overflowYHidden: { 'overflow-y_hidden': true }
  readonly overflowYScroll: { 'overflow-y_scroll': true }
  readonly overflowYVisible: { 'overflow-y_visible': true }

  // ==================== cursor ====================
  readonly cursorAlias: { 'cursor_alias': true }
  readonly cursorAllScroll: { 'cursor_all-scroll': true }
  readonly cursorAuto: { 'cursor_auto': true }
  readonly cursorCell: { 'cursor_cell': true }
  readonly cursorColResize: { 'cursor_col-resize': true }
  readonly cursorContextMenu: { 'cursor_context-menu': true }
  readonly cursorCopy: { 'cursor_copy': true }
  readonly cursorCrosshair: { 'cursor_crosshair': true }
  readonly cursorDefault: { 'cursor_default': true }
  readonly cursorEResize: { 'cursor_e-resize': true }
  readonly cursorEwResize: { 'cursor_ew-resize': true }
  readonly cursorGrab: { 'cursor_grab': true }
  readonly cursorGrabbing: { 'cursor_grabbing': true }
  readonly cursorHand: { 'cursor_hand': true }
  readonly cursorHelp: { 'cursor_help': true }
  readonly cursorMove: { 'cursor_move': true }
  readonly cursorNResize: { 'cursor_n-resize': true }
  readonly cursorNeResize: { 'cursor_ne-resize': true }
  readonly cursorNeswResize: { 'cursor_nesw-resize': true }
  readonly cursorNoDrop: { 'cursor_no-drop': true }
  readonly cursorNone: { 'cursor_none': true }
  readonly cursorNotAllowed: { 'cursor_not-allowed': true }
  readonly cursorNsResize: { 'cursor_ns-resize': true }
  readonly cursorNwResize: { 'cursor_nw-resize': true }
  readonly cursorNwseResize: { 'cursor_nwse-resize': true }
  readonly cursorPointer: { 'cursor_pointer': true }
  readonly cursorProgress: { 'cursor_progress': true }
  readonly cursorRowResize: { 'cursor_row-resize': true }
  readonly cursorSResize: { 'cursor_s-resize': true }
  readonly cursorSeResize: { 'cursor_se-resize': true }
  readonly cursorSwResize: { 'cursor_sw-resize': true }
  readonly cursorText: { 'cursor_text': true }
  readonly cursorVerticalText: { 'cursor_vertical-text': true }
  readonly cursorWResize: { 'cursor_w-resize': true }
  readonly cursorWait: { 'cursor_wait': true }
  readonly cursorZoomIn: { 'cursor_zoom-in': true }
  readonly cursorZoomOut: { 'cursor_zoom-out': true }

  // ==================== pointer-events ====================
  readonly pointerEventsAll: { 'pointer-events_all': true }
  readonly pointerEventsAuto: { 'pointer-events_auto': true }
  readonly pointerEventsFill: { 'pointer-events_fill': true }
  readonly pointerEventsInherit: { 'pointer-events_inherit': true }
  readonly pointerEventsNone: { 'pointer-events_none': true }
  readonly pointerEventsPainted: { 'pointer-events_painted': true }
  readonly pointerEventsStroke: { 'pointer-events_stroke': true }
  readonly pointerEventsVisible: { 'pointer-events_visible': true }
  readonly pointerEventsVisibleFill: { 'pointer-events_visibleFill': true }
  readonly pointerEventsVisiblePainted: { 'pointer-events_visiblePainted': true }
  readonly pointerEventsVisibleStroke: { 'pointer-events_visibleStroke': true }

  // ==================== user-select ====================
  readonly userSelectAll: { 'user-select_all': true }
  readonly userSelectAuto: { 'user-select_auto': true }
  readonly userSelectContain: { 'user-select_contain': true }
  readonly userSelectNone: { 'user-select_none': true }
  readonly userSelectText: { 'user-select_text': true }

  // ==================== z-index ====================
  readonly zIndexAuto: { 'z-index_auto': true }
  readonly zIndex0: { 'z-index_0': true }
  readonly zIndex10: { 'z-index_10': true }
  readonly zIndex20: { 'z-index_20': true }
  readonly zIndex30: { 'z-index_30': true }
  readonly zIndex40: { 'z-index_40': true }
  readonly zIndex50: { 'z-index_50': true }
  readonly zIndex100: { 'z-index_100': true }
  readonly zIndex999: { 'z-index_999': true }
  readonly zIndex9999: { 'z-index_9999': true }

  // ==================== state ====================
  readonly isDisabled: { 'is-disabled': true }
  readonly isLoading: { 'is-loading': true }
  readonly isActive: { 'is-active': true }
  readonly isFocus: { 'is-focus': true }
  readonly isHover: { 'is-hover': true }
  readonly isSelected: { 'is-selected': true }
  readonly isError: { 'is-error': true }
  readonly isSuccess: { 'is-success': true }
  readonly isWarning: { 'is-warning': true }

  // 允许任意其他原子类
  readonly [key: string]: { [className: string]: true }
}