---
title: Idempotent table writes in `foreachBatch`
description: Instructions for writing to a Delta table using `foreachBatch`
---

> **Note**: Available in Delta Lake 2.0.0 and above.

The `foreachBatch` command allows you to specify a function executed on the output of every micro-batch after arbitrary transformations in the streaming query. While this enables writing to one or more target Delta table destinations, by default it does not make these writes idempotent.

## Idempotent Write Options

To address potential duplicate writes, Delta tables support two `DataFrameWriter` options:

- `txnAppId`: A unique string for each `DataFrame` write (e.g., using the StreamingQuery ID)
- `txnVersion`: A monotonically increasing number acting as a transaction version

Delta table uses the combination of `txnAppId` and `txnVersion` to identify and ignore duplicate writes.

> **Warning**: If you delete the streaming checkpoint and restart the query with a new checkpoint, you must provide a different `appId`. Otherwise, writes from the restarted query will be ignored due to having the same `txnAppId` and starting the batch ID from 0.

## Examples

### Python Example

```python
app_id = ...  # A unique string that is used as an application ID.

def writeToDeltaLakeTableIdempotent(batch_df, batch_id):
  batch_df.write.format(...).option("txnVersion", batch_id).option("txnAppId", app_id).save(...)  # location 1
  batch_df.write.format(...).option("txnVersion", batch_id).option("txnAppId", app_id).save(...)  # location 2
```

### Scala Example

```scala
val appId = ...  // A unique string that is used as an application ID.
streamingDF.writeStream.foreachBatch { (batchDF: DataFrame, batchId: Long) =>
  batchDF.write.format(...).option("txnVersion", batchId).option("txnAppId", appId).save(...)  // location 1
  batchDF.write.format(...).option("txnVersion", batchId).option("txnAppId", appId).save(...)  // location 2
}
```

These options can also be used to achieve idempotent writes in non-Streaming jobs. For more details, refer to the [Idempotent writes](delta-batch.html#-idempotent-writes) documentation.
