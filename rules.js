
// RULES
// - no backquotes
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


// Block Splitter

// remove the JS single line comments
const removeSingleLineComments_js = oldLine => {
    return oldLine.replace(RegExp('//.*','g'),'');
};

// remove the JS multi-line comments
const removeMultiLineComments_js = block => {
    // Will remove the content but keep newlines inside the string
    const _keepNL = s => s.replace(RegExp('[^\n]','g'),'');
    return block.replace(/\/\*\*(.|\n)*?\*\*\//g,_keepNL);
}

// @return Block[] where Block { originalText: string, processText: string, lineNr: string }
const basicLineSplitter = metaBlock => {
    return metaBlock.split('\n')
        .map((x,i) => ({ 
            originalTxt: x,
            processTxt: x,
            lineNr: i,
        }));
};

// simpleRegExpRuleFactory returns an "rule" object, with a function and a message
const simpleRegExpRuleFactory = (name, regExpString, errorMessage) => {
    const rule = {};
    rule.name = name;
    rule.message = errorMessage;
    rule.process = block => {
        const errorList = [];
        pattern = new RegExp(regExpString);
        blockList = basicLineSplitter(block)
        for (let i=0; i< blockList.length; i++ ) {
            if (pattern.test(blockList[i].processTxt)) {
                errorList.push({
                    lineNr: blockList[i].lineNr,
                    errorLine: blockList[i].originalTxt,
                    errorMsg: errorMessage,
                })
            }
        }
        return errorList;
    }
    return rule;
}

const jsOperatorRule = {
    name: 'operatorspace',
    message: 'Not enough space around operators!',
    process: block => {
        // Building the operator rule little by little
        const js_operators = '(?:' + ['\\*', '\\/','%', '!==', '&&', '\\|\\|','<=','>=','=>',
            // Lt should not trigger if followed by equal
            '<(?!=)',
            // Gt should not trigger if after = (arrow func) or before = (gte)
            '(?<!=)>(?!=)',
            // Double-equal, as long as there is no '!' before or not triple-equal.
            '(?<!(\!|=))==(?!=)',
            // Plus should not be after a plus, nor before a plus, nor before an equal
            '(?<!\\+)\\+(?!(\\+|=))',
            // Minus should not be before a minus (or a digit, so that the unary minus doesn't trigger the rule)
            '-(?!(-|\\d))', 
            
            ].join('|') + ')';
        const js_operators_regexp = `(\\S${js_operators}\\S|\\s${js_operators}\\S|\\S${js_operators}\\s)`
        const operator_exceptions = new RegExp([].join('|'));

        const errorList = [];
        pattern = new RegExp(js_operators_regexp);
        lines = block.split('\n');
        for (let i=0; i< lines.length; i++ ) {
            if (pattern.test(lines[i])) {
            
                errorList.push({
                    lineNr: i,
                    errorLine: lines[i],
                    errorMsg: 'Not enough space around operators!'
                })
            }
        }
        return errorList
    },
}

const jsRules = {
    backquote: simpleRegExpRuleFactory('backquote', '`', 'Forbidden use of backquotes!'),
    doublequote: simpleRegExpRuleFactory('doublequote', '"', 'Forbidden use of double quotes in JS!') ,
    tripleequal: simpleRegExpRuleFactory('tripleequal', '===', 'No triple equals!'),
    space_inside_curlies: simpleRegExpRuleFactory('curlybrackets', '{\\S.*?\\S}|{\\S.*?\\s}|{\\s.*?\\S}', 'Space inside curly brackets!'),
    space_before_colon_objects: simpleRegExpRuleFactory('space_before_colon', '\\s:', 'No space before : in object properties!'),
    single_arg_no_paren: simpleRegExpRuleFactory('single paren', '\\( *\\w+ *\\) *=>', 'parenthesis around single parameter arrow function'),
    jsOperatorRule: jsOperatorRule,
};

const cssRules = {};
const htmlRules = {};

module.exports = {
    jsRules: jsRules,
    cssRules: cssRules,
    htmlRules: htmlRules,
    removeSingleLineComments_js: removeSingleLineComments_js,
    removeMultiLineComments_js: removeMultiLineComments_js,
};