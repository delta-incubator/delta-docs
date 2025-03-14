---
title: Delta table as a source
description: Learn how to use a Delta table as a source for streaming queries.
---

When you load a Delta table as a stream source and use it in a streaming query, the query processes all of the data present in the table as well as any new data that arrives after the stream is started.

```scala
spark.readStream.format("delta")
  .load("/tmp/delta/events")

import io.delta.implicits._
spark.readStream.delta("/tmp/delta/events")
```

**In this section:**

- [Limit input rate](#limit-input-rate)
- [Ignore updates and deletes](#ignore-updates-and-deletes)
- [Specify initial position](#specify-initial-position)
- [Process initial snapshot without data being dropped](#process-initial-snapshot-without-data-being-dropped)
- [Tracking non-additive schema changes](#tracking-non-additive-schema-changes)

### Limit input rate

The following options are available to control micro-batches:

- `maxFilesPerTrigger`: How many new files to be considered in every micro-batch. The default is 1000.
- `maxBytesPerTrigger`: How much data gets processed in each micro-batch. This option sets a "soft max", meaning that a batch processes approximately this amount of data and may process more than the limit in order to make the streaming query move forward in cases when the smallest input unit is larger than this limit. If you use `Trigger.Once` for your streaming, this option is ignored. This is not set by default.

If you use `maxBytesPerTrigger` in conjunction with `maxFilesPerTrigger`, the micro-batch processes data until either the `maxFilesPerTrigger` or `maxBytesPerTrigger` limit is reached.

> **Note**
>
> In cases when the source table transactions are cleaned up due to the `logRetentionDuration` [configuration](delta-batch.html#-data-retention) and the stream lags in processing, Delta Lake processes the data corresponding to the latest available transaction history of the source table but does not fail the stream. This can result in data being dropped.

### Ignore updates and deletes

Structured Streaming does not handle input that is not an append and throws an exception if any modifications occur on the table being used as a source. There are two main strategies for dealing with changes that cannot be automatically propagated downstream:

- You can delete the output and checkpoint and restart the stream from the beginning.
- You can set either of these two options:
  - `ignoreDeletes`: ignore transactions that delete data at partition boundaries.
  - `ignoreChanges`: re-process updates if files had to be rewritten in the source table due to a data changing operation such as `UPDATE`, `MERGE INTO`, `DELETE` (within partitions), or `OVERWRITE`. Unchanged rows may still be emitted, therefore your downstream consumers should be able to handle duplicates. Deletes are not propagated downstream. `ignoreChanges` subsumes `ignoreDeletes`. Therefore if you use `ignoreChanges`, your stream will not be disrupted by either deletions or updates to the source table.

#### Example

For example, suppose you have a table `user_events` with `date`, `user_email`, and `action` columns that is partitioned by `date`. You stream out of the `user_events` table and you need to delete data from it due to GDPR.

When you delete at partition boundaries (that is, the `WHERE` is on a partition column), the files are already segmented by value so the delete just drops those files from the metadata. Thus, if you just want to delete data from some partitions, you can use:

```scala
spark.readStream.format("delta")
  .option("ignoreDeletes", "true")
  .load("/tmp/delta/user_events")
```

However, if you have to delete data based on `user_email`, then you will need to use:

```scala
spark.readStream.format("delta")
  .option("ignoreChanges", "true")
  .load("/tmp/delta/user_events")
```

If you update a `user_email` with the `UPDATE` statement, the file containing the `user_email` in question is rewritten. When you use `ignoreChanges`, the new record is propagated downstream with all other unchanged records that were in the same file. Your logic should be able to handle these incoming duplicate records.

### Specify initial position

You can use the following options to specify the starting point of the Delta Lake streaming source without processing the entire table.

- `startingVersion`: The Delta Lake version to start from. All table changes starting from this version (inclusive) will be read by the streaming source. You can obtain the commit versions from the `version` column of the [DESCRIBE HISTORY](delta-utility.html#-delta-history) command output.
- To return only the latest changes, specify `latest`.
- `startingTimestamp`: The timestamp to start from. All table changes committed at or after the timestamp (inclusive) will be read by the streaming source. One of:
  - A timestamp string. For example, `"2019-01-01T00:00:00.000Z"`.
  - A date string. For example, `"2019-01-01"`.

You cannot set both options at the same time; you can use only one of them. They take effect only when starting a new streaming query. If a streaming query has started and the progress has been recorded in its checkpoint, these options are ignored.

> **Important**
>
> Although you can start the streaming source from a specified version or timestamp, the schema of the streaming source is always the latest schema of the Delta table. You must ensure there is no incompatible schema change to the Delta table after the specified version or timestamp. Otherwise, the streaming source may return incorrect results when reading the data with an incorrect schema.

#### Example

For example, suppose you have a table `user_events`. If you want to read changes since version 5, use:

```scala
spark.readStream.format("delta")
  .option("startingVersion", "5")
  .load("/tmp/delta/user_events")
```

If you want to read changes since 2018-10-18, use:

```scala
spark.readStream.format("delta")
  .option("startingTimestamp", "2018-10-18")
  .load("/tmp/delta/user_events")
```

### Process initial snapshot without data being dropped

When using a Delta table as a stream source, the query first processes all of the data present in the table. The Delta table at this version is called the initial snapshot. By default, the Delta table's data files are processed based on which file was last modified. However, the last modification time does not necessarily represent the record event time order.

In a stateful streaming query with a defined watermark, processing files by modification time can result in records being processed in the wrong order. This could lead to records dropping as late events by the watermark.

You can avoid the data drop issue by enabling the following option:

- withEventTimeOrder: Whether the initial snapshot should be processed with event time order.

With event time order enabled, the event time range of initial snapshot data is divided into time buckets. Each micro batch processes a bucket by filtering data within the time range. The maxFilesPerTrigger and maxBytesPerTrigger configuration options are still applicable to control the microbatch size but only in an approximate way due to the nature of the processing.

The graphic below shows this process:

![Initial Snapshot](./delta-initial-snapshot-data-drop.png)

Notable information about this feature:

- The data drop issue only happens when the initial Delta snapshot of a stateful streaming query is processed in the default order.
- You cannot change `withEventTimeOrder` once the stream query is started while the initial snapshot is still being processed. To restart with `withEventTimeOrder` changed, you need to delete the checkpoint.
- If you are running a stream query with withEventTimeOrder enabled, you cannot downgrade it to a Delta version which doesn't support this feature until the initial snapshot processing is completed. If you need to downgrade, you can wait for the initial snapshot to finish, or delete the checkpoint and restart the query.
- This feature is not supported in the following uncommon scenarios:
  - The event time column is a generated column and there are non-projection transformations between the Delta source and watermark.
  - There is a watermark that has more than one Delta source in the stream query.
- With event time order enabled, the performance of the Delta initial snapshot processing might be slower.
- Each micro batch scans the initial snapshot to filter data within the corresponding event time range. For faster filter action, it is advised to use a Delta source column as the event time so that data skipping can be applied (check \_ for when it's applicable). Additionally, table partitioning along the event time column can further speed the processing. You can check Spark UI to see how many delta files are scanned for a specific micro batch.

#### Example

Suppose you have a table `user_events` with an `event_time` column. Your streaming query is an aggregation query. If you want to ensure no data drop during the initial snapshot processing, you can use:

```scala
spark.readStream.format("delta")
  .option("withEventTimeOrder", "true")
  .load("/tmp/delta/user_events")
  .withWatermark("event_time", "10 seconds")
```

..note: You can also enable this with Spark config on the cluster which will apply to all streaming queries:
spark.databricks.delta.withEventTimeOrder.enabled true

### Tracking non-additive schema changes

You can provide a schema tracking location to enable streaming from Delta tables with column mapping enabled. This overcomes an issue in which non-additive schema changes could result in broken streams by allowing streams to read past table data in their exact schema as if the table is time-travelled.

Each streaming read against a data source must have its own `schemaTrackingLocation` specified. The specified `schemaTrackingLocation` must be contained within the directory specified for the `checkpointLocation` of the target table for streaming write.

> **Note**
>
> For streaming workloads that combine data from multiple source Delta tables, you need to specify unique directories within the `checkpointLocation` for each source table.

#### Example

The option `schemaTrackingLocation` is used to specify the path for schema tracking, as shown in the following code example:

```python
checkpoint_path = "/path/to/checkpointLocation"

(spark.readStream
  .option("schemaTrackingLocation", checkpoint_path)
  .table("delta_source_table")
  .writeStream
  .option("checkpointLocation", checkpoint_path)
  .toTable("output_table")
)
```
