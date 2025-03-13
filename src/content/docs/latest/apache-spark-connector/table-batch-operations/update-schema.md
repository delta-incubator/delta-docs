---
title: Update table schema
description: Instructions for updating a Delta table schema
---

Delta Lake lets you update the schema of a table. The following types of changes are supported:

- Adding new columns (at arbitrary positions)
- Reordering existing columns

You can make these changes explicitly using DDL or implicitly using DML.

> **Important**
>
> When you update a Delta table schema, streams that read from that table terminate. If you want the stream to continue you must restart it.

### Explicitly update schema

You can use the following DDL to explicitly change the schema of a table.

#### Add columns

```sql
ALTER TABLE table_name ADD COLUMNS (col_name data_type [COMMENT col_comment] [FIRST|AFTER colA_name], ...)
```

By default, nullability is `true`.

To add a column to a nested field, use:

```sql
ALTER TABLE table_name ADD COLUMNS (col_name.nested_col_name data_type [COMMENT col_comment] [FIRST|AFTER colA_name], ...)
```

##### Example

If the schema before running `ALTER TABLE boxes ADD COLUMNS (colB.nested STRING AFTER field1)` is:

```
- root
| - colA
| - colB
| +-field1
| +-field2
```

the schema after is:

```
- root
| - colA
| - colB
| +-field1
| +-nested
| +-field2
```

> **Note**
>
> Adding nested columns is supported only for structs. Arrays and maps are not supported.

#### Change column comment or ordering

```sql
ALTER TABLE table_name ALTER [COLUMN] col_name col_name data_type [COMMENT col_comment] [FIRST|AFTER colA_name]
```

To change a column in a nested field, use:

```sql
ALTER TABLE table_name ALTER [COLUMN] col_name.nested_col_name nested_col_name data_type [COMMENT col_comment] [FIRST|AFTER colA_name]
```

##### Example

If the schema before running `ALTER TABLE boxes CHANGE COLUMN colB.field2 field2 STRING FIRST` is:

```
- root
| - colA
| - colB
| +-field1
| +-field2
```

the schema after is:

```
- root
| - colA
| - colB
| +-field2
| +-field1
```

#### Replace columns

```sql
ALTER TABLE table_name REPLACE COLUMNS (col_name1 col_type1 [COMMENT col_comment1], ...)
```

##### Example

When running the following DDL:

```sql
ALTER TABLE boxes REPLACE COLUMNS (colC STRING, colB STRUCT<field2:STRING, nested:STRING, field1:STRING>, colA STRING)
```

if the schema before is:

```
- root
| - colA
| - colB
| +-field1
| +-field2
```

the schema after is:

```
- root
| - colC
| - colB
| +-field2
| +-nested
| +-field1
| - colA
```

#### Rename columns

> **Note**
>
> This feature is available in Delta Lake 1.2.0 and above. This feature is currently experimental.

To rename columns without rewriting any of the columns' existing data, you must enable column mapping for the table. See enable column mapping.

To rename a column:

```sql
ALTER TABLE table_name RENAME COLUMN old_col_name TO new_col_name
```

To rename a nested field:

```sql
ALTER TABLE table_name RENAME COLUMN col_name.old_nested_field TO new_nested_field
```

##### Example

When you run the following command:

```sql
ALTER TABLE boxes RENAME COLUMN colB.field1 TO field001
```

If the schema before is:

```
- root
| - colA
| - colB
| +-field1
| +-field2
```

Then the schema after is:

```
- root
| - colA
| - colB
| +-field001
| +-field2
```

#### Drop columns

> **Note**
>
> This feature is available in Delta Lake 2.0 and above. This feature is currently experimental.

To drop columns as a metadata-only operation without rewriting any data files, you must enable column mapping for the table. See enable column mapping.

> **Important**
>
> Dropping a column from metadata does not delete the underlying data for the column in files.

To drop a column:

```sql
ALTER TABLE table_name DROP COLUMN col_name
```

To drop multiple columns:

```sql
ALTER TABLE table_name DROP COLUMNS (col_name_1, col_name_2)
```

#### Change column type or name

You can change a column's type or name or drop a column by rewriting the table. To do this, use the `overwriteSchema` option:

##### Change a column type

```python
spark.read.table(...) \
  .withColumn("birthDate", col("birthDate").cast("date")) \
  .write \
  .format("delta") \
  .mode("overwrite")
  .option("overwriteSchema", "true") \
  .saveAsTable(...)
```

##### Change a column name

```python
spark.read.table(...) \
  .withColumnRenamed("dateOfBirth", "birthDate") \
  .write \
  .format("delta") \
  .mode("overwrite") \
  .option("overwriteSchema", "true") \
  .saveAsTable(...)
```

### Automatic schema update

Delta Lake can automatically update the schema of a table as part of a DML transaction (either appending or overwriting), and make the schema compatible with the data being written.

#### Add columns

Columns that are present in the DataFrame but missing from the table are automatically added as part of a write transaction when:

- `write` or `writeStream` have `.option("mergeSchema", "true")`
- `spark.databricks.delta.schema.autoMerge.enabled` is `true`

When both options are specified, the option from the `DataFrameWriter` takes precedence. The added columns are appended to the end of the struct they are present in. Case is preserved when appending a new column.

#### `NullType` columns

Because Parquet doesn't support `NullType`, `NullType` columns are dropped from the DataFrame when writing into Delta tables, but are still stored in the schema. When a different data type is received for that column, Delta Lake merges the schema to the new data type. If Delta Lake receives a `NullType` for an existing column, the old schema is retained and the new column is dropped during the write.

`NullType` in streaming is not supported. Since you must set schemas when using streaming this should be very rare. `NullType` is also not accepted for complex types such as `ArrayType` and `MapType`.
