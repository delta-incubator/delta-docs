---
title: Write to a table
description: Instructions for writing to a Delta table
---

### Append

To atomically add new data to an existing Delta table, use `append` mode:

#### SQL

```sql
INSERT INTO default.people10m SELECT * FROM morePeople
```

#### Python

```python
df.write.format("delta").mode("append").save("/tmp/delta/people10m")
df.write.format("delta").mode("append").saveAsTable("default.people10m")
```

#### Scala

```scala
df.write.format("delta").mode("append").save("/tmp/delta/people10m")
df.write.format("delta").mode("append").saveAsTable("default.people10m")

import io.delta.implicits._
df.write.mode("append").delta("/tmp/delta/people10m")
```

### Overwrite

To atomically replace all the data in a table, use `overwrite` mode:

#### SQL

```sql
INSERT OVERWRITE TABLE default.people10m SELECT * FROM morePeople
```

#### Python

```python
df.write.format("delta").mode("overwrite").save("/tmp/delta/people10m")
df.write.format("delta").mode("overwrite").saveAsTable("default.people10m")
```

#### Scala

```scala
df.write.format("delta").mode("overwrite").save("/tmp/delta/people10m")
df.write.format("delta").mode("overwrite").saveAsTable("default.people10m")

import io.delta.implicits._
df.write.mode("overwrite").delta("/tmp/delta/people10m")
```

You can selectively overwrite only the data that matches an arbitrary expression. This feature is available with DataFrames in Delta Lake 1.1.0 and above and supported in SQL in Delta Lake 2.4.0 and above.

The following command atomically replaces events in January in the target table, which is partitioned by `start_date`, with the data in `replace_data`:

#### Python

```python
replace_data.write \
  .format("delta") \
  .mode("overwrite") \
  .option("replaceWhere", "start_date >= '2017-01-01' AND end_date <= '2017-01-31'") \
  .save("/tmp/delta/events")
```

#### Scala

```scala
replace_data.write
  .format("delta")
  .mode("overwrite")
  .option("replaceWhere", "start_date >= '2017-01-01' AND end_date <= '2017-01-31'")
  .save("/tmp/delta/events")
```

#### SQL

```sql
INSERT INTO TABLE events REPLACE WHERE start_data >= '2017-01-01' AND end_date <= '2017-01-31' SELECT * FROM replace_data
```

This sample code writes out the data in `replace_data`, validates that it all matches the predicate, and performs an atomic replacement. If you want to write out data that doesn't all match the predicate, to replace the matching rows in the target table, you can disable the constraint check by setting `spark.databricks.delta.replaceWhere.constraintCheck.enabled` to false:

#### Python

```python
spark.conf.set("spark.databricks.delta.replaceWhere.constraintCheck.enabled", False)
```

#### Scala

```scala
spark.conf.set("spark.databricks.delta.replaceWhere.constraintCheck.enabled", false)
```

#### SQL

```sql
SET spark.databricks.delta.replaceWhere.constraintCheck.enabled=false
```

In Delta Lake 1.0.0 and below, `replaceWhere` overwrites data matching a predicate over partition columns only. The following command atomically replaces the month in January in the target table, which is partitioned by `date`, with the data in `df`:

#### Python

```python
df.write \
  .format("delta") \
  .mode("overwrite") \
  .option("replaceWhere", "birthDate >= '2017-01-01' AND birthDate <= '2017-01-31'") \
  .save("/tmp/delta/people10m")
```

#### Scala

```scala
df.write
  .format("delta")
  .mode("overwrite")
  .option("replaceWhere", "birthDate >= '2017-01-01' AND birthDate <= '2017-01-31'")
  .save("/tmp/delta/people10m")
```

In Delta Lake 1.1.0 and above, if you want to fall back to the old behavior, you can disable the `spark.databricks.delta.replaceWhere.dataColumns.enabled` flag:

#### Python

```python
spark.conf.set("spark.databricks.delta.replaceWhere.dataColumns.enabled", False)
```

#### Scala

```scala
spark.conf.set("spark.databricks.delta.replaceWhere.dataColumns.enabled", false)
```

#### SQL

```sql
SET spark.databricks.delta.replaceWhere.dataColumns.enabled=false
```

#### Dynamic Partition Overwrites

Delta Lake 2.0 and above supports _dynamic_ partition overwrite mode for partitioned tables.

When in dynamic partition overwrite mode, we overwrite all existing data in each logical partition for which the write will commit new data. Any existing logical partitions for which the write does not contain data will remain unchanged. This mode is only applicable when data is being written in overwrite mode: either `INSERT OVERWRITE` in SQL, or a DataFrame write with `df.write.mode("overwrite")`.

Configure dynamic partition overwrite mode by setting the Spark session configuration `spark.sql.sources.partitionOverwriteMode` to `dynamic`. You can also enable this by setting the `DataFrameWriter` option `partitionOverwriteMode` to `dynamic`. If present, the query-specific option overrides the mode defined in the session configuration. The default for `partitionOverwriteMode` is `static`.

#### SQL

```sql
SET spark.sql.sources.partitionOverwriteMode=dynamic;
INSERT OVERWRITE TABLE default.people10m SELECT * FROM morePeople;
```

#### Python

```python
df.write \
  .format("delta") \
  .mode("overwrite") \
  .option("partitionOverwriteMode", "dynamic") \
  .saveAsTable("default.people10m")
```

#### Scala

```scala
df.write
  .format("delta")
  .mode("overwrite")
  .option("partitionOverwriteMode", "dynamic")
  .saveAsTable("default.people10m")
```

> **Note**
>
> Dynamic partition overwrite conflicts with the option `replaceWhere` for partitioned tables.
>
> - If dynamic partition overwrite is enabled in the Spark session configuration, and `replaceWhere` is provided as a `DataFrameWriter` option, then Delta Lake overwrites the data according to the `replaceWhere` expression (query-specific options override session configurations).
> - You'll receive an error if the `DataFrameWriter` options have both dynamic partition overwrite and `replaceWhere` enabled.

> **Important**
>
> Validate that the data written with dynamic partition overwrite touches only the expected partitions. A single row in the incorrect partition can lead to unintentionally overwriting an entire partition. We recommend using `replaceWhere` to specify which data to overwrite.
>
> If a partition has been accidentally overwritten, you can use [Restore a Delta table to an earlier state](delta-utility.md#-restore-a-delta-table-to-an-earlier-state) to undo the change.

For Delta Lake support for updating tables, see [Table deletes, updates, and merges](delta-update.md).

### Limit rows written in a file

You can use the SQL session configuration `spark.sql.files.maxRecordsPerFile` to specify the maximum number of records to write to a single file for a Delta Lake table. Specifying a value of zero or a negative value represents no limit.

You can also use the DataFrameWriter option `maxRecordsPerFile` when using the DataFrame APIs to write to a Delta Lake table. When `maxRecordsPerFile` is specified, the value of the SQL session configuration `spark.sql.files.maxRecordsPerFile` is ignored.

#### Python

```python
df.write.format("delta") \
  .mode("append") \
  .option("maxRecordsPerFile", "10000") \
  .save("/tmp/delta/people10m")
```

#### Scala

```scala
df.write.format("delta")
  .mode("append")
  .option("maxRecordsPerFile", "10000")
  .save("/tmp/delta/people10m")
```

### Idempotent writes

Sometimes a job that writes data to a Delta table is restarted due to various reasons (for example, job encounters a failure). The failed job may or may not have written the data to Delta table before terminating. In the case where the data is written to the Delta table, the restarted job writes the same data to the Delta table which results in duplicate data.

To address this, Delta tables support the following `DataFrameWriter` options to make the writes idempotent:

- `txnAppId`: A unique string that you can pass on each `DataFrame` write. For example, this can be the name of the job.
- `txnVersion`: A monotonically increasing number that acts as transaction version. This number needs to be unique for data that is being written to the Delta table(s). For example, this can be the epoch seconds of the instant when the query is attempted for the first time. Any subsequent restarts of the same job needs to have the same value for `txnVersion`.

The above combination of options needs to be unique for each new data that is being ingested into the Delta table and the `txnVersion` needs to be higher than the last data that was ingested into the Delta table. For example:

- Last successfully written data contains option values as `dailyETL:23423` (`txnAppId:txnVersion`).
- Next write of data should have `txnAppId = dailyETL` and `txnVersion` as at least `23424` (one more than the last written data `txnVersion`).
- Any attempt to write data with `txnAppId = dailyETL` and `txnVersion` as `23422` or less is ignored because the `txnVersion` is less than the last recorded `txnVersion` in the table.
- Attempt to write data with `txnAppId:txnVersion` as `anotherETL:23424` is successful writing data to the table as it contains a different `txnAppId` compared to the same option value in last ingested data.

You can also configure idempotent writes by setting the Spark session configuration `spark.databricks.delta.write.txnAppId` and `spark.databricks.delta.write.txnVersion`. In addition, you can set `spark.databricks.delta.write.txnVersion.autoReset.enabled` to true to automatically reset `spark.databricks.delta.write.txnVersion` after every write. When both the writer options and session configuration are set, we will use the writer option values.

> **Warning**
>
> This solution assumes that the data being written to Delta table(s) in multiple retries of the job is same. If a write attempt in a Delta table succeeds but due to some downstream failure there is a second write attempt with same txn options but different data, then that second write attempt will be ignored. This can cause unexpected results.

#### Example

#### Python

```python
app_id = ... # A unique string that is used as an application ID.
version = ... # A monotonically increasing number that acts as transaction version.

dataFrame.write.format(...).option("txnVersion", version).option("txnAppId", app_id).save(...)
```

#### Scala

```scala
val appId = ... // A unique string that is used as an application ID.
version = ... // A monotonically increasing number that acts as transaction version.

dataFrame.write.format(...).option("txnVersion", version).option("txnAppId", appId).save(...)
```

#### SQL

```sql
SET spark.databricks.delta.write.txnAppId = ...;
SET spark.databricks.delta.write.txnVersion = ...;
SET spark.databricks.delta.write.txnVersion.autoReset.enabled = true; -- if set to true, this will reset txnVersion after every write
```

### Set user-defined commit metadata

You can specify user-defined strings as metadata in commits made by these operations, either using the DataFrameWriter option `userMetadata` or the SparkSession configuration `spark.databricks.delta.commitInfo.userMetadata`. If both of them have been specified, then the option takes preference. This user-defined metadata is readable in the [history](delta-utility.md#-delta-history) operation.

#### SQL

```sql
SET spark.databricks.delta.commitInfo.userMetadata=overwritten-for-fixing-incorrect-data
INSERT OVERWRITE default.people10m SELECT * FROM morePeople
```

#### Python

```python
df.write.format("delta") \
  .mode("overwrite") \
  .option("userMetadata", "overwritten-for-fixing-incorrect-data") \
  .save("/tmp/delta/people10m")
```

#### Scala

```scala
df.write.format("delta")
  .mode("overwrite")
  .option("userMetadata", "overwritten-for-fixing-incorrect-data")
  .save("/tmp/delta/people10m")
```
