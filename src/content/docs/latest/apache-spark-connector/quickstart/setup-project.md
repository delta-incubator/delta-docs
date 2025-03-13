---
title: "Set up project"
description: Instructions for setting up a Maven or SBT project with Delta Lake
---

If you want to build a project using Delta Lake binaries from Maven Central Repository, you can use the following Maven coordinates.

#### Maven

You include Delta Lake in your Maven project by adding it as a dependency in your POM file. Delta Lake compiled with Scala 2.12.

```xml
<dependency>
  <groupId>io.delta</groupId>
  <artifactId>delta-spark_2.12</artifactId>
  <version>3.3.0</version>
</dependency>
```

#### SBT

You include Delta Lake in your SBT project by adding the following line to your `build.sbt` file:

```scala
libraryDependencies += "io.delta" %% "delta-spark" % "3.3.0"
```

#### Python

To set up a Python project (for example, for unit testing), you can install Delta Lake using `pip install delta-spark==3.3.0` and then configure the SparkSession with the `configure_spark_with_delta_pip()` utility function in Delta Lake.

```python
import pyspark
from delta import *

builder = pyspark.sql.SparkSession.builder.appName("MyApp") \
    .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension") \
    .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog")

spark = configure_spark_with_delta_pip(builder).getOrCreate()
```
