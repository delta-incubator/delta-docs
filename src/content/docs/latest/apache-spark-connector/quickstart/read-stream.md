---
title: "Read a stream of changes from a table"
description: Instructions for reading a stream of changes from a Delta table
---

## Read a stream of changes from a table

While the stream is writing to the Delta table, you can also read from that table as streaming source. For example, you can start another streaming query that prints all the changes made to the Delta table. You can specify which version Structured Streaming should start from by providing the `startingVersion` or `startingTimestamp` option to get changes from that point onwards. See [Structured Streaming](delta-streaming.md#-specify-initial-position) for details.

<Tabs>
  <TabItem label="Python">
    <Code code={`stream2 = spark.readStream.format("delta").load("/tmp/delta-table").writeStream.format("console").start()`} lang="python" />
  </TabItem>

  <TabItem label="Scala">
    <Code code={`val stream2 = spark.readStream.format("delta").load("/tmp/delta-table").writeStream.format("console").start()`} lang="scala" />
  </TabItem>

  <TabItem label="Java">
    <Code code={`StreamingQuery stream2 = spark.readStream().format("delta").load("/tmp/delta-table").writeStream().format("console").start();`} lang="java" />
  </TabItem>
</Tabs>
