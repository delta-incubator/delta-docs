---
title: Replace table schema
description: Instructions for replacing a Delta table schema
---

By default, overwriting the data in a table does not overwrite the schema. When overwriting a table using `mode("overwrite")` without `replaceWhere`, you may still want to overwrite the schema of the data being written. You replace the schema and partitioning of the table by setting the `overwriteSchema` option to `true`:

```python
df.write.option("overwriteSchema", "true")
```
