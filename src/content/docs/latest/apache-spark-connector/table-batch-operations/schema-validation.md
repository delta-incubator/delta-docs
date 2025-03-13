---
title: Schema validation
description: Instructions for validating a Delta table schema
---

Delta Lake automatically validates that the schema of the DataFrame being written is compatible with the schema of the table. Delta Lake uses the following rules to determine whether a write from a DataFrame to a table is compatible:

- All DataFrame columns must exist in the target table. If there are columns in the DataFrame not present in the table, an exception is raised. Columns present in the table but not in the DataFrame are set to null.
- DataFrame column data types must match the column data types in the target table. If they don't match, an exception is raised.
- DataFrame column names cannot differ only by case. This means that you cannot have columns such as "Foo" and "foo" defined in the same table. While you can use Spark in case sensitive or insensitive (default) mode, Parquet is case sensitive when storing and returning column information. Delta Lake is case-preserving but insensitive when storing the schema and has this restriction to avoid potential mistakes, data corruption, or loss issues.

Delta Lake support DDL to add new columns explicitly and the ability to update schema automatically.

If you specify other options, such as `partitionBy`, in combination with append mode, Delta Lake validates that they match and throws an error for any mismatch. When `partitionBy` is not present, appends automatically follow the partitioning of the existing data.
