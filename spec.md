# Spec: `download-apidocs` Script

## Goal

Provide a command-line utility (`npm run download-apidocs <version>`) that:

1. Reads a version alias (e.g., `latest`) from CLI args.
2. Maps the alias to a real API docs version using the `config.apidocs` field in `package.json`.
3. Downloads a corresponding artifact (`<version>.zip`) from GitHub Releases.
4. Extracts the contents of the archive into the `public/api/<version>` directory.

---

## Configuration

The script relies on the `config.apidocs` block in `package.json` for mapping aliases to real versions:

```json
"config": {
  "apidocs": {
    "latest": "v4.0.0",
    "v3": "v3.3.2",
    "v2": "v2.4.0"
  }
}
```

---

## Usage

```bash
npm run download-apidocs <alias>
```

Where `<alias>` is one of:
- `latest`
- `v3`
- `v2`

---

## Expected Output

After running:

```bash
npm run download-apidocs latest
```

If `latest` maps to `v4.0.0`:

- **Download URL:**  
  `https://github.com/<OWNER>/<REPO>/releases/download/v4.0.0/v4.0.0.zip`

- **Extracted to:**  
  `public/api/v4.0.0/`

- **File structure:**  
  ```
  public/
    api/
      v4.0.0/
        index.html
        assets/
          ...
  ```

---

## Requirements

1. **Input Validation**
   - Must reject if no alias is provided.
   - Must reject if alias does not exist in `package.json` config.

2. **Environment Variable Parsing**
   - Must resolve `npm_package_config_apidocs_<alias>` to get the real version.

3. **Download Logic**
   - Must download `https://github.com/<OWNER>/<REPO>/releases/download/<version>/<version>.zip`.

4. **Extraction Logic**
   - Must unzip the archive to `public/api/<version>` using `unzip` or `unzip -o`.

5. **Idempotence**
   - Should delete the target folder if it already exists before extraction (or overwrite).

6. **Error Handling**
   - Must fail clearly on:
     - Invalid alias
     - Missing or inaccessible archive
     - Extraction failure

---

## Optional Enhancements

- Support caching downloads to `.cache/` to avoid repeated downloads.
- Allow specifying a GitHub repo via ENV or CLI flag.
- Add `--force` to overwrite without prompt.
- Allow downloading multiple versions at once.
