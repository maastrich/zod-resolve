# How to Publish

This guide explains how to publish new versions of `@maastrich/zod-resolve` to npm.

## Prerequisites

Before publishing, ensure you have:

1. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com/)
2. **npm Authentication**: Login locally with `npm login`
3. **Repository Access**: Write access to the GitHub repository
4. **NPM_TOKEN Secret**: Set up in GitHub repository settings (for automated releases)

## Publishing Workflow

This project uses [Changesets](https://github.com/changesets/changesets) for version management and changelog generation.

### Step 1: Create a Changeset

When you make changes that should be included in the next release:

```bash
pnpm changeset
```

This interactive CLI will ask you:
1. **Which packages to bump?** - Select `@maastrich/zod-resolve`
2. **What type of change?** - Choose:
   - `major` - Breaking changes (1.0.0 → 2.0.0)
   - `minor` - New features, backwards compatible (1.0.0 → 1.1.0)
   - `patch` - Bug fixes, backwards compatible (1.0.0 → 1.0.1)
3. **Summary** - Describe the changes

This creates a markdown file in `.changeset/` describing your changes.

**Example:**
```bash
pnpm changeset
# Select: @maastrich/zod-resolve
# Select: minor (new feature)
# Summary: "Add support for recursive schema resolution"
```

### Step 2: Commit the Changeset

Commit the generated changeset file:

```bash
git add .changeset/*.md
git commit -m "feat: add support for recursive schema resolution"
git push
```

The CI workflow will run to ensure all checks pass.

### Step 3: Version and Release

When you're ready to publish, update the version and create a git tag:

```bash
# 1. Run version command to consume changesets
pnpm version

# This will:
# - Update package.json version
# - Generate/update CHANGELOG.md
# - Delete consumed changeset files
```

**Review the changes:**
```bash
git status
git diff
```

### Step 4: Commit and Tag

```bash
# 1. Commit the version changes
git add .
git commit -m "chore: release v1.2.3"

# 2. Create and push the tag
git tag v1.2.3
git push origin main --tags
```

### Step 5: Automated Release

Once the tag is pushed, GitHub Actions automatically:

1. ✅ **Runs all quality checks**:
   - Tests (Bun)
   - Format check
   - Type check
   - Lint (Knip + Sherif + Oxlint)
   - Build

2. ✅ **Publishes to npm**:
   - Runs `pnpm publish` with the built package
   - Uses `NPM_TOKEN` for authentication

3. ✅ **Creates GitHub Release**:
   - Generates release notes from commits
   - Links to CHANGELOG
   - Adds installation instructions

**This is the recommended approach** - it's automated, safe, and maintains a clear release history.

## Alternative: Manual Publishing

If you need to publish manually (not recommended):

```bash
# 1. Update versions
pnpm version

# 2. Build
pnpm run build

# 3. Publish (requires NPM_TOKEN)
pnpm publish --access public

# 4. Create tag and push
git tag v1.2.3
git push origin main --tags
```

## Release Types

### Patch Release (Bug Fixes)

```bash
pnpm changeset
# Select: patch
# Example: "Fix array traversal edge case"
```

Bumps: `1.0.0` → `1.0.1`

### Minor Release (New Features)

```bash
pnpm changeset
# Select: minor
# Example: "Add support for Map and Set schemas"
```

Bumps: `1.0.0` → `1.1.0`

### Major Release (Breaking Changes)

```bash
pnpm changeset
# Select: major
# Example: "Remove deprecated flatten() options"
```

Bumps: `1.0.0` → `2.0.0`

## GitHub Actions Setup

### Required Secrets

Add these secrets to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add new repository secret:
   - **Name:** `NPM_TOKEN`
   - **Value:** Your npm automation token

**To create an npm token:**
```bash
npm login
npm token create --type=automation
# Copy the token and add it to GitHub secrets
```

### Workflows

**CI Workflow (`.github/workflows/ci.yml`)**
- **Runs on:** Pull requests and pushes to `main`
- **Checks:** Tests, format, lint, type-check, build
- **Purpose:** Ensure code quality before merge

**Release Workflow (`.github/workflows/release.yml`)**
- **Runs on:** Git tags matching `v*.*.*` pattern
- **Actions:**
  - Runs all quality checks
  - Publishes to npm
  - Creates GitHub release with auto-generated notes

## Pre-Release Checklist

Before creating a release tag, ensure:

- [ ] All changesets are created for merged features
- [ ] All tests pass locally (`pnpm test`)
- [ ] Code is formatted (`pnpm run format`)
- [ ] No linting errors (`pnpm run lint`)
- [ ] Type checking passes (`pnpm run type-check`)
- [ ] Build succeeds (`pnpm run build`)
- [ ] Documentation is updated
- [ ] You've run `pnpm version` to update versions
- [ ] CHANGELOG.md looks correct

## Complete Release Example

Here's a full example of releasing version 1.2.0:

```bash
# 1. You've already created changesets during development
# 2. Ready to release

# Update versions and generate CHANGELOG
pnpm version

# Review changes
git status
cat CHANGELOG.md

# Commit version bump
git add .
git commit -m "chore: release v1.2.0"
git push origin main

# Create and push tag
git tag v1.2.0
git push origin v1.2.0

# GitHub Actions will automatically:
# - Run all checks
# - Publish to npm
# - Create GitHub release

# Wait ~2-3 minutes, then verify:
# - https://www.npmjs.com/package/@maastrich/zod-resolve
# - https://github.com/maastrich/zod-resolve/releases
```

## Troubleshooting

### "Cannot publish over existing version"

The version already exists on npm. You need to bump the version:
```bash
pnpm version
# Make sure package.json version is unique
```

### "Authentication required"

You need to set up authentication:
```bash
# Local publishing:
npm login

# GitHub Actions:
# Ensure NPM_TOKEN is set in repository secrets
```

### "Failed to publish"

Check:
1. Package name is not taken on npm
2. You have publish rights to `@maastrich` scope
3. `package.json` has `"access": "public"` (for scoped packages)
4. NPM_TOKEN is valid and has automation permissions

### Release workflow didn't trigger

Ensure:
1. Tag matches pattern `v*.*.*` (e.g., `v1.2.3`, not `1.2.3`)
2. Tag was pushed: `git push origin --tags`
3. GitHub Actions is enabled for the repository
4. Workflow file exists at `.github/workflows/release.yml`

### Workflow failed during publish

Check:
1. NPM_TOKEN secret is set correctly
2. Token has publish permissions
3. Package version doesn't already exist on npm
4. All quality checks passed

## Version Strategy

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Breaking API changes
- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backward compatible

## Package Access

The package is published as:
- **Scope**: `@maastrich/zod-resolve`
- **Access**: Public
- **Registry**: npm (https://www.npmjs.com/)

## Post-Release

After publishing:

1. ✅ Verify package on npm: https://www.npmjs.com/package/@maastrich/zod-resolve
2. ✅ Test installation: `pnpm add @maastrich/zod-resolve`
3. ✅ Check GitHub release: https://github.com/maastrich/zod-resolve/releases
4. ✅ Verify CHANGELOG is updated
5. 📢 Announce release (optional)

## Quick Reference

```bash
# Development workflow
pnpm changeset                    # Create a changeset for changes
git add .changeset/*.md           # Stage the changeset
git commit -m "feat: description" # Commit changes
git push                          # Push to trigger CI

# Release workflow
pnpm version                      # Bump version, update CHANGELOG
git add .                         # Stage version changes
git commit -m "chore: release vX.Y.Z"
git push origin main              # Push changes
git tag vX.Y.Z                    # Create version tag
git push origin vX.Y.Z            # Push tag → triggers release

# Check what will be released
pnpm changeset status             # View pending changes

# View all commands
pnpm run                          # List available scripts
```

## Changesets vs Git Tags

**Changesets** are used for:
- 📝 Documenting what changed
- 🔢 Determining version bumps (major/minor/patch)
- 📋 Generating CHANGELOG

**Git Tags** are used for:
- 🚀 Triggering the release workflow
- 🏷️ Marking specific commits as releases
- 📦 Creating GitHub releases

**Workflow:**
1. Development → Create changesets
2. Ready to release → Run `pnpm version` (consumes changesets)
3. Create git tag → Triggers automated publishing

## Support

For questions or issues:
- Open an issue: https://github.com/maastrich/zod-resolve/issues
- Check Changesets docs: https://github.com/changesets/changesets
- Check GitHub Actions docs: https://docs.github.com/en/actions
