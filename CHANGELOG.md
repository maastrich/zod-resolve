# @maastrich/zod-resolve

## 0.2.0

### Minor Changes

- Initial release of @maastrich/zod-resolve

  Features:
  - Type-safe Zod schema resolver using path notation
  - Support for nested objects with dot notation (e.g., `user.profile.name`)
  - Array element access using `[]` notation (e.g., `items[]`)
  - Tuple element access using index notation (e.g., `coordinates[0]`)
  - Union type support - access fields from all union branches
  - Automatic unwrapping of optional, nullable wrappers for path traversal
  - `resolve()` function to get sub-schemas by path
  - `flatten()` function to get all accessible paths in a schema
  - Full TypeScript type safety with autocomplete support
