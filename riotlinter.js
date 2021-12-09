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
// DONE - space around operators in expression (JS BLOCK)
// space around operators in an expression (HTML BLOCK)
// DONE - Issue a warning when the three equals are used
// White space inside {} for HTML expressions
// White space outside for IF and FOR
// No space around HTML = sign
// Trailing spaces (at end of line)
// No /* ... */ comments
// In HTML, no space between the end quote and the ">"
// Making sure functions have commented all the parameters (-> Not sure really needed)
// Missing semicolumns (? -> This one will be tricky!)
// Detecting identifiers declared nowhere??? (Tricky! Need to really build the tree and environments???)
// 
const { existsSync, readFileSync } = require("fs");
const RUN_MODE = 'PROD';

function logger(s, color='black', level='PROD') {
    let colorCode = '';
    const colorBlack = '\x1b[0m';
    switch(color) {
        case 'red':
            colorCode = '\x1b[31m';
            break;
        case 'blue':
            colorCode = '\x1b[34m';
            break;
        case 'green':
            colorCode = '\x1b[32m';
            break;
        case 'yellow':
            colorCode = '\x1b[33m';
            break;
        default:
            colorCode = '\x1b[0m';
    }
    
    let shouldDisplay = RUN_MODE == 'TEST' || (RUN_MODE == 'PROD' && level == 'PROD');
    
    if (shouldDisplay) {
        console.log(colorCode + s + colorBlack);
    }
}

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
const js_operators_regexp = `(\\S${js_operators}\\S|\\s${js_operators}\\S|\\S${js_operators}\\s)`



const jsRulesList = [
    simpleRegExpRuleFactory('`', 'Forbidden use of backquotes!'),
    simpleRegExpRuleFactory('"', 'Forbidden use of double quotes in JS!'),
    simpleRegExpRuleFactory('===', 'Warking - make sure to use the triple equal wisely'),
    simpleRegExpRuleFactory(js_operators_regexp, 'Not enough space around operators!'),
];

const cssRulesList = [];
const htmlRulesList = [];

function getBlocks(fileData, componentName) {
    const result = {
        cssBlock: '',
        htmlBlock: '',
        jsBlock: '',
        status: '',
    }

    // For Riot Files, the <script> tag is optional
    const filePattern = new RegExp( '(?<html_block>(.|\n)*?)<style(.|\n)*?>(?<css_block>(.|\n)*?)<\/style>(.|\n)*?<script>(?<js_block>(.|\n)*?)<\/script>')
    const parts = fileData.match(filePattern);
    const filePattern2 = new RegExp('(?<html_block>(.|\n)*?)<style(.|\n)*?>(?<css_block>(.|\n)*?)<\/style>(?<js_block>(.|\n)*?)<\/' + componentName +'>')

    if (parts) {
        result.cssBlock = parts.groups['css_block'];
        result.jsBlock = parts.groups['js_block'];
        result.htmlBlock = parts.groups['html_block'];
        result.status = 'OK';
        return result;
    } else {
        // Trying the second pattern 
        let parts2 = fileData.match(filePattern2)
        if (parts2) {
            result.cssBlock = parts2.groups['css_block'];
            result.jsBlock = parts2.groups['js_block'];
            result.htmlBlock = parts2.groups['html_block'];
            result.status = 'OK';
            return result;
        } else {
            logger('Cannot match pattern for file ','red')
            return result;
        }
    }
}

function checkFile(fileName, componentName='') {
    
    const data = readFileSync(fileName, "utf-8");
    let codeBlocks;

    logger('Looking at file ' + fileName, 'yellow');

    // Deciding the process according to the file type
    if (fileName.endsWith('.tag') || fileName.endsWith('.riot')) {
        let pureFileName = fileName.split('/').pop();
        pureFileName = pureFileName.substring(0,pureFileName.indexOf('.'));
        codeBlocks = getBlocks(data, componentName ? componentName : pureFileName );
    } else if (fileName.endsWith('.js')) {
        codeBlocks = {
            cssBlock: '',
            htmlBlock: '',
            jsBlock: data,
            status: 'OK',
        }
    } else {
        logger('Cannot find File ' + fileName, 'red');
        return;
    }

    if (codeBlocks.status !== 'OK') {
        return;
    }

    let errorList = [];
    let rule;
    if (codeBlocks.jsBlock !== '') {
        for (let i=0; i<jsRulesList.length; i++) {
            rule = jsRulesList[i];
            // TO DO -> Concatenate everything in order to display the errors in the regular order
            errorList = errorList.concat(rule.process(codeBlocks.jsBlock));
        }
    }
    // Sorting the error list by line number
    errorList.sort((e1, e2) => e1.lineNr - e2.lineNr );
    // Displaying error list
    errorList.forEach(ruleError => {
        console.log(`\x1b[31m${rule.message}\x1b[0m:\n Line \x1b[33m${ruleError.lineNr}\x1b[0m:${ruleError.errorLine}`);
    });
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

// argv[0] = node
// argv[1] = this script name
// argv[2] = the first actual parameter - file name and path
// argv[3] = the component name
if (process.argv.length < 3) {
    console.error('Not enough parameters!')
    console.log('usage: node riotliner.js <path-to-riot-file> <Optional:component-name>')
    return;
}

const componentName = process.argv[3];
const filePath = process.argv[2];

if (!existsSync(filePath) ) {
    console.error('Cannot find component file!')
    return;
}

if (filePath.endsWith('.tag') || filePath.endsWith('.riot') || filePath.endsWith('.js') ) {
    checkFile(filePath, componentName);
} else if (filePath.endsWith('.txt')) {
    const data = readFileSync(filePath, "utf-8");
    const lineSeparated = data.split('\n');
    if (lineSeparated[0].trim() === '#LINTBATCH') {
        for (let i=1; i<lineSeparated.length; i++) {
            if (lineSeparated[i].trim() !== '') {
                checkFile(lineSeparated[i].trim());
            }
        }
    } else {
        logger('File format not recognized!', 'red');
    }
}

