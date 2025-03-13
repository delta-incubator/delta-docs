---
title: Configure SparkSession
description: Instructions for configuring a SparkSession
---

For many Delta Lake operations, you enable integration with Apache Spark DataSourceV2 and Catalog APIs (since 3.0) by setting the following configurations when you create a new `SparkSession`.

## Configuration Examples

### Python

```python
from pyspark.sql import SparkSession

spark = SparkSession \
  .builder \
  .appName("...") \
  .master("...") \
  .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension") \
  .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog") \
  .getOrCreate()
```

### Scala

```scala
import org.apache.spark.sql.SparkSession

val spark = SparkSession
  .builder()
  .appName("...")
  .master("...")
  .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
  .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog")
  .getOrCreate()
```

### Java

```java
import org.apache.spark.sql.SparkSession;

SparkSession spark = SparkSession
  .builder()
  .appName("...")
  .master("...")
  .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
  .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog")
  .getOrCreate();
```

## Alternative Configuration Methods

You can also add configurations when submitting your Spark application using `spark-submit` or when starting `spark-shell` or `pyspark` by specifying them as command-line parameters:

### Spark Submit

```bash
spark-submit --conf "spark.sql.extensions=io.delta.sql.DeltaSparkSessionExtension" --conf "spark.sql.catalog.spark_catalog=org.apache.spark.sql.delta.catalog.DeltaCatalog" ...
```

### PySpark

```bash
pyspark --conf "spark.sql.extensions=io.delta.sql.DeltaSparkSessionExtension" --conf "spark.sql.catalog.spark_catalog=org.apache.spark.sql.delta.catalog.DeltaCatalog"
```
