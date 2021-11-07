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


// RULES
// - no backquotes
// DONE - only single quotes in JavaScript
// space around operators in expression (JS BLOCK)
// space around operators in an expression (HTML BLOCK)
// Issue a warning when the three equals are used
// White space inside {} for HTML expressions
// White space outside for IF and FOR
// No space around HTML = sign
// Trailing spaces (at end of line)
// No /* ... */ comments
// In HTML, no space between the end quote and the ">"
// Making sure functions have commented all the parameters (-> Not sure really needed)
// Missing semicolumns (? -> This one will be tricky!)

// 

// simpleRegExpRuleFactory returns an "rule" object, with a function and a message
const simpleRegExpRuleFactory = (regExpString, errorMessage) => {
    const rule = {};
    rule.message = errorMessage;
    rule.process = (block) => {
        const errorList = [];
        pattern = new RegExp(regExpString);
        lines = block.split('\n');
        for (let i=0; i< lines.length; i++ ) {
            if (pattern.test(lines[i])) {
                errorList.push({
                    lineNr: i,
                    errorLine: lines[i],
                })
            }
        }
        return errorList
    }
    return rule;
}

// Building the operator rule little by little
const js_operators = '[' + ['\\+','\\-', '\\*', '%','<','>' ].join() + ']';
const js_operators_regexp = `(\\w${js_operators}\\w | \\s${js_operators}\\w | \\w${js_operators}\\s)`
console.log(js_operators_regexp);

const jsRulesList = [
    simpleRegExpRuleFactory('`', 'Forbidden use of backquotes!'),
    simpleRegExpRuleFactory('"', 'Forbidden use of double quotes in JS!'),
    simpleRegExpRuleFactory(js_operators_regexp, 'Not enough space around operators!'),
];

const cssRulesList = [];

const { existsSync, readFileSync } = require("fs");

// argv[0] = node
// argv[1] = this script name
// argv[2] = the first actual parameter - file name and path
// argv[3] = the component name
if (process.argv.length < 4) {
    console.error('Not enough parameters!')
    console.log('usage: node riotliner.js <path-to-riot-file> <component-name>')
    return;
}

const componentName = process.argv[3];
const filePath = process.argv[2];
if (!existsSync(filePath) ) {
    console.error('Cannot find component file!')
    return;
}

const data = readFileSync(filePath, "utf8");
const filePattern = new RegExp( `(?<html_block>(.|\n)*?)<style>(?<css_block>(.|\n)*?)<\/style>(.|\n)*?<script>(?<js_block>(.|\n)*?)<\/script>`)

const parts = data.match(filePattern);
if (parts) {
    const cssBlock = parts.groups['css_block'];
    const jsBlock = parts.groups['js_block'];
    const htmlBlock = parts.groups['html_block'];
   // console.log('The css Block is:\n' + jsBlock);

    let errorList;
    let rule;
    for (let i=0; i<jsRulesList.length; i++) {
        rule = jsRulesList[i];
        errorList = rule.process(jsBlock);
        errorList.forEach(ruleError => {
            console.log(`\x1b[31m${rule.message}\x1b[0m:\n Line \x1b[33m${ruleError.lineNr}\x1b[0m:${ruleError.errorLine}`);
        });
    }

} else {
    console.log('File pattern not matched!')
}