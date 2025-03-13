---
title: Create a table
description: Instructions for creating a Delta table
---

Delta Lake supports creating two types of tables—tables defined in the metastore and tables defined by path.

To work with metastore-defined tables, you must enable integration with Apache Spark DataSourceV2 and Catalog APIs by setting configurations when you create a new `SparkSession`. See [Configure SparkSession](/latest/apache-spark-connector/table-batch-operations/spark-session).

You can create tables in the following ways.

- **SQL DDL commands**: You can use standard SQL DDL commands supported in Apache Spark (for example, `CREATE TABLE` and `REPLACE TABLE`) to create Delta tables.

```sql
CREATE TABLE IF NOT EXISTS default.people10m (
  id INT,
  firstName STRING,
  middleName STRING,
  lastName STRING,
  gender STRING,
  birthDate TIMESTAMP,
  ssn STRING,
  salary INT
) USING DELTA

CREATE OR REPLACE TABLE default.people10m (
  id INT,
  firstName STRING,
  middleName STRING,
  lastName STRING,
  gender STRING,
  birthDate TIMESTAMP,
  ssn STRING,
  salary INT
) USING DELTA
```

SQL also supports creating a table at a path, without creating an entry in the Hive metastore.

```sql
-- Create or replace table with path
CREATE OR REPLACE TABLE delta.`/tmp/delta/people10m` (
  id INT,
  firstName STRING,
  middleName STRING,
  lastName STRING,
  gender STRING,
  birthDate TIMESTAMP,
  ssn STRING,
  salary INT
) USING DELTA
```

- **`DataFrameWriter` API**: If you want to simultaneously create a table and insert data into it from Spark DataFrames or Datasets, you can use the Spark `DataFrameWriter` ([Scala or Java](https://spark.apache.org/docs/latest/api/scala/org/apache/spark/sql/DataFrameWriter.html) and [Python](https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/io.html)).

### Python

```python
# Create table in the metastore using DataFrame's schema and write data to it
df.write.format("delta").saveAsTable("default.people10m")

# Create or replace partitioned table with path using DataFrame's schema and write/overwrite data to it
df.write.format("delta").mode("overwrite").save("/tmp/delta/people10m")
```

### Scala

```scala
// Create table in the metastore using DataFrame's schema and write data to it
df.write.format("delta").saveAsTable("default.people10m")

// Create table with path using DataFrame's schema and write data to it
df.write.format("delta").mode("overwrite").save("/tmp/delta/people10m")
```

You can also create Delta tables using the Spark `DataFrameWriterV2` API.

- **`DeltaTableBuilder` API**: You can also use the `DeltaTableBuilder` API in Delta Lake to create tables. Compared to the DataFrameWriter APIs, this API makes it easier to specify additional information like column comments, table properties, and [generated columns](#-deltausegeneratedcolumns).

> **Note**
>
> This feature is new and is in Preview.

### Python

```python
# Create table in the metastore
DeltaTable.createIfNotExists(spark) \
  .tableName("default.people10m") \
  .addColumn("id", "INT") \
  .addColumn("firstName", "STRING") \
  .addColumn("middleName", "STRING") \
  .addColumn("lastName", "STRING", comment = "surname") \
  .addColumn("gender", "STRING") \
  .addColumn("birthDate", "TIMESTAMP") \
  .addColumn("ssn", "STRING") \
  .addColumn("salary", "INT") \
  .execute()

# Create or replace table with path and add properties
DeltaTable.createOrReplace(spark) \
  .addColumn("id", "INT") \
  .addColumn("firstName", "STRING") \
  .addColumn("middleName", "STRING") \
  .addColumn("lastName", "STRING", comment = "surname") \
  .addColumn("gender", "STRING") \
  .addColumn("birthDate", "TIMESTAMP") \
  .addColumn("ssn", "STRING") \
  .addColumn("salary", "INT") \
  .property("description", "table with people data") \
  .location("/tmp/delta/people10m") \
  .execute()
```

### Scala

```scala
// Create table in the metastore
DeltaTable.createOrReplace(spark)
  .tableName("default.people10m")
  .addColumn("id", "INT")
  .addColumn("firstName", "STRING")
  .addColumn("middleName", "STRING")
  .addColumn(
    DeltaTable.columnBuilder("lastName")
      .dataType("STRING")
      .comment("surname")
      .build())
  .addColumn("lastName", "STRING", comment = "surname")
  .addColumn("gender", "STRING")
  .addColumn("birthDate", "TIMESTAMP")
  .addColumn("ssn", "STRING")
  .addColumn("salary", "INT")
  .execute()

// Create or replace table with path and add properties
DeltaTable.createOrReplace(spark)
  .addColumn("id", "INT")
  .addColumn("firstName", "STRING")
  .addColumn("middleName", "STRING")
  .addColumn(
    DeltaTable.columnBuilder("lastName")
      .dataType("STRING")
      .comment("surname")
      .build())
  .addColumn("lastName", "STRING", comment = "surname")
  .addColumn("gender", "STRING")
  .addColumn("birthDate", "TIMESTAMP")
  .addColumn("ssn", "STRING")
  .addColumn("salary", "INT")
  .property("description", "table with people data")
  .location("/tmp/delta/people10m")
  .execute()
```

See the [API documentation](/latest/delta-apidoc) for details.

### Partition data

You can partition data to speed up queries or DML that have predicates involving the partition columns.
To partition data when you create a Delta table, specify a partition by columns. The following example partitions by gender.

### SQL

```sql
-- Create table in the metastore
CREATE TABLE default.people10m (
  id INT,
  firstName STRING,
  middleName STRING,
  lastName STRING,
  gender STRING,
  birthDate TIMESTAMP,
  ssn STRING,
  salary INT
)
USING DELTA
PARTITIONED BY (gender)
```

### Python

```python
df.write.format("delta").partitionBy("gender").saveAsTable("default.people10m")

DeltaTable.create(spark) \
  .tableName("default.people10m") \
  .addColumn("id", "INT") \
  .addColumn("firstName", "STRING") \
  .addColumn("middleName", "STRING") \
  .addColumn("lastName", "STRING", comment = "surname") \
  .addColumn("gender", "STRING") \
  .addColumn("birthDate", "TIMESTAMP") \
  .addColumn("ssn", "STRING") \
  .addColumn("salary", "INT") \
  .partitionedBy("gender") \
  .execute()
```

### Scala

```scala
df.write.format("delta").partitionBy("gender").saveAsTable("default.people10m")

DeltaTable.createOrReplace(spark)
  .tableName("default.people10m")
  .addColumn("id", "INT")
  .addColumn("firstName", "STRING")
  .addColumn("middleName", "STRING")
  .addColumn(
    DeltaTable.columnBuilder("lastName")
      .dataType("STRING")
      .comment("surname")
      .build())
  .addColumn("lastName", "STRING", comment = "surname")
  .addColumn("gender", "STRING")
  .addColumn("birthDate", "TIMESTAMP")
  .addColumn("ssn", "STRING")
  .addColumn("salary", "INT")
  .partitionedBy("gender")
  .execute()
```

To determine whether a table contains a specific partition, use the statement `SELECT COUNT(*) > 0 FROM <table-name> WHERE <partition-column> = <value>`. If the partition exists, `true` is returned. For example:

### SQL

```sql
SELECT COUNT(*) > 0 AS `Partition exists` FROM default.people10m WHERE gender = "M"
```

### Python

```python
display(spark.sql("SELECT COUNT(*) > 0 AS `Partition exists` FROM default.people10m WHERE gender = 'M'"))
```

### Scala

```scala
display(spark.sql("SELECT COUNT(*) > 0 AS `Partition exists` FROM default.people10m WHERE gender = 'M'"))
```

### Control data location

For tables defined in the metastore, you can optionally specify the `LOCATION` as a path. Tables created with a specified `LOCATION` are considered unmanaged by the metastore. Unlike a managed table, where no path is specified, an unmanaged table's files are not deleted when you `DROP` the table.

When you run `CREATE TABLE` with a `LOCATION` that _already_ contains data stored using Delta Lake, Delta Lake does the following:

- If you specify _only the table name and location_, for example:

```sql
CREATE TABLE default.people10m
USING DELTA
LOCATION '/tmp/delta/people10m'
```

the table in the metastore automatically inherits the schema, partitioning, and table properties of the existing data. This functionality can be used to "import" data into the metastore.

- If you specify _any configuration_ (schema, partitioning, or table properties), Delta Lake verifies that the specification exactly matches the configuration of the existing data.

> **Important**
>
> If the specified configuration does not _exactly_ match the configuration of the data, Delta Lake throws an exception that describes the discrepancy.

> **Note**
>
> The metastore is not the source of truth about the latest information of a Delta table. In fact, the table definition in the metastore may not contain all the metadata like schema and properties. It contains the location of the table, and the table's transaction log at the location is the source of truth. If you query the metastore from a system that is not aware of this Delta-specific customization, you may see incomplete or stale table information.

### Use generated columns

> **Note**
>
> This feature is new and is in Preview.

Delta Lake supports generated columns which are a special type of columns whose values are automatically generated based on a user-specified function over other columns in the Delta table. When you write to a table with generated columns and you do not explicitly provide values for them, Delta Lake automatically computes the values. For example, you can automatically generate a date column (for partitioning the table by date) from the timestamp column; any writes into the table need only specify the data for the timestamp column. However, if you explicitly provide values for them, the values must satisfy the [constraint](delta-constraints.md) `(<value> <=> <generation expression>) IS TRUE` or the write will fail with an error.

> **Important**
>
> Tables created with generated columns have a higher table writer protocol version than the default. See [How does Delta Lake manage feature compatibility?](versioning.md) to understand table protocol versioning and what it means to have a higher version of a table protocol version.

The following example shows how to create a table with generated columns:

### Python

```python
DeltaTable.create(spark) \
  .tableName("default.people10m") \
  .addColumn("id", "INT") \
  .addColumn("firstName", "STRING") \
  .addColumn("middleName", "STRING") \
  .addColumn("lastName", "STRING", comment = "surname") \
  .addColumn("gender", "STRING") \
  .addColumn("birthDate", "TIMESTAMP") \
  .addColumn("dateOfBirth", DateType(), generatedAlwaysAs="CAST(birthDate AS DATE)") \
  .addColumn("ssn", "STRING") \
  .addColumn("salary", "INT") \
  .partitionedBy("gender") \
  .execute()
```

### Scala

```scala
DeltaTable.create(spark)
  .tableName("default.people10m")
  .addColumn("id", "INT")
  .addColumn("firstName", "STRING")
  .addColumn("middleName", "STRING")
  .addColumn(
    DeltaTable.columnBuilder("lastName")
      .dataType("STRING")
      .comment("surname")
      .build())
  .addColumn("lastName", "STRING", comment = "surname")
  .addColumn("gender", "STRING")
  .addColumn("birthDate", "TIMESTAMP")
  .addColumn(
    DeltaTable.columnBuilder("dateOfBirth")
     .dataType(DateType)
     .generatedAlwaysAs("CAST(dateOfBirth AS DATE)")
     .build())
  .addColumn("ssn", "STRING")
  .addColumn("salary", "INT")
  .partitionedBy("gender")
  .execute()
```

Generated columns are stored as if they were normal columns. That is, they occupy storage.

The following restrictions apply to generated columns:

- A generation expression can use any SQL functions in Spark that always return the same result when given the same argument values, except the following types of functions:
  - User-defined functions.
  - Aggregate functions.
  - Window functions.
  - Functions returning multiple rows.
- For Delta Lake 1.1.0 and above, `MERGE` operations support generated columns when you set `spark.databricks.delta.schema.autoMerge.enabled` to true.

Delta Lake may be able to generate partition filters for a query whenever a partition column is defined by one of the following expressions:

- `CAST(col AS DATE)` and the type of `col` is `TIMESTAMP`.
- `YEAR(col)` and the type of `col` is `TIMESTAMP`.
- Two partition columns defined by `YEAR(col), MONTH(col)` and the type of `col` is `TIMESTAMP`.
- Three partition columns defined by `YEAR(col), MONTH(col), DAY(col)` and the type of `col` is `TIMESTAMP`.
- Four partition columns defined by `YEAR(col), MONTH(col), DAY(col), HOUR(col)` and the type of `col` is `TIMESTAMP`.
- `SUBSTRING(col, pos, len)` and the type of `col` is `STRING`
- `DATE_FORMAT(col, format)` and the type of `col` is `TIMESTAMP`.
- `DATE_TRUNC(format, col) and the type of the `col`is`TIMESTAMP`or`DATE`.
- `TRUNC(col, format)` and type of the `col` is either `TIMESTAMP` or `DATE`.

If a partition column is defined by one of the preceding expressions, and a query filters data using the underlying base column of a generation expression, Delta Lake looks at the relationship between the base column and the generated column, and populates partition filters based on the generated partition column if possible. For example, given the following table:

```python
DeltaTable.create(spark) \
  .tableName("default.events") \
  .addColumn("eventId", "BIGINT") \
  .addColumn("data", "STRING") \
  .addColumn("eventType", "STRING") \
  .addColumn("eventTime", "TIMESTAMP") \
  .addColumn("eventDate", "DATE", generatedAlwaysAs="CAST(eventTime AS DATE)") \
  .partitionedBy("eventType", "eventDate") \
  .execute()
```

If you then run the following query:

```python
spark.sql('SELECT * FROM default.events WHERE eventTime >= "2020-10-01 00:00:00" <= "2020-10-01 12:00:00"')
```

Delta Lake automatically generates a partition filter so that the preceding query only reads the data in partition `date=2020-10-01` even if a partition filter is not specified.

As another example, given the following table:

```python
DeltaTable.create(spark) \
  .tableName("default.events") \
  .addColumn("eventId", "BIGINT") \
  .addColumn("data", "STRING") \
  .addColumn("eventType", "STRING") \
  .addColumn("eventTime", "TIMESTAMP") \
  .addColumn("year", "INT", generatedAlwaysAs="YEAR(eventTime)") \
  .addColumn("month", "INT", generatedAlwaysAs="MONTH(eventTime)") \
  .addColumn("day", "INT", generatedAlwaysAs="DAY(eventTime)") \
  .partitionedBy("eventType", "year", "month", "day") \
  .execute()
```

If you then run the following query:

```python
spark.sql('SELECT * FROM default.events WHERE eventTime >= "2020-10-01 00:00:00" <= "2020-10-01 12:00:00"')
```

Delta Lake automatically generates a partition filter so that the preceding query only reads the data in partition `year=2020/month=10/day=01` even if a partition filter is not specified.

You can use an [EXPLAIN](https://spark.apache.org/docs/latest/sql-ref-syntax-qry-explain.html) clause and check the provided plan to see whether Delta Lake automatically generates any partition filters.

### Use identity columns

> **Important**
>
> Declaring an identity column on a Delta table disables concurrent transactions. Only use identity columns in use cases where concurrent writes to the target table are not required.

Delta Lake identity columns are supported in Delta Lake 3.3 and above. They are a type of generated column that assigns unique values for each record inserted into a table. The following example shows how to declare an identity column during a create table command:

### Python

```python
from delta.tables import DeltaTable, IdentityGenerator
from pyspark.sql.types import LongType

DeltaTable.create()
  .tableName("table_name")
  .addColumn("id_col1", dataType=LongType(), generatedAlwaysAs=IdentityGenerator())
  .addColumn("id_col2", dataType=LongType(), generatedAlwaysAs=IdentityGenerator(start=-1, step=1))
  .addColumn("id_col3", dataType=LongType(), generatedByDefaultAs=IdentityGenerator())
  .addColumn("id_col4", dataType=LongType(), generatedByDefaultAs=IdentityGenerator(start=-1, step=1))
  .execute()
```

### Scala

```scala
import io.delta.tables.DeltaTable
import org.apache.spark.sql.types.LongType

DeltaTable.create(spark)
  .tableName("table_name")
  .addColumn(
    DeltaTable.columnBuilder(spark, "id_col1")
      .dataType(LongType)
      .generatedAlwaysAsIdentity().build())
  .addColumn(
    DeltaTable.columnBuilder(spark, "id_col2")
      .dataType(LongType)
      .generatedAlwaysAsIdentity(start = -1L, step = 1L).build())
  .addColumn(
    DeltaTable.columnBuilder(spark, "id_col3")
      .dataType(LongType)
      .generatedByDefaultAsIdentity().build())
  .addColumn(
    DeltaTable.columnBuilder(spark, "id_col4")
      .dataType(LongType)
      .generatedByDefaultAsIdentity(start = -1L, step = 1L).build())
  .execute()
```

> **Note**
>
> SQL APIs for identity columns are not supported yet.

You can optionally specify the following:

- A starting value.
- A step size, which can be positive or negative.

Both the starting value and step size default to `1`. You cannot specify a step size of `0`.

Values assigned by identity columns are unique and increment in the direction of the specified step, and in multiples of the specified step size, but are not guaranteed to be contiguous. For example, with a starting value of `0` and a step size of `2`, all values are positive even numbers but some even numbers might be skipped.

When the identity column is specified to be `generated by default as identity`, insert operations can specify values for the identity column. Specify it to be `generated always as identity` to override the ability to manually set values.

Identity columns only support `LongType`, and operations fail if the assigned value exceeds the range supported by `LongType`.

You can use `ALTER TABLE table_name ALTER COLUMN column_name SYNC IDENTITY` to synchronize the metadata of an identity column with the actual data. When you write your own values to an identity column, it might not comply with the metadata. This option evaluates the state and updates the metadata to be consistent with the actual data. After this command, the next automatically assigned identity value will start from `start + (n + 1) * step`, where `n` is the smallest value that satisfies `start + n * step >= max()` (for a positive step).

#### CTAS and identity columns

You cannot define schema, identity column constraints, or any other table specifications when using a `CREATE TABLE table_name AS SELECT` (CTAS) statement.

To create a new table with an identity column and populate it with existing data, do the following:

1. Create a table with the correct schema, including the identity column definition and other table properties.
2. Run an insertion operation.

The following example define the identity column to be `generated by default as identity`. If data inserted into the table includes valid values for the identity column, these values are used.

### Python

```python
from delta.tables import DeltaTable, IdentityGenerator
from pyspark.sql.types import LongType, DateType

DeltaTable.create(spark)
  .tableName("new_table")
  .addColumn("id", dataType=LongType(), generatedByDefaultAs=IdentityGenerator(start=5, step=1))
  .addColumn("event_date", dataType=DateType())
  .addColumn("some_value", dataType=LongType())
  .execute()

# Insert records including existing IDs
old_table_df = spark.table("old_table").select("id", "event_date", "some_value")
old_table_df.write
  .format("delta")
  .mode("append")
  .saveAsTable("new_table")

# Insert records and generate new IDs
new_records_df = spark.table("new_records").select("event_date", "some_value")
new_records_df.write
  .format("delta")
  .mode("append")
  .saveAsTable("new_table")
```

### Scala

```scala
import org.apache.spark.sql.types._
import io.delta.tables.DeltaTable

DeltaTable.createOrReplace(spark)
  .tableName("new_table")
  .addColumn(
    DeltaTable.columnBuilder(spark, "id")
      .dataType(LongType)
      .generatedByDefaultAsIdentity(start = 5L, step = 1L)
      .build())
  .addColumn(
    DeltaTable.columnBuilder(spark, "event_date")
      .dataType(DateType)
      .nullable(true)
      .build())
  .addColumn(
    DeltaTable.columnBuilder(spark, "some_value")
      .dataType(LongType)
      .nullable(true)
      .build())
  .execute()

// Insert records including existing IDs
val oldTableDF = spark.table("old_table").select("id", "event_date", "some_value")
oldTableDF.write
  .format("delta")
  .mode("append")
  .saveAsTable("new_table")

// Insert records and generate new IDs
val newRecordsDF = spark.table("new_records").select("event_date", "some_value")
newRecordsDF.write
  .format("delta")
  .mode("append")
  .saveAsTable("new_table")
```

#### Identity column limitations

The following limitations exist when working with identity columns:

- Concurrent transactions are not supported on tables with identity columns enabled.
- You cannot partition a table by an identity column.
- You cannot `ADD`, `REPLACE`, or `CHANGE` an identity column.
- You cannot update the value of an identity column for an existing record.

> **Note**
>
> To change the `IDENTITY` value for an existing record, you must delete the record and `INSERT` it as a new record.

### Specify default values for columns

Delta enables the specification of [default expressions](https://github.com/delta-io/delta/blob/master/PROTOCOL.md#default-columns) for columns in Delta tables. When users write to these tables without explicitly providing values for certain columns, or when they explicitly use the DEFAULT SQL keyword for a column, Delta automatically generates default values for those columns. For more information, please refer to the dedicated documentation page.

### Use special characters in column names

By default, special characters such as spaces and any of the characters `,;{}()\n\t=` are not supported in table column names. To include these special characters in a table's column name, enable column mapping.

### Default table properties

Delta Lake configurations set in the SparkSession override the default [table properties](#-table-properties) for new Delta Lake tables created in the session.
The prefix used in the SparkSession is different from the configurations used in the table properties.

| Delta Lake conf | SparkSession conf                                   |
| :-------------- | :-------------------------------------------------- |
| `delta.<conf>`  | `spark.databricks.delta.properties.defaults.<conf>` |

For example, to set the `delta.appendOnly = true` property for all new Delta Lake tables created in a session, set the following:

```sql
SET spark.databricks.delta.properties.defaults.appendOnly = true
```

To modify table properties of existing tables, use [SET TBLPROPERTIES](#-table-properties).
