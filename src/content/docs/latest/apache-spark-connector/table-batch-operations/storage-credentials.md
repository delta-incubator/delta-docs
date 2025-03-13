---
title: Configure storage credentials
description: Instructions for configuring storage credentials
---

Delta Lake uses Hadoop FileSystem APIs to access storage systems. Credentials for storage systems can typically be set through Hadoop configurations. Delta Lake provides multiple ways to set Hadoop configurations similar to Apache Spark.

## Spark Configurations

When starting a Spark application on a cluster, you can set Spark configurations in the form of `spark.hadoop.*` to pass custom Hadoop configurations. For example, setting a value for `spark.hadoop.a.b.c` will pass the value as a Hadoop configuration `a.b.c`, which Delta Lake will use to access Hadoop FileSystem APIs.

See the [Spark documentation](http://spark.apache.org/docs/latest/configuration.html#custom-hadoophive-configuration) for more details.

## SQL Session Configurations

Spark SQL will pass all current [SQL session configurations](http://spark.apache.org/docs/latest/configuration.html#runtime-sql-configuration) to Delta Lake. For example, `SET a.b.c=x.y.z` will tell Delta Lake to pass the value `x.y.z` as a Hadoop configuration `a.b.c` for accessing Hadoop FileSystem APIs.

## DataFrame Options

Delta Lake supports reading Hadoop file system configurations from `DataFrameReader` and `DataFrameWriter` options (keys starting with the `fs.` prefix) when reading or writing tables using `DataFrameReader.load(path)` or `DataFrameWriter.save(path)`.

### Python Example

```python
df1 = spark.read.format("delta") \
  .option("fs.azure.account.key.<storage-account-name>.dfs.core.windows.net", "<storage-account-access-key-1>") \
  .read("...")
df2 = spark.read.format("delta") \
  .option("fs.azure.account.key.<storage-account-name>.dfs.core.windows.net", "<storage-account-access-key-2>") \
  .read("...")
df1.union(df2).write.format("delta") \
  .mode("overwrite") \
  .option("fs.azure.account.key.<storage-account-name>.dfs.core.windows.net", "<storage-account-access-key-3>") \
  .save("...")
```

### Scala Example

```scala
val df1 = spark.read.format("delta")
  .option("fs.azure.account.key.<storage-account-name>.dfs.core.windows.net", "<storage-account-access-key-1>")
  .read("...")
val df2 = spark.read.format("delta")
  .option("fs.azure.account.key.<storage-account-name>.dfs.core.windows.net", "<storage-account-access-key-2>")
  .read("...")
df1.union(df2).write.format("delta")
  .mode("overwrite")
  .option("fs.azure.account.key.<storage-account-name>.dfs.core.windows.net", "<storage-account-access-key-3>")
  .save("...")
```

For detailed information about Hadoop file system configurations for your specific storage, refer to the [Storage configuration](delta-storage.html) documentation. <!-- TODO: update this link -->
