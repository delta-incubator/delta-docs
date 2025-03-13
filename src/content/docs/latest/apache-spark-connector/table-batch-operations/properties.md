---
title: Table properties
description: Instructions for storing table properties
---

You can store your own metadata as a table property using `TBLPROPERTIES` in `CREATE` and `ALTER`. You can then `SHOW` that metadata. For example:

```sql
ALTER TABLE default.people10m SET TBLPROPERTIES ('department' = 'accounting', 'delta.appendOnly' = 'true');

-- Show the table's properties.
SHOW TBLPROPERTIES default.people10m;

-- Show just the 'department' table property.
SHOW TBLPROPERTIES default.people10m ('department');
```

`TBLPROPERTIES` are stored as part of Delta table metadata. You cannot define new `TBLPROPERTIES` in a `CREATE` statement if a Delta table already exists in a given location.

In addition, to tailor behavior and performance, Delta Lake supports certain Delta table properties:

- Block deletes and updates in a Delta table: `delta.appendOnly=true`.
- Configure the [time travel](#-deltatimetravel) retention properties: `delta.logRetentionDuration=<interval-string>` and `delta.deletedFileRetentionDuration=<interval-string>`. For details, see [Data retention](#-data-retention).
- Configure the number of columns for which statistics are collected: `delta.dataSkippingNumIndexedCols=n`. This property indicates to the writer that statistics are to be collected only for the first `n` columns in the table. Also the data skipping code ignores statistics for any column beyond this column index. This property takes affect only for new data that is written out.

> **Note**
>
> - Modifying a Delta table property is a write operation that will conflict with other [concurrent write operations](concurrency-control.md), causing them to fail. We recommend that you modify a table property only when there are no concurrent write operations on the table.

You can also set `delta.`-prefixed properties during the first commit to a Delta table using Spark configurations. For example, to initialize a Delta table with the property `delta.appendOnly=true`, set the Spark configuration `spark.databricks.delta.properties.defaults.appendOnly` to `true`. For example:

### SQL

```sql
spark.sql("SET spark.databricks.delta.properties.defaults.appendOnly = true")
```

### Python

```python
spark.conf.set("spark.databricks.delta.properties.defaults.appendOnly", "true")
```

### Scala

```scala
spark.conf.set("spark.databricks.delta.properties.defaults.appendOnly", "true")
```

See also the [Delta table properties reference](table-properties.md).
