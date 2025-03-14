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
        { label: "Latest", link: "/latest" },
        { label: "Introduction", link: "/latest/delta-intro" },
        { label: "Delta API Doc", link: "/latest/delta-apidoc" },
        {
          label: "Apache Spark connector",
          items: [
            {
              label: "Quickstart",
              items: [
                {
                  label: "Set up Apache Spark with Delta Lake",
                  items: [
                    {
                      label: "Set up Apache Spark",
                      link: "/latest/apache-spark-connector/quickstart/setup/",
                    },
                    {
                      label: "Prerequisite: set up Java",
                      link: "/latest/apache-spark-connector/quickstart/setup-java/",
                    },
                    {
                      label: "Set up interactive shell",
                      link: "/latest/apache-spark-connector/quickstart/setup-shell/",
                    },
                    {
                      label: "Set up project",
                      link: "/latest/apache-spark-connector/quickstart/setup-project/",
                    },
                  ],
                },
                {
                  label: "Create a table",
                  link: "/latest/apache-spark-connector/quickstart/create-table/",
                },
                {
                  label: "Read data",
                  link: "/latest/apache-spark-connector/quickstart/read-data/",
                },
                {
                  label: "Update table data",
                  link: "/latest/apache-spark-connector/quickstart/update-data/",
                },
                {
                  label: "Read older versions of data using time travel",
                  link: "/latest/apache-spark-connector/quickstart/time-travel/",
                },
                {
                  label: "Write a stream of data to a table",
                  link: "/latest/apache-spark-connector/quickstart/write-stream/",
                },
                {
                  label: "Read a stream of changes from a table",
                  link: "/latest/apache-spark-connector/quickstart/read-stream/",
                },
              ],
            },
            {
              label: "Table batch reads and writes",
              items: [
                {
                  label: "Create a table",
                  link: "/latest/apache-spark-connector/table-batch-operations/create-table/",
                },
                {
                  label: "Read a table",
                  link: "/latest/apache-spark-connector/table-batch-operations/read-table/",
                },
                {
                  label: "Query an older snapshot of a table (time travel)",
                  link: "/latest/apache-spark-connector/table-batch-operations/time-travel/",
                },
                {
                  label: "Write to a table",
                  link: "/latest/apache-spark-connector/table-batch-operations/write-table/",
                },
                {
                  label: "Schema validation",
                  link: "/latest/apache-spark-connector/table-batch-operations/schema-validation/",
                },
                {
                  label: "Update table schema",
                  link: "/latest/apache-spark-connector/table-batch-operations/update-schema/",
                },
                {
                  label: "Replace table schema",
                  link: "/latest/apache-spark-connector/table-batch-operations/replace-schema/",
                },
                {
                  label: "Views on tables",
                  link: "/latest/apache-spark-connector/table-batch-operations/views/",
                },
                {
                  label: "Table properties",
                  link: "/latest/apache-spark-connector/table-batch-operations/properties/",
                },
                {
                  label:
                    "Syncing table schema and properties to the Hive metastore",
                  link: "/latest/apache-spark-connector/table-batch-operations/sync-hive/",
                },
                {
                  label: "Table metadata",
                  link: "/latest/apache-spark-connector/table-batch-operations/metadata/",
                },
                {
                  label: "Configure SparkSession",
                  link: "/latest/apache-spark-connector/table-batch-operations/spark-session/",
                },
                {
                  label: "Configure storage credentials",
                  link: "/latest/apache-spark-connector/table-batch-operations/storage-credentials/",
                },
              ],
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
