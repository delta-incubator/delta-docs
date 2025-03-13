---
title: "Create a table"
description: Instructions for creating a Delta table
---

To create a Delta table, write a DataFrame out in the `delta` format. You can use existing Spark SQL code and change the format from `parquet`, `csv`, `json`, and so on, to `delta`.

### SQL

```sql
CREATE TABLE delta.`/tmp/delta-table` USING DELTA AS SELECT col1 as id FROM VALUES 0,1,2,3,4;
```

### Python

```python
data = spark.range(0, 5)
data.write.format("delta").save("/tmp/delta-table")
```

### Scala

```scala
val data = spark.range(0, 5)
data.write.format("delta").save("/tmp/delta-table")
```

### Java

```java
import org.apache.spark.sql.SparkSession;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;

SparkSession spark = ...   // create SparkSession

Dataset<Row> data = spark.range(0, 5);
data.write().format("delta").save("/tmp/delta-table");
```

These operations create a new Delta table using the schema that was _inferred_ from your DataFrame. For the full set of options available when you create a new Delta table, see [Create a table](delta-batch.md#-ddlcreatetable) and [Write to a table](delta-batch.md#-deltadataframewrites).

> **Note**
>
> This quickstart uses local paths for Delta table locations. For configuring HDFS or cloud storage for Delta tables, see [Storage configuration](delta-storage.md).
