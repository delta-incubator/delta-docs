---
title: Idempotent table writes in `foreachBatch`
description: Instructions for writing to a Delta table using `foreachBatch`
---

> **Note**
>
> Available in Delta Lake 2.0.0 and above.

The command foreachBatch allows you to specify a function that is executed on the output of every micro-batch after arbitrary transformations in the streaming query. This allows implementating a `foreachBatch` function that can write the micro-batch output to one or more target Delta table destinations. However, `foreachBatch` does not make those writes idempotent as those write attempts lack the information of whether the batch is being re-executed or not. For example, rerunning a failed batch could result in duplicate data writes.

To address this, Delta tables support the following `DataFrameWriter` options to make the writes idempotent:

- `txnAppId`: A unique string that you can pass on each `DataFrame` write. For example, you can use the StreamingQuery ID as `txnAppId`.
- `txnVersion`: A monotonically increasing number that acts as transaction version.

Delta table uses the combination of `txnAppId` and `txnVersion` to identify duplicate writes and ignore them.

If a batch write is interrupted with a failure, rerunning the batch uses the same application and batch ID, which would help the runtime correctly identify duplicate writes and ignore them. Application ID (`txnAppId`) can be any user-generated unique string and does not have to be related to the stream ID.

> **Warning**
>
> If you delete the streaming checkpoint and restart the query with a new checkpoint, you must provide a different `appId`; otherwise, writes from the restarted query will be ignored because it will contain the same `txnAppId` and the batch ID would start from 0.

The same `DataFrameWriter` options can be used to achieve the idempotent writes in non-Streaming job. For details [Idempotent writes](delta-batch.html#-idempotent-writes).

### Example

**Python**

```python
app_id = ... # A unique string that is used as an application ID.

def writeToDeltaLakeTableIdempotent(batch_df, batch_id):
  batch_df.write.format(...).option("txnVersion", batch_id).option("txnAppId", app_id).save(...) # location 1
  batch_df.write.format(...).option("txnVersion", batch_id).option("txnAppId", app_id).save(...) # location 2
```

**Scala**

```scala
val appId = ... // A unique string that is used as an application ID.
streamingDF.writeStream.foreachBatch { (batchDF: DataFrame, batchId: Long) =>
  batchDF.write.format(...).option("txnVersion", batchId).option("txnAppId", appId).save(...)  // location 1
  batchDF.write.format(...).option("txnVersion", batchId).option("txnAppId", appId).save(...)  // location 2
}
```
