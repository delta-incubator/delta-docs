---
title: "Update table data"
description: Instructions for updating data in a Delta table
---

Delta Lake supports several operations to modify tables using standard DataFrame APIs. This example runs a batch job to overwrite the data in the table:

### Overwrite

#### SQL

```sql
INSERT OVERWRITE delta.`/tmp/delta-table` SELECT col1 as id FROM VALUES 5,6,7,8,9;
```

#### Python

```python
data = spark.range(5, 10)
data.write.format("delta").mode("overwrite").save("/tmp/delta-table")
```

#### Scala

```scala
val data = spark.range(5, 10)
data.write.format("delta").mode("overwrite").save("/tmp/delta-table")
df.show()
```

#### Java

```java
Dataset<Row> data = spark.range(5, 10);
data.write().format("delta").mode("overwrite").save("/tmp/delta-table");
```

If you read this table again, you should see only the values `5-9` you have added because you overwrote the previous data.

### Conditional update without overwrite

Delta Lake provides programmatic APIs to conditional update, delete, and merge (upsert) data into tables.
Here are a few examples.

#### SQL

```sql
-- Update every even value by adding 100 to it
UPDATE delta.`/tmp/delta-table` SET id = id + 100 WHERE id % 2 == 0;

-- Delete every even value
DELETE FROM delta.`/tmp/delta-table` WHERE id % 2 == 0;

-- Upsert (merge) new data
CREATE TEMP VIEW newData AS SELECT col1 AS id FROM VALUES 1,3,5,7,9,11,13,15,17,19;

MERGE INTO delta.`/tmp/delta-table` AS oldData
USING newData
ON oldData.id = newData.id
WHEN MATCHED
  THEN UPDATE SET id = newData.id
WHEN NOT MATCHED
  THEN INSERT (id) VALUES (newData.id);

SELECT * FROM delta.`/tmp/delta-table`;
```

#### Python

```python
from delta.tables import *
from pyspark.sql.functions import *

deltaTable = DeltaTable.forPath(spark, "/tmp/delta-table")

# Update every even value by adding 100 to it
deltaTable.update(
  condition = expr("id % 2 == 0"),
  set = { "id": expr("id + 100") })

# Delete every even value
deltaTable.delete(condition = expr("id % 2 == 0"))

# Upsert (merge) new data
newData = spark.range(0, 20)

deltaTable.alias("oldData") \
  .merge(
    newData.alias("newData"),
    "oldData.id = newData.id") \
  .whenMatchedUpdate(set = { "id": col("newData.id") }) \
  .whenNotMatchedInsert(values = { "id": col("newData.id") }) \
  .execute()

deltaTable.toDF().show()
```

#### Scala

```scala
import io.delta.tables._
import org.apache.spark.sql.functions._

val deltaTable = DeltaTable.forPath("/tmp/delta-table")

// Update every even value by adding 100 to it
deltaTable.update(
  condition = expr("id % 2 == 0"),
  set = Map("id" -> expr("id + 100")))

// Delete every even value
deltaTable.delete(condition = expr("id % 2 == 0"))

// Upsert (merge) new data
val newData = spark.range(0, 20).toDF

deltaTable.as("oldData")
  .merge(
    newData.as("newData"),
    "oldData.id = newData.id")
  .whenMatched
  .update(Map("id" -> col("newData.id")))
  .whenNotMatched
  .insert(Map("id" -> col("newData.id")))
  .execute()

deltaTable.toDF.show()
```

#### Java

```java
import io.delta.tables.*;
import org.apache.spark.sql.functions;
import java.util.HashMap;

DeltaTable deltaTable = DeltaTable.forPath("/tmp/delta-table");

// Update every even value by adding 100 to it
deltaTable.update(
  functions.expr("id % 2 == 0"),
  new HashMap<String, Column>() {{
    put("id", functions.expr("id + 100"));
  }}
);

// Delete every even value
deltaTable.delete(condition = functions.expr("id % 2 == 0"));

// Upsert (merge) new data
Dataset<Row> newData = spark.range(0, 20).toDF();

deltaTable.as("oldData")
  .merge(
    newData.as("newData"),
    "oldData.id = newData.id")
  .whenMatched()
  .update(
    new HashMap<String, Column>() {{
      put("id", functions.col("newData.id"));
    }})
  .whenNotMatched()
  .insertExpr(
    new HashMap<String, Column>() {{
      put("id", functions.col("newData.id"));
    }})
  .execute();

deltaTable.toDF().show();
```

You should see that some of the existing rows have been updated and new rows have been inserted.

For more information on these operations, see [Table deletes, updates, and merges](delta-update.md).
