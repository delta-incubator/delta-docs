---
title: "Read data"
description: Instructions for reading data from a Delta table
---

## Read data

You read data in your Delta table by specifying the path to the files: `/tmp/delta-table`:

### SQL

```sql
SELECT * FROM delta.`/tmp/delta-table`;
```

### Python

```python
df = spark.read.format("delta").load("/tmp/delta-table")
df.show()
```

### Scala

```scala
val df = spark.read.format("delta").load("/tmp/delta-table")
df.show()
```

### Java

```java
Dataset<Row> df = spark.read().format("delta").load("/tmp/delta-table");
df.show();
```
