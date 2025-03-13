---
title: "Read older versions of data using time travel"
description: Instructions for reading older versions of data using time travel
---

You can query previous snapshots of your Delta table by using time travel. If you want to access the data that you overwrote, you can query a snapshot of the table before you overwrote the first set of data using the `versionAsOf` option.

### SQL

```sql
SELECT * FROM delta.`/tmp/delta-table` VERSION AS OF 0;
```

### Python

```python
df = spark.read.format("delta").option("versionAsOf", 0).load("/tmp/delta-table")
df.show()
```

### Scala

```scala
val df = spark.read.format("delta").option("versionAsOf", 0).load("/tmp/delta-table")
df.show()
```

### Java

```java
Dataset<Row> df = spark.read().format("delta").option("versionAsOf", 0).load("/tmp/delta-table");
df.show();
```

You should see the first set of data, from before you overwrote it. Time travel takes advantage of the power of the Delta Lake transaction log to access data that is no longer in the table. Removing the version 0 option (or specifying version 1) would let you see the newer data again. For more information, see [Query an older snapshot of a table (time travel)](delta-batch.md#-deltatimetravel).
