---
title: Table metadata
description: Instructions for exploring table metadata
---

Delta Lake has rich features for exploring table metadata.

It supports `SHOW COLUMNS` and `DESCRIBE TABLE`.

It also provides the following unique commands:

- [**DESCRIBE DETAIL**](#describe-detail)
- [**DESCRIBE HISTORY**](#describe-history)

## DESCRIBE DETAIL

Provides information about schema, partitioning, table size, and so on. For details, see [Retrieve Delta table details](delta-utility.html#-delta-detail).

## DESCRIBE HISTORY

Provides provenance information, including the operation, user, and so on, and operation metrics for each write to a table. Table history is retained for 30 days. For details, see [Retrieve Delta table history](delta-utility.html#-delta-history).
