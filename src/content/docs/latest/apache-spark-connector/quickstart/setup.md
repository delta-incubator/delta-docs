---
title: Set up Apache Spark
description: Instructions for setting up Delta Lake with Apache Spark
---

[Delta Lake 4.0 Preview](https://github.com/delta-io/delta/releases/tag/v4.0.0rc1) is released! See the 4.0 Preview documentation [here](https://docs.delta.io/4.0.0-preview/index.html).

Follow these instructions to set up Delta Lake with Spark. You can run the steps in this guide on your local machine in the following two ways:

- **Run interactively**: Start the Spark shell (Scala or Python) with Delta Lake and run the code snippets interactively in the shell.

- **Run as a project**: Set up a Maven or SBT project (Scala or Java) with Delta Lake, copy the code snippets into a source file, and run the project. Alternatively, you can use the [examples provided in the Github repository](https://github.com/delta-io/delta/tree/master/examples).

:::caution[Version Compatibility]
For all of the following instructions, make sure to install the correct version of Spark or PySpark that is compatible with Delta Lake 3.3.0. See the [release compatibility matrix](link-to-compatibility-matrix) for details.
:::
