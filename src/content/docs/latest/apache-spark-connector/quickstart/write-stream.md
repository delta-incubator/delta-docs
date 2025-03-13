---
title: "Write a stream of data to a table"
description: Instructions for writing a stream of data to a Delta table
---

You can also write to a Delta table using Structured Streaming. The Delta Lake transaction log guarantees exactly-once processing, even when there are other streams or batch queries running concurrently against the table. By default, streams run in append mode, which adds new records to the table:

### Python

```python
streamingDf = spark.readStream.format("rate").load()
stream = streamingDf.selectExpr("value as id").writeStream.format("delta").option("checkpointLocation", "/tmp/checkpoint").start("/tmp/delta-table")
```

### Scala

```scala
val streamingDf = spark.readStream.format("rate").load()
val stream = streamingDf.select($"value" as "id").writeStream.format("delta").option("checkpointLocation", "/tmp/checkpoint").start("/tmp/delta-table")
```

### Java

```java
import org.apache.spark.sql.streaming.StreamingQuery;

Dataset<Row> streamingDf = spark.readStream().format("rate").load();
StreamingQuery stream = streamingDf.selectExpr("value as id").writeStream().format("delta").option("checkpointLocation", "/tmp/checkpoint").start("/tmp/delta-table");
```

While the stream is running, you can read the table using the earlier commands.

> **Note**
>
> If you're running this in a shell, you may see the streaming task progress, which make it hard to type commands in that shell. It may be useful to start another shell in a new terminal for querying the table.

You can stop the stream by running `stream.stop()` in the same terminal that started the stream.

For more information about Delta Lake integration with Structured Streaming, see [Table streaming reads and writes](delta-streaming.md). See also the [Structured Streaming Programming Guide](https://spark.apache.org/docs/latest/structured-streaming-programming-guide.html) on the Apache Spark website.
