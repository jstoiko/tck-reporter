# tck-reporter
HTML reports generator for Test Compatibility Kits (e.g. [raml-org/raml-tck](https://github.com/raml-org/raml-tck), [asyncapi/tck](https://github.com/asyncapi/tck)).

## Installation
```sh
$ npm install -g postatum/tck-reporter
```

## Usage
1. Generate JSON reports with tck runner (not provided in this repo).

2. Point `tck-reporter` to generated JSON reports directory and provide other required arguments/options:

```
Usage: tck-reporter [options] <jsonReportsDir> <outputHtmlDir>

Generate HTML reports from TCK JSON reports.

Options:
  --repoBranchUrl <url>  Github repo branch blob url. Is used to generate tck test files links. To produce valid links it
                         must have format: "https://github.com/USER/REPO/blob/BRANCH"
  -h, --help             display help for command
```

## Input JSON structure
The tool expects input JSON reports to have the following structure:

```json
{
  "parser": {
    "language": "go",
    "name": "jumpscale",
    "url": "https://github.com/Jumpscale/go-raml/tree/master/raml",
    "version": "0.1"
  },
  "results": [
    {
      "file": "/tests/raml-1.0/Root/version/invalid-version-structure.raml",
      "success": false,
      "error": "Error parsing RAML:\n  line 4: string value cannot be of type mapping, must be string\n"
    },
    {
      "file": "/tests/raml-1.0/Root/version/valid.raml",
      "success": true,
      "error": ""
    },
    ...
  ]
}
```
