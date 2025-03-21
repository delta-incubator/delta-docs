// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { pluginDocs } from "plugin-docs";

// https://astro.build/config
export default defineConfig({
  site: "https://delta-docs-staging.netlify.app",
  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },
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
        { label: "Welcome", link: "/latest/" },
        {
          label: "Apache Spark connector",
          items: [
            {
              label: "Quickstart",
              link: "/latest/apache-spark-connector/quickstart/",
            },
            {
              label: "Table batch reads and writes",
              link: "/latest/apache-spark-connector/table-batch-reads-and-writes/",
            },
            {
              label: "Table streaming reads and writes",
              link: "/latest/apache-spark-connector/table-streaming-reads-and-writes/",
            },
            {
              label: "Table deletes, updates, and merges",
              link: "/latest/apache-spark-connector/table-deletes-updates-and-merges/",
            },
            {
              label: "Change data feed",
              link: "/latest/apache-spark-connector/change-data-feed/",
            },
            {
              label: "Table utility commands",
              link: "/latest/apache-spark-connector/table-utility-commands/",
            },
            {
              label: "Constraints",
              link: "/latest/apache-spark-connector/constraints/",
            },
            {
              label: "How does Delta Lake manage feature compatibility?",
              link: "/latest/apache-spark-connector/how-does-delta-lake-manage-feature-compatibility/",
            },
            {
              label: "Delta default column values",
              link: "/latest/apache-spark-connector/delta-default-column-values/",
            },
            {
              label: "Delta column mapping",
              link: "/latest/apache-spark-connector/delta-column-mapping/",
            },
            {
              label: "Use liquid clustering for Delta tables",
              link: "/latest/apache-spark-connector/use-liquid-clustering-for-delta-tables/",
            },
            {
              label: "What are deletion vectors?",
              link: "/latest/apache-spark-connector/what-are-deletion-vectors/",
            },
            {
              label: "Drop Delta table features",
              link: "/latest/apache-spark-connector/drop-delta-table-features/",
            },
            {
              label: "Use row tracking for Delta tables",
              link: "/latest/apache-spark-connector/use-row-tracking-for-delta-tables/",
            },
            {
              label: "Storage configuration",
              link: "/latest/apache-spark-connector/storage-configuration/",
            },
            {
              label: "Delta type widening",
              link: "/latest/apache-spark-connector/delta-type-widening/",
            },
            {
              label: "Universal Format (UniForm)",
              link: "/latest/apache-spark-connector/universal-format-uniform/",
            },
            {
              label: "Read Delta Sharing Tables",
              link: "/latest/apache-spark-connector/read-delta-sharing-tables/",
            },
            {
              label: "Concurrency control",
              link: "/latest/apache-spark-connector/concurrency-control/",
            },
            {
              label: "Migration guide",
              link: "/latest/apache-spark-connector/migration-guide/",
            },
            {
              label: "Best practices",
              link: "/latest/apache-spark-connector/best-practices/",
            },
            {
              label: "Frequently asked questions (FAQ)",
              link: "/latest/apache-spark-connector/faq/",
            },
            {
              label: "Optimizations",
              link: "/latest/apache-spark-connector/optimizations/",
            },
          ],
        },
        {
          label: "Releases",
          link: "/latest/releases/",
        },
        {
          label: "Delta Transaction Log Protocol",
          link: "/latest/delta-transaction-log-protocol/",
        },
        {
          label: "Delta Lake APIs",
          link: "/latest/delta-lake-apis/",
        },
      ],
      plugins: [pluginDocs()],
    }),
  ],
});
