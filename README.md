> [!NOTE] The content in this repo is currently in sync with delta-io/delta@5d40e1829f4f5cb00686e24f7e0bbc94aad5e93b

# Delta Docs

This folder contains all of the source code needed to generate the delta documentation site.

## Getting started

Install node v22.14.0 using [nvm](https://github.com/nvm-sh/nvm):

```
nvm install
```

Then, install [pnpm](https://pnpm.io/):

```
npm install --global corepack@latest
corepack enable pnpm
```

Finally, install dependencies:

```
pnpm i
```

## Usage

The docs site is build on [Astro](https://astro.build/). Using pnpm, you can run a variety of commands:

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `pnpm run lint`    | Run ESLint on the docs site code     |
| `pnpm run format`  | Format docs site code using Prettier |
| `pnpm run dev`     | Start Astro in development mode      |
| `pnpm run build`   | Build the Astro site for production  |
| `pnpm run preview` | Preview the built Astro site         |
| `pnpm run astro`   | Run Astro CLI                        |

## Upgrading dependencies

It's a best practice to make sure that our dependencies are always up to date. You can run `scripts/upgrade-dependencies` to automatically install upgrades.

Do note that you will still need to verify that things work as expected.
