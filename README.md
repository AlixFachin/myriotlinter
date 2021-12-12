# My Riot.js linter 🤓

This repo contains a little script (done in JavaScript / node) which will read a `riot.js` file and detect some simple formatting errors according to a set of hard-coded rules.

## Objective

This script is meant to be very light-weight and relatively limited.
For something more ambitious, please use `es-lint` and its extension for Riot.

## How does it work

The script takes the following parameters

- The component name
- The file path to this component

It does expect the riot file to be composed of the following blocks:

```
HTML BLOCK
<style>
CSS BLOCK
</style>
<script>
JS BLOCK
</script>
```

The script will apply a different set of rules for the HTML block, the CSS block and the JS block.

## Global Architecture

The file goes through the following steps:

1. It is read and split into various "meta-blocks": the HTML block, the JS block, the CSS block, given that each file part should obey different rules. (files with `.js` extensions do have to obey only one rule)
1. Each rule contains the following:
   - A "splitter/filter" which cuts the meta-block into smaller blocks. Each rule can have a different way to divise parsing (e.g. line by line, or cutting into more efficient logical units)
   - The same splitting function will remove the non-code parts of the code which could mess with the rules (mainly comments and string literals)
   - Then a rule processes the meta-block and returns an array of errors.
1. The array of errors for all the rules are concatenated and then sorted, so that the display can be done from line order ascending.

### Object structure

1. `rule`

```ts
    type rule = {
        name: String; // rule name (used for indexing maybe)
        message: String; // error message which will be displayed in case of error
        process:  String => Error[]; // Function which parses a meta-block (e.g. JS Block) and returns an array of Errors
    }
```

1. `Error`

```ts
type Error = {
  // Indicator displayed near error message which will help the user finding the error. Can be a number or a range of. ('36','24-26')
  lineNr: String;
  errorLine: String; // Original line code, displayed after the error message so that the user can see what this is about
  errorMsg: String; // Actual error message (e.g. 'Double quotes forbidden!!!')
};
```

## Rules Applied
