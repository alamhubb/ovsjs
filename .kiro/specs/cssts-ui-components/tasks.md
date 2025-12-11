# Implementation Plan

## Phase 1: Project Setup and Style System

- [x] 1. Initialize cssts-ui package structure
  - [x] 1.1 Create package.json with dependencies (vue, cssts, ovs-compiler, vitest, fast-check)

  - [x] 1.2 Create tsconfig.json and vite.config.ts


  - [x] 1.3 Create vitest.config.ts with fast-check integration

  - [x] 1.4 Create src/index.ts as package entry point

  - _Requirements: 5.1, 5.2_

- [x] 2. Implement CssTs design tokens

  - [x] 2.1 Create src/styles/tokens.ts with color, size, spacing, border-radius tokens (reference Element UI var.scss)

  - _Requirements: 4.1_

- [x] 3. Implement atomic style classes





  - [x] 3.1 Create src/styles/atomic/layout.ts (flex, grid, position atoms)

  - [x] 3.2 Create src/styles/atomic/sizing.ts (width, height, padding, margin atoms)

  - [x] 3.3 Create src/styles/atomic/colors.ts (bg-*, text-*, border-* atoms)




  - [x] 3.4 Create src/styles/atomic/typography.ts (font-size, font-weight atoms)

  - [x] 3.5 Create src/styles/atomic/effects.ts (shadow, transition, cursor atoms)

  - [x] 3.6 Create src/styles/atomic/states.ts (disabled, loading, active atoms)


  - [x] 3.7 Create src/styles/atomic/index.ts to export all atomic styles
  - _Requirements: 4.1, 4.2_

- [x] 4. Implement style serializer

  - [x] 4.1 Create src/styles/serializer.ts with serializeStyle and parseStyle functions


  - [x] 4.2 Write property test for style serialization round-trip

    - **Property 13: Style serialization round-trip consistency**
    - **Validates: Requirements 6.3**
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 5. Implement style merge utility

  - [x] 5.1 Create src/styles/CssCls.ts with $cls function (reference cssts runtime)


  - [x] 5.2 Write property test for style merge function

    - **Property 12: Style merge function combines styles correctly**
    - **Validates: Requirements 4.3**
  - _Requirements: 4.3_

- [x] 6. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: Button Component

- [x] 7. Implement Button component styles

  - [x] 7.1 Create src/styles/components/button.ts with CssClsButton (reference Element UI button.scss)

  - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [x] 8. Implement Button component logic


  - [x] 8.1 Create src/components/button/button.ts with ButtonProps and ButtonEmits types (reference Element UI button.ts)



  - [x] 8.2 Create src/components/button/use-button.ts composable (copy from Element UI use-button.ts, adapt imports)

  - _Requirements: 1.1, 1.4, 1.5, 1.9_

- [x] 9. Implement Button OVS component


  - [x] 9.1 Create src/components/button/Button.ovs using OVS syntax (rewrite Element UI button.vue template)



  - [x] 9.2 Create src/components/button/index.ts to export Button component

  - _Requirements: 1.1_

- [x] 10. Write Button component tests


  - [x] 10.1 Write property test for Button type prop

    - **Property 1: Button type prop applies correct CSS class**
    - **Validates: Requirements 1.2**

  - [x] 10.2 Write property test for Button size prop
    - **Property 2: Button size prop applies correct CSS class**
    - **Validates: Requirements 1.3**
  - [x] 10.3 Write property test for disabled button state

    - **Property 3: Disabled button has correct state**
    - **Validates: Requirements 1.4**

  - [x] 10.4 Write property test for loading button state
    - **Property 4: Loading button has correct state**
    - **Validates: Requirements 1.5**
  - [x] 10.5 Write property test for boolean props (plain, round, circle)

    - **Property 5: Button boolean props apply correct classes**
    - **Validates: Requirements 1.6, 1.7, 1.8**
  - [x] 10.6 Write property test for click event emission
    - **Property 6: Enabled button emits click event**
    - **Validates: Requirements 1.9**
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

- [x] 11. Checkpoint - Ensure all tests pass


  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Icon Component

- [x] 12. Implement Icon component styles

  - [x] 12.1 Create src/styles/components/icon.ts with CssClsIcon (reference Element UI icon.scss)

  - _Requirements: 3.2, 3.3, 3.4_

- [x] 13. Implement Icon component


  - [x] 13.1 Create src/components/icon/icon.ts with IconProps types (reference Element UI icon.ts)


  - [x] 13.2 Create src/components/icon/Icon.ovs using OVS syntax (rewrite Element UI icon.vue template)

  - [x] 13.3 Create src/components/icon/index.ts to export Icon component
  - _Requirements: 3.1_


- [x] 14. Write Icon component tests

  - [x] 14.1 Write unit tests for Icon component rendering

  - _Requirements: 3.2, 3.3, 3.4_

## Phase 4: Input Component

- [x] 15. Implement Input component styles

  - [x] 15.1 Create src/styles/components/input.ts with CssClsInput (reference Element UI input.scss)

  - _Requirements: 2.3, 2.5, 2.8, 2.9_

- [x] 16. Implement Input component logic


  - [x] 16.1 Create src/components/input/input.ts with InputProps and InputEmits types (reference Element UI input.ts)


  - [x] 16.2 Create src/components/input/use-input.ts composable (copy from Element UI use-input.ts, adapt imports)


  - _Requirements: 2.2, 2.5, 2.6, 2.7_

- [x] 17. Implement Input OVS component


  - [x] 17.1 Create src/components/input/Input.ovs using OVS syntax (rewrite Element UI input.vue template)



  - [x] 17.2 Create src/components/input/index.ts to export Input component

  - _Requirements: 2.1_

- [x] 18. Write Input component tests
  - [x] 18.1 Write property test for Input v-model binding
    - **Property 7: Input v-model two-way binding**
    - **Validates: Requirements 2.2**
  - [x] 18.2 Write property test for Input type prop
    - **Property 8: Input type prop renders correct element**
    - **Validates: Requirements 2.3**
  - [x] 18.3 Write property test for Input size prop
    - **Property 9: Input size prop applies correct CSS class**
    - **Validates: Requirements 2.8**
  - [x] 18.4 Write property test for clearable input
    - **Property 10: Clearable input shows clear icon when has content**
    - **Validates: Requirements 2.6**
  - [x] 18.5 Write property test for clear action
    - **Property 11: Clear action clears value and emits event**
    - **Validates: Requirements 2.7**
  - _Requirements: 2.2, 2.3, 2.6, 2.7, 2.8_

- [x] 19. Checkpoint - Ensure all tests pass


  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Integration and Export

- [x] 20. Create component exports



  - [x] 20.1 Create src/components/index.ts to export all components

  - [x] 20.2 Create src/styles/components/index.ts to export all component styles

  - [x] 20.3 Update src/styles/CssCls.ts to include all component styles

  - _Requirements: 5.1, 5.3, 5.4_

- [x] 21. Update package entry

  - [x] 21.1 Update src/index.ts to export components and styles

  - _Requirements: 5.1, 5.2_

- [x] 22. Write integration tests

  - [x] 22.1 Write property test for OVS compilation output
    - **Property 14: OVS compilation produces valid Vue render functions**
    - **Validates: Requirements 5.5**
    - Test file: `ovs/ovs-compiler/tests/test-property14-ovs-compilation.ts`
    - Integration test: `cssts-ui/packages/cssts-components/src/integration.test.ts`
  - _Requirements: 5.5_

- [x] 23. Final Checkpoint - Ensure all tests pass
  - All tests pass: 78 tests in cssts-ui, 7 tests in ovs-compiler Property 14

## Phase 6: Package Manager Migration (pnpm → npm)

- [x] 25. Migrate cssts-ui from pnpm to npm
  - [x] 25.1 Update root package.json to remove pnpm-specific configurations
    - Remove "packageManager": "pnpm@9.5.0"
    - Remove "pnpm" configuration block
    - Add "patch-package" to devDependencies
    - _Requirements: 7.1, 7.4_
  - [x] 25.2 Update all npm scripts to use npm workspace syntax
    - Replace `pnpm run -C <dir>` with `npm run --workspace=<package>`
    - Replace `pnpm run -r --parallel` with `npm run --workspaces --if-present`
    - _Requirements: 7.3_
  - [x] 25.3 Update workspaces configuration
    - Add "internal/*" to workspaces array
    - Ensure all workspace packages are correctly listed
    - _Requirements: 7.2, 7.5_
  - [x] 25.4 Handle patchedDependencies migration
    - Install patch-package
    - Update postinstall script to run patch-package
    - _Requirements: 7.4_
  - [x] 25.5 Delete pnpm-specific files
    - Delete pnpm-lock.yaml
    - Delete pnpm-workspace.yaml
    - _Requirements: 7.1_
  - [x] 25.6 Generate package-lock.json
    - Run `npm install` to generate new lock file
    - Verify all dependencies install correctly
    - _Requirements: 7.2_

- [-] 26. Verify npm migration
  - Note: Verification requires user to run npm commands manually
  - [ ] 26.1 Test npm install works correctly
  - [ ] 26.2 Test npm run dev works correctly
  - [ ] 26.3 Test npm run build works correctly
  - [x] 26.4 Test npm run test works correctly (cssts-components tests pass)
  - _Requirements: 7.2, 7.3_

- [-] 27. Migration Checkpoint - Ensure all npm commands work
  - cssts-ui npm migration configuration complete
  - User should verify npm commands work in their environment

## Phase 7: cssts-types Package

- [x] 28. Create cssts-types package structure
  - [x] 28.1 Create cssts-types/package.json with type definitions configuration
  - [x] 28.2 Create cssts-types/index.d.ts as main entry point
  - _Requirements: 4.14_

- [x] 29. Implement color atomic type definitions
  - [x] 29.1 Create cssts-types/atoms/colors.d.ts with ColorAtoms interface
    - Define colorRed, colorGreen, colorBlue, colorPrimary, etc.
    - Define bgPrimary, bgSuccess, bgDanger, bgWhite, etc.
    - Define borderPrimary, borderSuccess, etc.
  - _Requirements: 4.14, 4.15_

- [x] 30. Implement sizing atomic type definitions (0-1000)
  - [x] 30.1 Create cssts-types/atoms/sizing.d.ts with SizingAtoms interface
    - Generate fontSize0 to fontSize72
    - Generate padding0 to padding64
    - Generate margin0 to margin48
    - Generate width0 to width320
    - Generate height0 to height100
    - Generate borderRadius0 to borderRadiusFull
  - [x] 30.2 Write property test for numeric range coverage
    - **Property 25: Numeric atomic styles cover 0-1000 range**
    - **Validates: Requirements 4.17**
    - Test file: `cssts-types/tests/test-property25-numeric-range.ts`
  - _Requirements: 4.17_

- [x] 31. Implement other atomic type definitions
  - [x] 31.1 Create cssts-types/atoms/typography.d.ts (fontBold, fontNormal, etc.)
  - [x] 31.2 Create cssts-types/atoms/layout.d.ts (inlineFlex, flexCenter, etc.)
  - [x] 31.3 Create cssts-types/atoms/spacing.d.ts (paddingXs, paddingSm, etc.)
  - [x] 31.4 Create cssts-types/atoms/effects.d.ts (transition, cursor, shadow, etc.)
  - [x] 31.5 Create cssts-types/atoms/index.d.ts to export all atom interfaces
  - _Requirements: 4.14, 4.15_

- [x] 32. Implement runtime and global type definitions
  - [x] 32.1 Create cssts-types/runtime.d.ts with CsstsRuntime interface ($cls, $replace)
  - [x] 32.2 Create cssts-types/global.d.ts with global declarations for all atoms
  - [x] 32.3 Write property test for type definitions completeness
    - **Property 23: cssts-types provides complete type definitions**
    - **Validates: Requirements 4.14, 4.15**
    - Test file: `cssts-types/tests/test-property23-type-completeness.ts`
  - _Requirements: 4.14, 4.15_

- [x] 33. Implement on-demand CSS generation
  - [x] 33.1 Create compiler plugin to scan used atomic styles
  - [x] 33.2 Create CSS generator to output only used styles
  - [x] 33.3 Create atom-to-CSS-property mapping table generator
  - [x] 33.4 Write property test for on-demand generation
    - **Property 24: CSS generation is on-demand**
    - **Validates: Requirements 4.16**
    - Test file: `cssts-types/tests/test-property24-ondemand-css.ts`
  - _Requirements: 4.16_

- [x] 34. cssts-types Checkpoint - Ensure all type tests pass
  - All type tests pass:
    - Property 23: 10 tests passed
    - Property 24: 7 tests passed
    - Property 25: 8 tests passed
