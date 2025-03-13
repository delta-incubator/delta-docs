---
title: Query an older snapshot of a table (time travel)
description: Instructions for querying an older snapshot of a Delta table
---

**In this section:**

- [Syntax](#syntax)
- [Examples](#examples)
- [Data retention](#data-retention)
- [In-Commit Timestamps](#in-commit-timestamps)

Delta Lake time travel allows you to query an older snapshot of a Delta table. Time travel has many use cases, including:

- Re-creating analyses, reports, or outputs (for example, the output of a machine learning model). This could be useful for debugging or auditing, especially in regulated industries.
- Writing complex temporal queries.
- Fixing mistakes in your data.
- Providing snapshot isolation for a set of queries for fast changing tables.

This section describes the supported methods for querying older versions of tables, data retention concerns, and provides examples.

> **Note**
>
> The timestamp of each version N depends on the timestamp of the log file corresponding to the version N in Delta table log. Hence, time travel by timestamp can break if you copy the entire Delta table directory to a new location. Time travel by version will be unaffected.

### Syntax

This section shows how to query an older version of a Delta table.

#### SQL `AS OF` syntax

```sql
SELECT * FROM table_name TIMESTAMP AS OF timestamp_expression
SELECT * FROM table_name VERSION AS OF version
```

- `timestamp_expression` can be any one of:
  - `'2018-10-18T22:15:12.013Z'`, that is, a string that can be cast to a timestamp
  - `cast('2018-10-18 13:36:32 CEST' as timestamp)`
  - `'2018-10-18'`, that is, a date string
  - `current_timestamp() - interval 12 hours`
  - `date_sub(current_date(), 1)`
  - Any other expression that is or can be cast to a timestamp
- `version` is a long value that can be obtained from the output of `DESCRIBE HISTORY table_spec`.

Neither `timestamp_expression` nor `version` can be subqueries.

##### Example

```sql
SELECT * FROM default.people10m TIMESTAMP AS OF '2018-10-18T22:15:12.013Z'
SELECT * FROM delta.`/tmp/delta/people10m` VERSION AS OF 123
```

#### DataFrameReader options

DataFrameReader options allow you to create a DataFrame from a Delta table that is fixed to a specific version of the table.

```python
df1 = spark.read.format("delta").option("timestampAsOf", timestamp_string).load("/tmp/delta/people10m")
df2 = spark.read.format("delta").option("versionAsOf", version).load("/tmp/delta/people10m")
```

For `timestamp_string`, only date or timestamp strings are accepted. For example, `"2019-01-01"` and `"2019-01-01T00:00:00.000Z"`.

A common pattern is to use the latest state of the Delta table throughout the execution of a job to update downstream applications.

Because Delta tables auto update, a DataFrame loaded from a Delta table may return different results across invocations if the underlying data is updated. By using time travel, you can fix the data returned by the DataFrame across invocations:

```python
history = spark.sql("DESCRIBE HISTORY delta.`/tmp/delta/people10m`")
latest_version = history.selectExpr("max(version)").collect()
df = spark.read.format("delta").option("versionAsOf", latest_version[0][0]).load("/tmp/delta/people10m")
```

### Examples

- Fix accidental deletes to a table for the user `111`:

```python
yesterday = spark.sql("SELECT CAST(date_sub(current_date(), 1) AS STRING)").collect()[0][0]
df = spark.read.format("delta").option("timestampAsOf", yesterday).load("/tmp/delta/events")
df.where("userId = 111").write.format("delta").mode("append").save("/tmp/delta/events")
```

- Fix accidental incorrect updates to a table:

```python
yesterday = spark.sql("SELECT CAST(date_sub(current_date(), 1) AS STRING)").collect()[0][0]
df = spark.read.format("delta").option("timestampAsOf", yesterday).load("/tmp/delta/events")
df.createOrReplaceTempView("my_table_yesterday")
spark.sql('''
MERGE INTO delta.`/tmp/delta/events` target
  USING my_table_yesterday source
  ON source.userId = target.userId
  WHEN MATCHED THEN UPDATE SET *
''')
```

- Query the number of new customers added over the last week.

```python
last_week = spark.sql("SELECT CAST(date_sub(current_date(), 7) AS STRING)").collect()[0][0]
df = spark.read.format("delta").option("timestampAsOf", last_week).load("/tmp/delta/events")
last_week_count = df.select("userId").distinct().count()
count = spark.read.format("delta").load("/tmp/delta/events").select("userId").distinct().count()
new_customers_count = count - last_week_count
```

### Data retention

To time travel to a previous version, you must retain _both_ the log and the data files for that version.

The data files backing a Delta table are _never_ deleted automatically; data files are deleted only when you run [VACUUM](delta-utility.md#-delta-vacuum). `VACUUM` _does not_ delete Delta log files; log files are automatically cleaned up after checkpoints are written.

By default you can time travel to a Delta table up to 30 days old unless you have:

- Run `VACUUM` on your Delta table.
- Changed the data or log file retention periods using the following [table properties](#-table-properties):
  - `delta.logRetentionDuration = "interval <interval>"`: controls how long the history for a table is kept. The default is `interval 30 days`.

Each time a checkpoint is written, Delta automatically cleans up log entries older than the retention interval. If you set this config to a large enough value, many log entries are retained. This should not impact performance as operations against the log are constant time. Operations on history are parallel but will become more expensive as the log size increases.

- `delta.deletedFileRetentionDuration = "interval <interval>"`: controls how long ago a file must have been deleted _before being a candidate for_ `VACUUM`. The default is `interval 7 days`.

  To access 30 days of historical data even if you run `VACUUM` on the Delta table, set `delta.deletedFileRetentionDuration = "interval 30 days"`. This setting may cause your storage costs to go up.

> **Note**
>
> Due to log entry cleanup, instances can arise where you cannot time travel to a version that is less than the retention interval. Delta Lake requires all consecutive log entries since the previous checkpoint to time travel to a particular version. For example, with a table initially consisting of log entries for versions [0, 19] and a checkpoint at verison 10, if the log entry for version 0 is cleaned up, then you cannot time travel to versions [1, 9]. Increasing the table property `delta.logRetentionDuration` can help avoid these situations.

### In-Commit Timestamps

#### Overview

Delta Lake 3.3 introduced [In-Commit Timestamps](https://github.com/delta-io/delta/blob/master/PROTOCOL.md#in-commit-timestamps) to provide a more reliable and consistent way to track table modification timestamps. These modification timestamps are needed for various usecases e.g. time-travel to a specific time in the past. This feature addresses limitations of the traditional approach that relied on file modification timestamps, particularly in scenarios involving data migration or replication.

#### Feature Details

In-Commit Timestamps stores modification timestamps within the commit itself, ensuring they remain unchanged regardless of file system operations. This provides several benefits:

- **Immutable History**: Timestamps become part of the table's permanent commit history
- **Consistent Time Travel**: Queries using timestamp-based time travel produce reliable results even after table migration

Without the In-Commit Timestamp feature, Delta Lake uses file modification timestamps as the commit timestamp. This approach has various limitations:

1. Data Migration Issues: When tables were moved between storage locations, file modification timestamps would change, potentially disrupting historical tracking
2. Replication Scenarios: Timestamp inconsistencies could arise when replicating data across different environments
3. Time Travel Reliability: These timestamp changes could affect the accuracy and consistency of time travel queries

#### Enabling the Feature

This is a [writer table feature](versioning.md#-what-are-table-features) and can be enabled by setting the table property `delta.enableInCommitTimestamps` to `true`:

```sql
ALTER TABLE <table_name>
SET TBLPROPERTIES ('delta.enableInCommitTimestamps' = 'true');
```

After enabling In-Commit Timestamps:

- Only new write operations will include the embedded timestamps
- File modification timestamps will continued to be used for historical commits performed before enablement

See the [Versioning](./versioning) section for more details around compatibility.
