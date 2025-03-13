---
title: "Set up interactive shell"
description: Instructions for setting up the Spark SQL, PySpark, or Spark shell for Delta Lake
---

To use Delta Lake interactively within the Spark SQL, Scala, or Python shell, you need a local installation of Apache Spark. Depending on whether you want to use SQL, Python, or Scala, you can set up either the SQL, PySpark, or Spark shell, respectively.

#### Spark SQL Shell

Download the [compatible version](releases.md) of Apache Spark by following instructions from [Downloading Spark](https://spark.apache.org/downloads.html), either using `pip` or by downloading and extracting the archive and running `spark-sql` in the extracted directory.

```bash
bin/spark-sql --packages io.delta:delta-spark_2.12:3.3.0 --conf "spark.sql.extensions=io.delta.sql.DeltaSparkSessionExtension" --conf "spark.sql.catalog.spark_catalog=org.apache.spark.sql.delta.catalog.DeltaCatalog"
```

#### PySpark Shell

1. Install the PySpark version that is [compatible](releases.md) with the Delta Lake version by running the following:

```bash
pip install pyspark==<compatible-spark-version>
```

2. Run PySpark with the Delta Lake package and additional configurations:

```bash
pyspark --packages io.delta:delta-spark_2.12:3.3.0 --conf "spark.sql.extensions=io.delta.sql.DeltaSparkSessionExtension" --conf "spark.sql.catalog.spark_catalog=org.apache.spark.sql.delta.catalog.DeltaCatalog"
```

#### Spark Scala Shell

Download the [compatible version](releases.md) of Apache Spark by following instructions from [Downloading Spark](https://spark.apache.org/downloads.html), either using `pip` or by downloading and extracting the archive and running `spark-shell` in the extracted directory.

```bash
bin/spark-shell --packages io.delta:delta-spark_2.12:3.3.0 --conf "spark.sql.extensions=io.delta.sql.DeltaSparkSessionExtension" --conf "spark.sql.catalog.spark_catalog=org.apache.spark.sql.delta.catalog.DeltaCatalog"
```
