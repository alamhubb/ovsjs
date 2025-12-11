# Requirements Document

## Introduction

本项目旨在使用 OVS (Object View Syntax) 和 CssTs 语法重写 Element UI 的基础组件。OVS 是一种基于 JavaScript 的 DSL，用于声明式地构建 Vue 组件视图；CssTs 是一种类型安全的 CSS 类管理方案。通过重写几个核心基础组件，验证 OVS + CssTs 技术栈在组件库开发中的可行性。

## Glossary

- **OVS (Object View Syntax)**: 一种基于 JavaScript 的视图 DSL，使用 `tag({ props }) { children }` 语法声明 UI 结构
- **CssTs**: 类型安全的 CSS 类管理方案，通过 `CssCls.styleName` 形式引用样式
- **cssts.$cls()**: CssTs 运行时函数，用于合并多个样式类
- **view**: OVS 中定义子组件的软关键字
- **Element UI**: 基于 Vue 的 UI 组件库，本项目参考其组件逻辑
- **cssts-ui**: 使用 OVS + CssTs 重写的组件库

## Requirements

### Requirement 1: Button 组件

**User Story:** As a developer, I want to use a Button component with OVS syntax, so that I can create interactive buttons with type-safe styling.

#### Acceptance Criteria

1. WHEN a developer imports the Button component THEN the cssts-ui SHALL export a functional Button component written in OVS syntax
2. WHEN a developer sets the `type` prop to "primary", "success", "warning", "danger", or "info" THEN the Button SHALL display the corresponding visual style
3. WHEN a developer sets the `size` prop to "large", "default", or "small" THEN the Button SHALL render with the corresponding dimensions
4. WHEN a developer sets the `disabled` prop to true THEN the Button SHALL appear visually disabled and ignore click events
5. WHEN a developer sets the `loading` prop to true THEN the Button SHALL display a loading indicator and disable interactions
6. WHEN a developer sets the `plain` prop to true THEN the Button SHALL render with a plain/outlined style variant
7. WHEN a developer sets the `round` prop to true THEN the Button SHALL render with fully rounded corners
8. WHEN a developer sets the `circle` prop to true THEN the Button SHALL render as a circular button
9. WHEN a developer clicks an enabled Button THEN the Button SHALL emit a click event with the native event object

### Requirement 2: Input 组件

**User Story:** As a developer, I want to use an Input component with OVS syntax, so that I can create text input fields with type-safe styling.

#### Acceptance Criteria

1. WHEN a developer imports the Input component THEN the cssts-ui SHALL export a functional Input component written in OVS syntax
2. WHEN a developer binds a value using v-model THEN the Input SHALL support two-way data binding
3. WHEN a developer sets the `type` prop to "text", "password", "textarea", or "number" THEN the Input SHALL render the corresponding input type
4. WHEN a developer sets the `placeholder` prop THEN the Input SHALL display the placeholder text when empty
5. WHEN a developer sets the `disabled` prop to true THEN the Input SHALL appear visually disabled and prevent user input
6. WHEN a developer sets the `clearable` prop to true THEN the Input SHALL display a clear icon when the input has content
7. WHEN a developer clicks the clear icon THEN the Input SHALL clear the input value and emit an update event
8. WHEN a developer sets the `size` prop to "large", "default", or "small" THEN the Input SHALL render with the corresponding dimensions
9. WHEN a developer provides `prefix` or `suffix` slot content THEN the Input SHALL render the content in the appropriate position

### Requirement 3: Icon 组件

**User Story:** As a developer, I want to use an Icon component with OVS syntax, so that I can display icons with consistent styling.

#### Acceptance Criteria

1. WHEN a developer imports the Icon component THEN the cssts-ui SHALL export a functional Icon component written in OVS syntax
2. WHEN a developer passes an icon component as a child THEN the Icon SHALL render the icon with proper sizing
3. WHEN a developer sets the `size` prop THEN the Icon SHALL render at the specified size
4. WHEN a developer sets the `color` prop THEN the Icon SHALL render with the specified color

### Requirement 4: CssTs 样式系统

**User Story:** As a developer, I want a type-safe CSS class system for cssts-ui components, so that I can have IntelliSense support and compile-time checking.

#### Acceptance Criteria

1. WHEN a developer imports CssCls from cssts-ui THEN the system SHALL provide a typed object containing all component styles
2. WHEN a developer uses CssCls.buttonPrimary THEN the system SHALL apply the correct CSS classes for a primary button
3. WHEN a developer combines multiple styles using `css { a, b, c }` syntax THEN the system SHALL merge the styles correctly
4. WHEN a developer hovers over a CssCls property THEN the IDE SHALL display type information and available options
5. WHEN the CssTs styles are compiled THEN the system SHALL generate corresponding CSS with the correct class names
6. WHEN a developer uses `obj.cssProperty = css newAtom` syntax THEN the system SHALL replace the CSS property value in the style object
7. WHEN a developer uses `obj = css { newStyles }` syntax THEN the system SHALL completely replace the style object
8. WHEN a developer defines atomic styles THEN the system SHALL support reusing atoms across multiple composite styles
9. WHEN a developer creates composite styles THEN the system SHALL support inheriting and extending from base styles
10. WHEN a developer defines custom property names in style composition THEN the system SHALL support replacing values by custom property names
11. WHEN a developer uses `obj.customProperty = css newAtom` syntax THEN the system SHALL replace the custom property value in the style object
12. WHEN a developer uses `obj.atomName = css newAtom` syntax (where atomName is an existing atom in the object) THEN the system SHALL find the CSS property of that atom and replace it
13. WHEN the compiler processes atom definitions THEN the system SHALL maintain a mapping table from atom names to their corresponding CSS properties
14. WHEN a developer installs cssts-types package THEN the system SHALL provide TypeScript type definitions for all atomic styles
15. WHEN a developer uses atomic styles in css {} syntax THEN the IDE SHALL provide intelligent code completion based on cssts-types declarations
16. WHEN the compiler detects atomic style usage THEN the system SHALL automatically generate corresponding CSS rules (only for used atoms)
17. WHEN generating numeric atomic styles (fontSize, padding, margin, width, height) THEN the system SHALL generate values from 0 to 1000

### Requirement 5: 组件导出和注册

**User Story:** As a developer, I want to easily import and use cssts-ui components in any Vue project, so that I can integrate them regardless of whether I use OVS or standard Vue SFC.

#### Acceptance Criteria

1. WHEN a developer imports from 'cssts-ui' THEN the package SHALL export all components as named exports
2. WHEN a developer imports a single component THEN the package SHALL support tree-shaking for optimal bundle size
3. WHEN a developer uses a component in a Vue SFC template THEN the component SHALL work as a standard Vue component (because OVS compiles to h() functions)
4. WHEN a developer uses a component in an OVS file THEN the component SHALL work seamlessly with OVS syntax
5. WHEN the OVS source is compiled THEN the output SHALL be standard Vue render functions using h() that work in any Vue 3 application

### Requirement 6: 组件样式打印器

**User Story:** As a developer, I want to be able to serialize and deserialize component styles, so that I can debug and test the styling system.

#### Acceptance Criteria

1. WHEN a CssCls style object is serialized THEN the system SHALL produce a consistent string representation
2. WHEN a serialized style string is parsed THEN the system SHALL reconstruct the original style object
3. WHEN serializing and then parsing a style object THEN the system SHALL produce an equivalent object (round-trip consistency)

### Requirement 7: 包管理器迁移 (pnpm → npm)

**User Story:** As a developer, I want cssts-ui to use npm instead of pnpm, so that I can use a more widely adopted package manager without additional tooling requirements.

#### Acceptance Criteria

1. WHEN a developer clones the cssts-ui repository THEN the project SHALL use npm as the package manager
2. WHEN a developer runs `npm install` THEN the system SHALL install all dependencies correctly using npm workspaces
3. WHEN a developer runs npm scripts THEN all build, test, and dev scripts SHALL execute correctly with npm
4. WHEN the project is configured THEN the package.json SHALL remove pnpm-specific configurations and use npm equivalents
5. WHEN the project uses workspace dependencies THEN the system SHALL use npm workspace protocol (workspace:*) correctly

### Requirement 8: 设计指南文档

**User Story:** As a designer or developer, I want comprehensive design guidelines documentation, so that I can understand and follow the design principles when building UI components.

#### Acceptance Criteria

1. WHEN a user views the design guide THEN the documentation SHALL display the four core design principles: Consistency, Feedback, Efficiency, and Controllability
2. WHEN a user reads the Consistency section THEN the documentation SHALL explain real-life consistency and interface consistency
3. WHEN a user reads the Feedback section THEN the documentation SHALL explain operation feedback and visual feedback
4. WHEN a user reads the Efficiency section THEN the documentation SHALL explain process simplification, clarity, and easy identification
5. WHEN a user reads the Controllability section THEN the documentation SHALL explain decision making and controlled consequences

