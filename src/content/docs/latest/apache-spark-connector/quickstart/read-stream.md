---
title: "Read a stream of changes from a table"
description: Instructions for reading a stream of changes from a Delta table
---

While the stream is writing to the Delta table, you can also read from that table as streaming source. For example, you can start another streaming query that prints all the changes made to the Delta table. You can specify which version Structured Streaming should start from by providing the `startingVersion` or `startingTimestamp` option to get changes from that point onwards. See [Structured Streaming](delta-streaming.md#-specify-initial-position) for details.

### Python

```python
stream2 = spark.readStream.format("delta").load("/tmp/delta-table").writeStream.format("console").start()
```

### Scala

```scala
val stream2 = spark.readStream.format("delta").load("/tmp/delta-table").writeStream.format("console").start()
```

### Java

```java
StreamingQuery stream2 = spark.readStream().format("delta").load("/tmp/delta-table").writeStream().format("console").start();
```
