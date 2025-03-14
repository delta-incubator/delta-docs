---
title: Delta table as a sink
description: Instructions for using a Delta table as a sink
---

## Delta table as a sink

You can also write data into a Delta table using Structured Streaming. The transaction log enables Delta Lake to guarantee exactly-once processing, even when there are other streams or batch queries running concurrently against the table.

> **Note**
>
> The Delta Lake `VACUUM` function removes all files not managed by Delta Lake but skips any directories that begin with `_`. You can safely store checkpoints alongside other data and metadata for a Delta table using a directory structure such as `<table_name>/_checkpoints`.

**In this section:**

- [Append mode](#append-mode)
- [Complete mode](#complete-mode)

### Append mode

By default, streams run in append mode, which adds new records to the table.

You can use the path method:

**Python**

```python
events.writeStream
  .format("delta")
  .outputMode("append")
  .option("checkpointLocation", "/tmp/delta/_checkpoints/")
  .start("/delta/events")
```

**Scala**

```scala
events.writeStream
  .format("delta")
  .outputMode("append")
  .option("checkpointLocation", "/tmp/delta/events/_checkpoints/")
  .start("/tmp/delta/events")

import io.delta.implicits._
events.writeStream
  .outputMode("append")
  .option("checkpointLocation", "/tmp/delta/events/_checkpoints/")
  .delta("/tmp/delta/events")
```

or the `toTable` method (in Spark 3.1 and higher) as follows:

**Python**

```python
events.writeStream
  .format("delta")
  .outputMode("append")
  .option("checkpointLocation", "/tmp/delta/events/_checkpoints/")
  .toTable("events")
```

**Scala**

```scala
events.writeStream
  .outputMode("append")
  .option("checkpointLocation", "/tmp/delta/events/_checkpoints/")
  .toTable("events")
```

### Complete mode

You can also use Structured Streaming to replace the entire table with every batch. One example use case is to compute a summary using aggregation:

**Python**

```python
(spark.readStream
  .format("delta")
  .load("/tmp/delta/events")
  .groupBy("customerId")
  .count()
  .writeStream
  .format("delta")
  .outputMode("complete")
  .option("checkpointLocation", "/tmp/delta/eventsByCustomer/_checkpoints/")
  .start("/tmp/delta/eventsByCustomer")
)
```

**Scala**

```scala
spark.readStream
  .format("delta")
  .load("/tmp/delta/events")
  .groupBy("customerId")
  .count()
  .writeStream
  .format("delta")
  .outputMode("complete")
  .option("checkpointLocation", "/tmp/delta/eventsByCustomer/_checkpoints/")
  .start("/tmp/delta/eventsByCustomer")
```

The preceding example continuously updates a table that contains the aggregate number of events by customer.

For applications with more lenient latency requirements, you can save computing resources with one-time triggers. Use these to update summary aggregation tables on a given schedule, processing only new data that has arrived since the last update.
