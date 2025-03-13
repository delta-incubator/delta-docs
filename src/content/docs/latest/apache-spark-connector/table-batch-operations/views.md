---
title: Views on tables
description: Instructions for creating views on Delta tables
---

Delta Lake supports the creation of views on top of Delta tables just like you might with a data source table.

The core challenge when you operate with views is resolving the schemas. If you alter a Delta table schema, you must recreate derivative views to account for any additions to the schema. For instance, if you add a new column to a Delta table, you must make sure that this column is available in the appropriate views built on top of that base table.
