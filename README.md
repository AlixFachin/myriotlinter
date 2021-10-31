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
