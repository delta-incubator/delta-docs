// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { pluginDocs } from "plugin-docs";

// https://astro.build/config
export default defineConfig({
  site: "https://delta-docs-staging.netlify.app",
  redirects: {
    "/": "/latest",
  },
  integrations: [
    starlight({
      customCss: ["./src/styles/custom.css"],
      title: "Delta Lake",
      social: {
        github: "https://github.com/delta-io/delta",
      },
      editLink: {
        baseUrl:
          "https://github.com/jakebellacera/db-site-staging/tree/main/sites/delta-docs",
      },
      lastUpdated: true,
      logo: {
        light: "./src/assets/delta-lake-logo-light.svg",
        dark: "./src/assets/delta-lake-logo-dark.svg",
        replacesTitle: true,
      },
      sidebar: [
        { label: "Welcome", link: "/latest" },
        { label: "Introduction", link: "/latest/delta-intro" },
        { label: "Delta API Doc", link: "/latest/delta-apidoc" },
        {
          label: "Apache Spark connector",
          items: [
            {
              label: "Quickstart",
              link: "/latest/apache-spark-connector/quickstart/",
            },
            {
              label: "Table batch reads and writes",
              link: "/latest/apache-spark-connector/table-batch-operations/",
            },
            {
              label: "Table streaming reads and writes",
              items: [
                {
                  label: "Delta table as a source",
                  link: "/latest/apache-spark-connector/table-streaming/delta-source/",
                },
                {
                  label: "Delta table as a sink",
                  link: "/latest/apache-spark-connector/table-streaming/delta-sink/",
                },
                {
                  label: "Idempotent table writes in foreachBatch",
                  link: "/latest/apache-spark-connector/table-streaming/idempotent-writes/",
                },
              ],
            },
            {
              label: "Table deletes, updates, and merges",
              link: "/latest/apache-spark-connector/table-dml/",
            },
            {
              label: "Change data feed",
              link: "/latest/apache-spark-connector/change-data-feed/",
            },
            {
              label: "Table utility commands",
              link: "/latest/apache-spark-connector/utility-commands/",
            },
            { label: "Constraints", link: "/latest/constraints/" },
            {
              label: "How does Delta Lake manage feature compatibility?",
              link: "/latest/feature-compatibility/",
            },
            {
              label: "Delta default column values",
              link: "/latest/default-columns/",
            },
            { label: "Delta column mapping", link: "/latest/column-mapping/" },
            {
              label: "Use liquid clustering for Delta tables",
              link: "/latest/liquid-clustering/",
            },
            {
              label: "What are deletion vectors?",
              link: "/latest/deletion-vectors/",
            },
            {
              label: "Drop Delta table features",
              link: "/latest/drop-features/",
            },
            {
              label: "Use row tracking for Delta tables",
              link: "/latest/row-tracking/",
            },
            { label: "Storage configuration", link: "/latest/storage-config/" },
            { label: "Delta type widening", link: "/latest/type-widening/" },
            { label: "Universal Format (UniForm)", link: "/latest/uniform/" },
            {
              label: "Read Delta Sharing Tables",
              link: "/latest/delta-sharing/",
            },
            { label: "Concurrency control", link: "/latest/concurrency/" },
            { label: "Migration guide", link: "/latest/migration/" },
            { label: "Best practices", link: "/latest/best-practices/" },
            { label: "Frequently asked questions (FAQ)", link: "/latest/faq/" },
            { label: "Optimizations", link: "/latest/optimizations/" },
          ],
        },
      ],
      plugins: [pluginDocs()],
    }),
  ],
});
