---
title: Table deletes, updates, and merges
description: Learn how to delete, update, and merge data in Delta tables.
---

Delta Lake supports several statements to facilitate deleting data from and updating data in Delta tables.

## Delete from a table

You can remove data that matches a predicate from a Delta table. For instance, in a table named `people10m` or a path at `/tmp/delta/people-10m`, to delete all rows corresponding to people with a value in the `birthDate` column from before `1955`, you can run the following:

```sql
DELETE FROM people10m WHERE birthDate < '1955-01-01'

DELETE FROM delta.`/tmp/delta/people-10m` WHERE birthDate < '1955-01-01'
```

See [Configure SparkSession](delta-batch.html#-sql-support) for the steps to enable support for SQL commands.

**Python**

```python
from delta.tables import *
from pyspark.sql.functions import *

deltaTable = DeltaTable.forPath(spark, '/tmp/delta/people-10m')

# Declare the predicate by using a SQL-formatted string.
deltaTable.delete("birthDate < '1955-01-01'")

# Declare the predicate by using Spark SQL functions.
deltaTable.delete(col('birthDate') < '1960-01-01')
```

**Scala**

```scala
import io.delta.tables._

val deltaTable = DeltaTable.forPath(spark, "/tmp/delta/people-10m")

// Declare the predicate by using a SQL-formatted string.
deltaTable.delete("birthDate < '1955-01-01'")

import org.apache.spark.sql.functions._
import spark.implicits._

// Declare the predicate by using Spark SQL functions and implicits.
deltaTable.delete(col("birthDate") < "1955-01-01")
```

**Java**

```java
import io.delta.tables.*;
import org.apache.spark.sql.functions;

DeltaTable deltaTable = DeltaTable.forPath(spark, "/tmp/delta/people-10m");

// Declare the predicate by using a SQL-formatted string.
deltaTable.delete("birthDate < '1955-01-01'");

// Declare the predicate by using Spark SQL functions.
deltaTable.delete(functions.col("birthDate").lt(functions.lit("1955-01-01")));
```

See the [Delta Lake APIs](delta-apidoc.html) for details.

> **Important**
>
> `delete` removes the data from the latest version of the Delta table but does not remove it from the physical storage until the old versions are explicitly vacuumed. See [vacuum](delta-utility.html#-delta-vacuum) for details.

> **Tip**
>
> When possible, provide predicates on the partition columns for a partitioned Delta table as such predicates can significantly speed up the operation.

## Update a table

You can update data that matches a predicate in a Delta table. For example, in a table named `people10m` or a path at `/tmp/delta/people-10m`, to change an abbreviation in the `gender` column from `M` or `F` to `Male` or `Female`, you can run the following:

```sql
UPDATE people10m SET gender = 'Female' WHERE gender = 'F';
UPDATE people10m SET gender = 'Male' WHERE gender = 'M';

UPDATE delta.`/tmp/delta/people-10m` SET gender = 'Female' WHERE gender = 'F';
UPDATE delta.`/tmp/delta/people-10m` SET gender = 'Male' WHERE gender = 'M';
```

See [Configure SparkSession](delta-batch.html#-sql-support) for the steps to enable support for SQL commands.

**Python**

```python
from delta.tables import *
from pyspark.sql.functions import *

deltaTable = DeltaTable.forPath(spark, '/tmp/delta/people-10m')

# Declare the predicate by using a SQL-formatted string.
deltaTable.update(
  condition = "gender = 'F'",
  set = { "gender": "'Female'" }
)

# Declare the predicate by using Spark SQL functions.
deltaTable.update(
  condition = col('gender') == 'M',
  set = { 'gender': lit('Male') }
)
```

**Scala**

```scala
import io.delta.tables._

val deltaTable = DeltaTable.forPath(spark, "/tmp/delta/people-10m")

// Declare the predicate by using a SQL-formatted string.
deltaTable.updateExpr(
  "gender = 'F'",
  Map("gender" -> "'Female'")

import org.apache.spark.sql.functions._
import spark.implicits._

// Declare the predicate by using Spark SQL functions and implicits.
deltaTable.update(
  col("gender") === "M",
  Map("gender" -> lit("Male")));
```

**Java**

```java
import io.delta.tables.*;
import org.apache.spark.sql.functions;
import java.util.HashMap;

DeltaTable deltaTable = DeltaTable.forPath(spark, "/data/events/");

// Declare the predicate by using a SQL-formatted string.
deltaTable.updateExpr(
  "gender = 'F'",
  new HashMap<String, String>() {{
    put("gender", "'Female'");
  }}
);

// Declare the predicate by using Spark SQL functions.
deltaTable.update(
  functions.col(gender).eq("M"),
  new HashMap<String, Column>() {{
    put("gender", functions.lit("Male"));
  }}
);
```

See the [Delta Lake APIs](delta-apidoc.html) for details.

> **Tip**
>
> Similar to delete, update operations can get a significant speedup with predicates on partitions.

## Upsert into a table using merge

You can upsert data from a source table, view, or DataFrame into a target Delta table by using the `MERGE` SQL operation. Delta Lake supports inserts, updates and deletes in `MERGE`, and it supports extended syntax beyond the SQL standards to facilitate advanced use cases.

Suppose you have a source table named `people10mupdates` or a source path at `/tmp/delta/people-10m-updates` that contains new data for a target table named `people10m` or a target path at `/tmp/delta/people-10m`. Some of these new records may already be present in the target data. To merge the new data, you want to update rows where the person's `id` is already present and insert the new rows where no matching `id` is present. You can run the following:

```sql
MERGE INTO people10m
USING people10mupdates
ON people10m.id = people10mupdates.id
WHEN MATCHED THEN
  UPDATE SET
    id = people10mupdates.id,
    firstName = people10mupdates.firstName,
    middleName = people10mupdates.middleName,
    lastName = people10mupdates.lastName,
    gender = people10mupdates.gender,
    birthDate = people10mupdates.birthDate,
    ssn = people10mupdates.ssn,
    salary = people10mupdates.salary
WHEN NOT MATCHED
  THEN INSERT (
    id,
    firstName,
    middleName,
    lastName,
    gender,
    birthDate,
    ssn,
    salary
  )
  VALUES (
    people10mupdates.id,
    people10mupdates.firstName,
    people10mupdates.middleName,
    people10mupdates.lastName,
    people10mupdates.gender,
    people10mupdates.birthDate,
    people10mupdates.ssn,
    people10mupdates.salary
  )
```

See [Configure SparkSession](delta-batch.html#-sql-support) for the steps to enable support for SQL commands.

**Python**

```python
from delta.tables import *

deltaTablePeople = DeltaTable.forPath(spark, '/tmp/delta/people-10m')
deltaTablePeopleUpdates = DeltaTable.forPath(spark, '/tmp/delta/people-10m-updates')

dfUpdates = deltaTablePeopleUpdates.toDF()

deltaTablePeople.alias('people') \
  .merge(
    dfUpdates.alias('updates'),
    'people.id = updates.id'
  ) \
  .whenMatchedUpdate(set =
    {
      "id": "updates.id",
      "firstName": "updates.firstName",
      "middleName": "updates.middleName",
      "lastName": "updates.lastName",
      "gender": "updates.gender",
      "birthDate": "updates.birthDate",
      "ssn": "updates.ssn",
      "salary": "updates.salary"
    }
  ) \
  .whenNotMatchedInsert(values =
    {
      "id": "updates.id",
      "firstName": "updates.firstName",
      "middleName": "updates.middleName",
      "lastName": "updates.lastName",
      "gender": "updates.gender",
      "birthDate": "updates.birthDate",
      "ssn": "updates.ssn",
      "salary": "updates.salary"
    }
  ) \
  .execute()
```

**Scala**

```scala
import io.delta.tables._
import org.apache.spark.sql.functions._

val deltaTablePeople = DeltaTable.forPath(spark, "/tmp/delta/people-10m")
val deltaTablePeopleUpdates = DeltaTable.forPath(spark, "tmp/delta/people-10m-updates")
val dfUpdates = deltaTablePeopleUpdates.toDF()

deltaTablePeople
  .as("people")
  .merge(
    dfUpdates.as("updates"),
    "people.id = updates.id")
  .whenMatched
  .updateExpr(
    Map(
      "id" -> "updates.id",
      "firstName" -> "updates.firstName",
      "middleName" -> "updates.middleName",
      "lastName" -> "updates.lastName",
      "gender" -> "updates.gender",
      "birthDate" -> "updates.birthDate",
      "ssn" -> "updates.ssn",
      "salary" -> "updates.salary"
    ))
  .whenNotMatched
  .insertExpr(
    Map(
      "id" -> "updates.id",
      "firstName" -> "updates.firstName",
      "middleName" -> "updates.middleName",
      "lastName" -> "updates.lastName",
      "gender" -> "updates.gender",
      "birthDate" -> "updates.birthDate",
      "ssn" -> "updates.ssn",
      "salary" -> "updates.salary"
    ))
  .execute()
```

**Java**

```java
import io.delta.tables.*;
import org.apache.spark.sql.functions;
import java.util.HashMap;

DeltaTable deltaTable = DeltaTable.forPath(spark, "/tmp/delta/people-10m")
Dataset<Row> dfUpdates = spark.read("delta").load("/tmp/delta/people-10m-updates")

deltaTable
  .as("people")
  .merge(
    dfUpdates.as("updates"),
    "people.id = updates.id")
  .whenMatched()
  .updateExpr(
    new HashMap<String, String>() {{
      put("id", "updates.id");
      put("firstName", "updates.firstName");
      put("middleName", "updates.middleName");
      put("lastName", "updates.lastName");
      put("gender", "updates.gender");
      put("birthDate", "updates.birthDate");
      put("ssn", "updates.ssn");
      put("salary", "updates.salary");
    }})
  .whenNotMatched()
  .insertExpr(
    new HashMap<String, String>() {{
      put("id", "updates.id");
      put("firstName", "updates.firstName");
      put("middleName", "updates.middleName");
      put("lastName", "updates.lastName");
      put("gender", "updates.gender");
      put("birthDate", "updates.birthDate");
      put("ssn", "updates.ssn");
      put("salary", "updates.salary");
    }})
  .execute();
```

See the [Delta Lake APIs](delta-apidoc.html) for Scala, Java, and Python syntax details.

> **Important**
>
> Delta Lake merge operations typically require two passes over the source data. If your source data contains nondeterministic expressions, multiple passes on the source data can produce different rows causing incorrect results. Some common examples of nondeterministic expressions include the `current_date` and `current_timestamp` functions. In Delta Lake 2.2 and above this issue is solved by automatically materializing the source data as part of the merge command, so that the source data is deterministic in multiple passes. In Delta Lake 2.1 and below if you cannot avoid using non-deterministic functions, consider saving the source data to storage, for example as a temporary Delta table. Caching the source data may not address this issue, as cache invalidation can cause the source data to be recomputed partially or completely (for example when a cluster loses some of it executors when scaling down).

### Modify all unmatched rows using merge

> **Note**
>
> `WHEN NOT MATCHED BY SOURCE` clauses are supported by the Scala, Python and Java [Delta Lake APIs](delta-apidoc.html) in Delta 2.3 and above. SQL is supported in Delta 2.4 and above.

You can use the `WHEN NOT MATCHED BY SOURCE` clause to `UPDATE` or `DELETE` records in the target table that do not have corresponding records in the source table. We recommend adding an optional conditional clause to avoid fully rewriting the target table.

The following code example shows the basic syntax of using this for deletes, overwriting the target table with the contents of the source table and deleting unmatched records in the target table.

**Python**

```python
(targetDF
  .merge(sourceDF, "source.key = target.key")
  .whenMatchedUpdateAll()
  .whenNotMatchedInsertAll()
  .whenNotMatchedBySourceDelete()
  .execute()
)
```

**Scala**

```scala
targetDF
  .merge(sourceDF, "source.key = target.key")
  .whenMatched()
  .updateAll()
  .whenNotMatched()
  .insertAll()
  .whenNotMatchedBySource()
  .delete()
  .execute()
```

**SQL**

```sql
MERGE INTO target
USING source
ON source.key = target.key
WHEN MATCHED
  UPDATE SET *
WHEN NOT MATCHED
  INSERT *
WHEN NOT MATCHED BY SOURCE
  DELETE
```

The following example adds conditions to the `WHEN NOT MATCHED BY SOURCE` clause and specifies values to update in unmatched target rows.

**Python**

```python
(targetDF
  .merge(sourceDF, "source.key = target.key")
  .whenMatchedUpdate(
    set = {"target.lastSeen": "source.timestamp"}
  )
  .whenNotMatchedInsert(
    values = {
      "target.key": "source.key",
      "target.lastSeen": "source.timestamp",
      "target.status": "'active'"
    }
  )
  .whenNotMatchedBySourceUpdate(
    condition="target.lastSeen >= (current_date() - INTERVAL '5' DAY)",
    set = {"target.status": "'inactive'"}
  )
  .execute()
)
```

**Scala**

```scala
targetDF
  .merge(sourceDF, "source.key = target.key")
  .whenMatched()
  .updateExpr(Map("target.lastSeen" -> "source.timestamp"))
  .whenNotMatched()
  .insertExpr(Map(
    "target.key" -> "source.key",
    "target.lastSeen" -> "source.timestamp",
    "target.status" -> "'active'",
    )
  )
  .whenNotMatchedBySource("target.lastSeen >= (current_date() - INTERVAL '5' DAY)")
  .updateExpr(Map("target.status" -> "'inactive'"))
  .execute()
```

**SQL**

```sql
MERGE INTO target
USING source
ON source.key = target.key
WHEN MATCHED THEN
  UPDATE SET target.lastSeen = source.timestamp
WHEN NOT MATCHED THEN
  INSERT (key, lastSeen, status) VALUES (source.key,  source.timestamp, 'active')
WHEN NOT MATCHED BY SOURCE AND target.lastSeen >= (current_date() - INTERVAL '5' DAY) THEN
  UPDATE SET target.status = 'inactive'
```

### Operation semantics

Here is a detailed description of the `merge` programmatic operation.

- There can be any number of `whenMatched` and `whenNotMatched` clauses.

- `whenMatched` clauses are executed when a source row matches a target table row based on the match condition. These clauses have the following semantics.

  - `whenMatched` clauses can have at most one `update` and one `delete` action. The `update` action in `merge` only updates the specified columns (similar to the `update` [operation](#-delta-update)) of the matched target row. The `delete` action deletes the matched row.
  - Each `whenMatched` clause can have an optional condition. If this clause condition exists, the `update` or `delete` action is executed for any matching source-target row pair only when the clause condition is true.
  - If there are multiple `whenMatched` clauses, then they are evaluated in the order they are specified. All `whenMatched` clauses, except the last one, must have conditions.
  - If none of the `whenMatched` conditions evaluate to true for a source and target row pair that matches the merge condition, then the target row is left unchanged.
  - To update all the columns of the target Delta table with the corresponding columns of the source dataset, use `whenMatched(...).updateAll()`. This is equivalent to:
    ```scala
    whenMatched(...).updateExpr(Map("col1" -> "source.col1", "col2" -> "source.col2", ...))
    ```
    for all the columns of the target Delta table. Therefore, this action assumes that the source table has the same columns as those in the target table, otherwise the query throws an analysis error.
    > **Note**
    >
    > This behavior changes when automatic schema migration is enabled. See [Automatic schema evolution](#-merge-schema-evolution) for details.

- `whenNotMatched` clauses are executed when a source row does not match any target row based on the match condition. These clauses have the following semantics.

  - `whenNotMatched` clauses can have only the `insert` action. The new row is generated based on the specified column and corresponding expressions. You do not need to specify all the columns in the target table. For unspecified target columns, `NULL` is inserted.
  - Each `whenNotMatched` clause can have an optional condition. If the clause condition is present, a source row is inserted only if that condition is true for that row. Otherwise, the source column is ignored.
  - If there are multiple `whenNotMatched` clauses, then they are evaluated in the order they are specified. All `whenNotMatched` clauses, except the last one, must have conditions.
  - To insert all the columns of the target Delta table with the corresponding columns of the source dataset, use `whenNotMatched(...).insertAll()`. This is equivalent to:
    ```scala
    whenNotMatched(...).insertExpr(Map("col1" -> "source.col1", "col2" -> "source.col2", ...))
    ```
    for all the columns of the target Delta table. Therefore, this action assumes that the source table has the same columns as those in the target table, otherwise the query throws an analysis error.
    > **Note**
    >
    > This behavior changes when automatic schema migration is enabled. See [Automatic schema evolution](#-merge-schema-evolution) for details.

- `whenNotMatchedBySource` clauses are executed when a target row does not match any source row based on the merge condition. These clauses have the following semantics.
  - `whenNotMatchedBySource` clauses can specify `delete` and `update` actions.
  - Each `whenNotMatchedBySource` clause can have an optional condition. If the clause condition is present, a target row is modified only if that condition is true for that row. Otherwise, the target row is left unchanged.
  - If there are multiple `whenNotMatchedBySource` clauses, then they are evaluated in the order they are specified. All `whenNotMatchedBySource` clauses, except the last one, must have conditions.
  - By definition, `whenNotMatchedBySource` clauses do not have a source row to pull column values from, and so source columns can't be referenced. For each column to be modified, you can either specify a literal or perform an action on the target column, such as `SET target.deleted_count = target.deleted_count + 1`.

> **Important**
>
> - A `merge` operation can fail if multiple rows of the source dataset match and the merge attempts to update the same rows of the target Delta table. According to the SQL semantics of merge, such an update operation is ambiguous as it is unclear which source row should be used to update the matched target row. You can preprocess the source table to eliminate the possibility of multiple matches. See the [change data capture example](#-write-change-data-into-a-delta-table)—it shows how to preprocess the change dataset (that is, the source dataset) to retain only the latest change for each key before applying that change into the target Delta table.
> - You can apply a SQL `MERGE` operation on a SQL VIEW only if the view has been defined as `CREATE VIEW viewName AS SELECT * FROM deltaTable`.

### Schema validation

`merge` automatically validates that the schema of the data generated by insert and update expressions are compatible with the schema of the table. It uses the following rules to determine whether the `merge` operation is compatible:

- For `update` and `insert` actions, the specified target columns must exist in the target Delta table.
- For `updateAll` and `insertAll` actions, the source dataset must have all the columns of the target Delta table. The source dataset can have extra columns and they are ignored.

If you do not want the extra columns to be ignored and instead want to update the target table schema to include new columns, see [Automatic schema evolution](#-merge-schema-evolution).

- For all actions, if the data type generated by the expressions producing the target columns are different from the corresponding columns in the target Delta table, `merge` tries to cast them to the types in the table.

### Automatic schema evolution

Schema evolution allows users to resolve schema mismatches between the target and source table in merge. It handles the following two cases:

1. A column in the source table is not present in the target table. The new column is added to the target schema, and its values are inserted or updated using the source values.
2. A column in the target table is not present in the source table. The target schema is left unchanged; the values in the additional target column are either left unchanged (for `UPDATE`) or set to `NULL` (for `INSERT`).

> **Important**
>
> To use schema evolution, you must set the Spark session configuration`spark.databricks.delta.schema.autoMerge.enabled` to `true` before you run the `merge` command.
>
> **Note**
>
> In Delta 2.3 and above, columns present in the source table can be specified by name in insert or update actions. In Delta 2.2 and below, only `INSERT *` or `UPDATE SET *` actions can be used for schema evolution with merge.

Here are a few examples of the effects of `merge` operation with and without schema evolution.

| Columns                                                                 | Query (in SQL) | Behavior without schema evolution (default) | Behavior with schema evolution |
| :---------------------------------------------------------------------- | :------------- | :------------------------------------------ | :----------------------------- |
| Target columns: `key, value`<br>Source columns: `key, value, new_value` | ```sql         |

MERGE INTO target_table t
USING source_table s
ON t.key = s.key
WHEN MATCHED
THEN UPDATE SET _
WHEN NOT MATCHED
THEN INSERT _
``| The table schema remains unchanged; only columns `key`, `value` are updated/inserted. | The table schema is changed to `(key, value, new_value)`. Existing records with matches are updated with the `value` and `new_value` in the source. New rows are inserted with the schema `(key, value, new_value)`. |
| Target columns: `key, old_value`<br>Source columns: `key, new_value` |``sql
MERGE INTO target_table t
USING source_table s
ON t.key = s.key
WHEN MATCHED
THEN UPDATE SET _
WHEN NOT MATCHED
THEN INSERT _
``| `UPDATE` and `INSERT` actions throw an error because the target column `old_value` is not in the source. | The table schema is changed to `(key, old_value, new_value)`. Existing records with matches are updated with the `new_value` in the source leaving `old_value` unchanged. New records are inserted with the specified `key`, `new_value`, and `NULL` for the `old_value`. |
| Target columns: `key, old_value`<br>Source columns: `key, new_value` |``sql
MERGE INTO target_table t
USING source_table s
ON t.key = s.key
WHEN MATCHED
THEN UPDATE SET new_value = s.new_value
``| `UPDATE` throws an error because column `new_value` does not exist in the target table. | The table schema is changed to `(key, old_value, new_value)`. Existing records with matches are updated with the `new_value` in the source leaving `old_value` unchanged, and unmatched records have `NULL` entered for `new_value`. |
| Target columns: `key, old_value`<br>Source columns: `key, new_value` |``sql
MERGE INTO target_table t
USING source_table s
ON t.key = s.key
WHEN NOT MATCHED
THEN INSERT (key, new_value) VALUES (s.key, s.new_value)
```|`INSERT`throws an error because column`new_value`does not exist in the target table. | The table schema is changed to`(key, old_value, new_value)`. New records are inserted with the specified `key`, `new_value`, and `NULL`for the`old_value`. Existing records have `NULL`entered for`new_value`leaving`old_value` unchanged. See note (1). |

## Special considerations for schemas that contain arrays of structs

Delta `MERGE INTO` supports resolving struct fields by name and evolving schemas for arrays of structs. With schema evolution enabled, target table schemas will evolve for arrays of structs, which also works with any nested structs inside of arrays.

> **Note**
>
> In Delta 2.3 and above, struct fields present in the source table can be specified by name in insert or update commands. In Delta 2.2 and below, only `INSERT *` or `UPDATE SET *` commands can be used for schema evolution with merge.

Here are a few examples of the effects of merge operations with and without schema evolution for arrays of structs.

| Source schema                                             | Target schema                                  | Behavior without schema evolution (default)                                                   | Behavior with schema evolution                                                                                                                                                                                                                                             |
| :-------------------------------------------------------- | :--------------------------------------------- | :-------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| array<struct<b: string, a: string>>                       | array<struct<a: int, b: int>>                  | The table schema remains unchanged. Columns will be resolved by name and updated or inserted. | The table schema remains unchanged. Columns will be resolved by name and updated or inserted.                                                                                                                                                                              |
| array<struct<a: int, c: string, d: string>>               | array<struct<a: string, b: string>>            | `update` and `insert` throw errors because `c` and `d` do not exist in the target table.      | The table schema is changed to array<struct<a: string, b: string, c: string, d: string>>. `c` and `d` are inserted as `NULL` for existing entries in the target table. `update` and `insert` fill entries in the source table with `a` casted to string and `b` as `NULL`. |
| array<struct<a: string, b: struct<c: string, d: string>>> | array<struct<a: string, b: struct<c: string>>> | `update` and `insert` throw errors because `d` does not exist in the target table.            | The target table schema is changed to array<struct<a: string, b: struct<c: string, d: string>>>. `d` is inserted as `NULL` for existing entries in the target table.                                                                                                       |

### Performance tuning

You can reduce the time taken by merge using the following approaches:

- **Reduce the search space for matches**: By default, the `merge` operation searches the entire Delta table to find matches in the source table. One way to speed up `merge` is to reduce the search space by adding known constraints in the match condition. For example, suppose you have a table that is partitioned by `country` and `date` and you want to use `merge` to update information for the last day and a specific country. Adding the condition

  ```sql
  events.date = current_date() AND events.country = 'USA'
  ```

  will make the query faster as it looks for matches only in the relevant partitions. Furthermore, it will also reduce the chances of conflicts with other concurrent operations. See [Concurrency control](concurrency-control.html) for more details.

- **Compact files**: If the data is stored in many small files, reading the data to search for matches can become slow. You can compact small files into larger files to improve read throughput. See [Compact files](best-practices.html#-compact-files) for details.

- **Control the shuffle partitions for writes**: The `merge` operation shuffles data multiple times to compute and write the updated data. The number of tasks used to shuffle is controlled by the Spark session configuration `spark.sql.shuffle.partitions`. Setting this parameter not only controls the parallelism but also determines the number of output files. Increasing the value increases parallelism but also generates a larger number of smaller data files.

- **Repartition output data before write**: For partitioned tables, `merge` can produce a much larger number of small files than the number of shuffle partitions. This is because every shuffle task can write multiple files in multiple partitions, and can become a performance bottleneck. In many cases, it helps to repartition the output data by the table's partition columns before writing it. You enable this by setting the Spark session configuration `spark.databricks.delta.merge.repartitionBeforeWrite.enabled` to `true`.

## Merge examples

Here are a few examples on how to use `merge` in different scenarios.

**In this section:**

- [Data deduplication when writing into Delta tables](#data-deduplication-when-writing-into-delta-tables)
- [Slowly changing data (SCD) Type 2 operation into Delta tables](#slowly-changing-data-scd-type-2-operation-into-delta-tables)
- [Write change data into a Delta table](#write-change-data-into-a-delta-table)
- [Upsert from streaming queries using `foreachBatch`](#upsert-from-streaming-queries-using-foreachbatch)

### Data deduplication when writing into Delta tables

A common ETL use case is to collect logs into Delta table by appending them to a table. However, often the sources can generate duplicate log records and downstream deduplication steps are needed to take care of them. With `merge`, you can avoid inserting the duplicate records.

**SQL**

```sql
MERGE INTO logs
USING newDedupedLogs
ON logs.uniqueId = newDedupedLogs.uniqueId
WHEN NOT MATCHED
  THEN INSERT *
```

**Python**

```python
deltaTable.alias("logs").merge(
    newDedupedLogs.alias("newDedupedLogs"),
    "logs.uniqueId = newDedupedLogs.uniqueId") \
  .whenNotMatchedInsertAll() \
  .execute()
```

**Scala**

```scala
deltaTable
  .as("logs")
  .merge(
    newDedupedLogs.as("newDedupedLogs"),
    "logs.uniqueId = newDedupedLogs.uniqueId")
  .whenNotMatched()
  .insertAll()
  .execute()
```

**Java**

```java
deltaTable
  .as("logs")
  .merge(
    newDedupedLogs.as("newDedupedLogs"),
    "logs.uniqueId = newDedupedLogs.uniqueId")
  .whenNotMatched()
  .insertAll()
  .execute();
```

> **Note**
>
> The dataset containing the new logs needs to be deduplicated within itself.
