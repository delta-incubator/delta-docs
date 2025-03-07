import type { StarlightPlugin } from "@astrojs/starlight/types";

export const pluginDocs = (): StarlightPlugin => {
  return {
    name: "plugin-docs",
    hooks: {
      setup: () => {
        console.log("Docs plugin installed!");
      },
    },
  };
};
