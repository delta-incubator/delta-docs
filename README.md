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
