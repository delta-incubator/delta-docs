---
title: Read a table
description: Instructions for reading a Delta table
---

You can load a Delta table as a DataFrame by specifying a table name or a path:

### SQL

```sql
SELECT * FROM default.people10m   -- query table in the metastore

SELECT * FROM delta.`/tmp/delta/people10m`  -- query table by path
```

### Python

```python
spark.table("default.people10m")    # query table in the metastore

spark.read.format("delta").load("/tmp/delta/people10m")  # query table by path
```

### Scala

```scala
spark.table("default.people10m")      // query table in the metastore

spark.read.format("delta").load("/tmp/delta/people10m")  // create table by path

import io.delta.implicits._
spark.read.delta("/tmp/delta/people10m")
```

The DataFrame returned automatically reads the most recent snapshot of the table for any query; you never need to run `REFRESH TABLE`. Delta Lake automatically uses partitioning and statistics to read the minimum amount of data when there are applicable predicates in the query.
