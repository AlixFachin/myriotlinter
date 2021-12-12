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
 
const { existsSync, readFileSync } = require("fs");
const RUN_MODE = 'PROD';

const lintRules = require('./rules');

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
    const jsRulesList = lintRules.jsRules;

    if (codeBlocks.jsBlock !== '') {
        // Globally, we remove the single line comments from the JS Code
        codeBlocks.jsBlock = lintRules.removeSingleLineComments_js(codeBlocks.jsBlock);
        // Globally, we remove the multi-line comments
        codeBlocks.jsBlock = lintRules.removeMultiLineComments_js(codeBlocks.jsBlock);

        for (let rule of Object.values(jsRulesList)) {
            errorList = errorList.concat(rule.process(codeBlocks.jsBlock));
        }
    }
    // Sorting the error list by line number
    errorList.sort((e1, e2) => e1.lineNr - e2.lineNr );
    // Displaying error list
    errorList.forEach(ruleError => {
        console.log(`\x1b[31m${ruleError.errorMsg}\x1b[0m:\n \x1b[33m${ruleError.lineNr}\x1b[0m:${ruleError.errorLine}`);
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

