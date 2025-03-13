---
title: Syncing table schema and properties to the Hive metastore
description: Instructions for syncing table schema and properties to the Hive metastore
---

You can enable asynchronous syncing of table schema and properties to the metastore by setting `spark.databricks.delta.catalog.update.enabled` to `true`. Whenever the Delta client detects that either of these two were changed due to an update, it will sync the changes to the metastore.

The schema is stored in the table properties in HMS. If the schema is small, it will be stored directly under the key `spark.sql.sources.schema`:

```json
{
	"spark.sql.sources.schema": "{'name':'col1','type':'string','nullable':true, 'metadata':{}},{'name':'col2','type':'string','nullable':true,'metadata':{}}"
}
```

If Schema is large, the schema will be broken down into multiple parts. Appending them together should give the correct schema. E.g.

```json
{
	"spark.sql.sources.schema.numParts": "4",
	"spark.sql.sources.schema.part.1": "{'name':'col1','type':'string','nullable':tr",
	"spark.sql.sources.schema.part.2": "ue, 'metadata':{}},{'name':'co",
	"spark.sql.sources.schema.part.3": "l2','type':'string','nullable':true,'meta",
	"spark.sql.sources.schema.part.4": "data':{}}"
}
```
