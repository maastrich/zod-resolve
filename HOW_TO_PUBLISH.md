# How to Publish

This guide explains how to publish new versions of `@maastrich/zod-resolve` to npm.

## Prerequisites

Before publishing, ensure you have:

1. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com/)
2. **npm Authentication**: Login locally with `npm login`
3. **Repository Access**: Write access to the GitHub repository
4. **NPM_TOKEN Secret**: Set up in GitHub repository settings (for automated releases)

## Publishing Workflow

This project uses [Changesets](https://github.com/changesets/changesets) for version management and publishing.

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

### Step 3: Automated Release (Recommended)

When changesets are merged to `main`, the GitHub Actions workflow will:

1. **Create a Release PR** - Automatically generates:
   - Version bump in `package.json`
   - Updated `CHANGELOG.md`
   - Consumes all pending changesets

2. **Review and Merge** the Release PR

3. **Automatic Publishing** - Once merged, the workflow:
   - Runs all quality checks (format, lint, type-check)
   - Builds the package
   - Publishes to npm
   - Creates a GitHub release with tags

**This is the recommended approach** - it's automated, safe, and maintains a clear release history.

### Step 4: Manual Publishing (Alternative)

If you need to publish manually:

```bash
# 1. Update versions based on changesets
pnpm version

# 2. Review the changes
git diff

# 3. Commit version changes
git add .
git commit -m "chore: version packages"
git push

# 4. Build and publish
pnpm release
```

**Note:** Manual publishing requires `NPM_TOKEN` to be set locally.

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

- Runs on: Pull requests and pushes to `main`
- Checks: Format, lint, type-check, build
- Matrix: Tests on Node 18, 20, 22

**Release Workflow (`.github/workflows/release.yml`)**

- Runs on: Pushes to `main`
- Actions:
  - Creates/updates release PR (if changesets exist)
  - Publishes to npm (when release PR is merged)
  - Creates GitHub release with tags

## Pre-Release Checklist

Before publishing, ensure:

- [ ] All tests pass locally (`pnpm test`)
- [ ] Code is formatted (`pnpm run format`)
- [ ] No linting errors (`pnpm run lint`)
- [ ] Type checking passes (`pnpm run type-check`)
- [ ] Build succeeds (`pnpm run build`)
- [ ] Documentation is updated
- [ ] CHANGELOG is accurate
- [ ] All changesets are merged

## Troubleshooting

### "Cannot publish over existing version"

The version already exists on npm. Ensure you've bumped the version:

```bash
pnpm version
```

### "Authentication required"

You need to login to npm:

```bash
npm login
# Or set NPM_TOKEN environment variable
export NPM_TOKEN=your_token_here
```

### "Failed to publish"

Check:

1. Package name is not taken on npm
2. You have publish rights to `@maastrich` scope
3. `package.json` has correct `"access": "public"`
4. NPM_TOKEN is valid and has automation permissions

### Release PR not created

Ensure:

1. Changesets exist in `.changeset/` directory
2. You've pushed to `main` branch
3. GitHub Actions has necessary permissions
4. `GITHUB_TOKEN` secret is available

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

1. Verify package on npm: https://www.npmjs.com/package/@maastrich/zod-resolve
2. Test installation: `pnpm add @maastrich/zod-resolve`
3. Check GitHub release: https://github.com/maastrich/zod-resolve/releases
4. Announce release (optional)

## Quick Reference

```bash
# Development workflow
pnpm changeset                    # Create a changeset
git add .changeset/*.md          # Stage the changeset
git commit -m "feat: description" # Commit changes
git push                         # Push to trigger CI

# Manual release (if needed)
pnpm version                     # Bump versions
pnpm release                     # Build and publish

# Check what will be released
pnpm changeset status            # View pending changes

# View all commands
pnpm run                         # List available scripts
```

## Support

For questions or issues:

- Open an issue: https://github.com/maastrich/zod-resolve/issues
- Check Changesets docs: https://github.com/changesets/changesets
