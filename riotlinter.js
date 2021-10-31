// Will browse the file 

// Objectives:
// Having a set of rules (CSS rules, Javascript Rules)
// The linter will look at the blocks line by line, and then call all the rules 
// on each line.
// The linter will keep track of all the errors, and display them at the end of the process
// For each error,
//  -> Displays the rule error message (e.g. "Missing semicolon")
//  -> Displays the line (and maybe the line before / the line after)
//  AFTER -> Displays the original line number (so that we can find the mistake afterwards)
// A rule -> A function which returns "true" if there is a match 

// having a "getLineNumber" which looks for the line number of a given expression inside a file

// RULES
// - no backquotes
// only single quotes in JavaScript
// space around operators in expression (HTML and JS)
// Issue a warning when the three equals are used
// White space inside {} for HTML expressions
// White space outside for IF and FOR
// No space around HTML = sign
// Trailing spaces (at end of line)
// No /* ... */ comments
// In HTML, no space between the end quote and the ">"
// Making sure functions have commented all the parameters (-> Not sure really needed)
// Missing semicolumns (? -> This one will be tricky!)

const noBackQuote = (block) => {
    const errorList = [];
    lines = block.split('\n');
    pattern = new RegExp("`");
    for (line of lines) {
        if (pattern.test(line)) {
            errorList.push(line);
        } 
    }
    return errorList;
};
noBackQuote.message = 'Forbidden use of backquotes!:';

const noDoubleQuote = (block) => {
    const errorList = [];
    lines = block.split('\n');
    pattern = new RegExp("`");
    for (line of lines) {
        if (pattern.test(line)) {
            errorList.push(line);
        }
    }
    return errorList;
}

const jsRulesList = [
    noBackQuote,
];

const cssRulesList = [];

const { existsSync, readFileSync } = require("fs");

// argv[0] = node
// argv[1] = this script name
// argv[3] = the first actual parameter
if (process.argv.length < 3) {
    console.error('Not enough parameters!')
    return;
}

const componentName = process.argv[2];
const filePath = `./src/${componentName}.riot`
if (!existsSync(filePath) ) {
    console.error('Cannot find component file!')
    return;
}

const data = readFileSync(filePath, "utf8");
const filePattern = new RegExp( `<style>(?<css_block>(.|\n)*?)<\/style>(.|\n)*?<script>(?<js_block>(.|\n)*?)<\/script>`)

const parts = data.match(filePattern);
if (parts) {
    const cssBlock = parts.groups['css_block'];
    const jsBlock = parts.groups['js_block'];
   // console.log('The css Block is:\n' + jsBlock);

    let errorList = [];
    for (let rule of jsRulesList) {
        errorList = rule(jsBlock);
        errorList.forEach(wrongLine => {
            console.log(`${rule.message}:\n${wrongLine}`);
        });
    }

} else {
    console.log('File pattern not matched!')
}