const { assert } = require("mocha");
const { jsRules, htmlRules  } = require('../rules.js');
const { removeSingleLineComments_js, removeMultiLineComments_js, reduceStringLiterals_js, removeInsideBrackets } = require('../rules.js')
const { should } = require("chai").should();

describe('JS Rules', () => {
    describe('BackQuote tests', () => {
        const backquote = jsRules.backquote;
        
        it('should be OK with single quotes and double quotes', () => {
            backquote.process.should.not.be.undefined;
            backquote.process.should.be.a('function');
            
            let errorList;
            errorList = backquote.process('This \'should be allowed\' ');
            errorList.should.deep.equal([]);
            errorList = backquote.process('This \"should be allowed\" ');
            errorList.should.deep.equal([]);
            errorList = backquote.process('This \`should not be allowed\` ');
            errorList.should.not.deep.equal([]);
            errorList[0].errorLine.should.not.be.undefined;
            errorList[0].errorMsg.should.not.be.undefined;
            errorList[0].lineNr.should.equal(0);
            
        })
    });

    describe('Double quote tests', () => {
        const doublequote = jsRules.doublequote;

        it('Should have rule testing properties', () => {
            doublequote.process.should.not.be.undefined;
            doublequote.process.should.be.a('function');
        });

        it('Should trigger error only with doublequotes', () => {
            let errorList;
            errorList = doublequote.process('let x = \'string\'');
            errorList.should.deep.equal([]);
            errorList = doublequote.process('let x = \"first\";');
            errorList.should.not.deep.equal([]);
            errorList[0].errorLine.should.not.be.undefined;
            errorList[0].errorMsg.should.not.be.undefined;
            errorList[0].lineNr.should.equal(0);
        });
    });

    describe('Triple equal tests', () => {
        const tripleequal = jsRules.tripleequal;

        it('Should have rule testing properties', () => {
            tripleequal.process.should.not.be.undefined;
            tripleequal.process.should.be.a('function');
        });

        it('Should trigger error only with doublequotes', () => {
            let errorList;
            errorList = tripleequal.process('if (x == y) {}');
            errorList.should.deep.equal([]);
            errorList = tripleequal.process('if (x === y) {}');
            errorList.should.not.deep.equal([]);
            errorList[0].errorLine.should.not.be.undefined;
            errorList[0].errorMsg.should.not.be.undefined;
            errorList[0].lineNr.should.equal(0);
        });
    });

    describe('Space inside curlies', () => {
        const curlyRule = jsRules.space_inside_curlies;

        it('Should trigger only with object curlies', () => {
            let errorList;
            errorList = curlyRule.process('return { myvalue: 3 };');
            errorList.should.deep.equal([]);
            errorList = curlyRule.process('return {myvalue: 3 };');
            errorList.should.not.deep.equal([]);
            errorList = curlyRule.process('return { myvalue: 3};');
            errorList.should.not.deep.equal([]);
            errorList = curlyRule.process('return {myvalue: 3};');
            errorList.should.not.deep.equal([]);
            errorList = curlyRule.process('return ({myvalue: 3});');
            errorList.should.not.deep.equal([]);
        })

    });
    
    describe('Space before colon in objects', () => {
        const colonRule = jsRules.space_before_colon_objects;

        it('Should trigger only with object curlies', () => {
            let errorList;
            errorList = colonRule.process('return { myvalue: 3 };');
            errorList.should.deep.equal([]);
        });
        it('Space on both sides of colon', () => {
            errorList = colonRule.process('return { myvalue : 3 };');
            errorList.should.not.deep.equal([]);
        });
        it('Space only before', () => {
                errorList = colonRule.process('return { myvalue :3};');
                errorList.should.not.deep.equal([]);
        });
        it('No space on either side of the stuff', () => {
            errorList = colonRule.process('return { myvalue:3};');
            errorList.should.deep.equal([]);
        });
        xit('Should not raise error in case of ternary op', () => {
            errorList = colonRule.process('return x == y ? 2 : 3;');
            errorList.should.deep.equal([]);
        });

    });

    describe('Space around operators', () => {
        const spaceRule = jsRules.jsOperatorRule;

        let errorList;
        // +, -, *, %, <, >, ==, !==, &&, ||, <=, >=, =>, ++, +=, -=, *=
        it('Should work with +', () => {
            errorList = spaceRule.process('let x = 1 + 3;');
            errorList.should.deep.equal([]);
            errorList = spaceRule.process('let x = 1+ 3;');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('let x = 1 +3;');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('let x = 1+3;');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('for (let i = 0; i < 3; i++)');
            errorList.length.should.equal(0);
            errorList = spaceRule.process('x += 3;');
            errorList.length.should.equal(0);
            
        });
        
        it('Test with - operator', () => {
            errorList = spaceRule.process('let x = 1 - 3;');
            errorList.should.deep.equal([]);
            errorList = spaceRule.process('let x = 1- 3;');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('let x = a -b;');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('let x = a-b;');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('let x = -3;');
            errorList.length.should.equal(0);
            errorList = spaceRule.process('for (let i =10; i > 0; i--');
            errorList.length.should.equal(0);
        });

        it('Test with * operator', () => {
            errorList = spaceRule.process('let x = 1 * 3;');
            errorList.should.deep.equal([]);
            errorList = spaceRule.process('let x = 1* 3;');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('let x = 1 *3;');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('let x = 1*3;');
            errorList.length.should.equal(1);
        });

        it('Test with / operator', () => {
            errorList = spaceRule.process('let x = 1 / 3;');
            errorList.should.deep.equal([]);
            errorList = spaceRule.process('let x = 1/ 3;');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('let x = 1 /3;');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('let x = 1/3;');
            errorList.length.should.equal(1);
        });

        it('Test with % operator', () => {
            errorList = spaceRule.process('let x = 1 % 3;');
            errorList.should.deep.equal([]);
            errorList = spaceRule.process('let x = 1% 3;');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('let x = 1 %3;');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('let x = 1%3;');
            errorList.length.should.equal(1);
        });

        it('Test with !== operator', () => {
            errorList = spaceRule.process('if ( a !== b )');
            errorList.should.deep.equal([]);
            errorList = spaceRule.process('if ( a !==b )');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('if ( a!== b )');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('if ( a!==b )');
            errorList.length.should.equal(1);
        });

        it('Test with <= operator', () => {
            errorList = spaceRule.process('if ( a <= b )');
            errorList.should.deep.equal([]);
            errorList = spaceRule.process('if ( a <=b )');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('if ( a<= b )');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('if ( a<=b )');
            errorList.length.should.equal(1);
        });
        
        it('Test with >= operator', () => {
            errorList = spaceRule.process('if ( a >= b )');
            errorList.should.deep.equal([]);
            errorList = spaceRule.process('if ( a >=b )');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('if ( a>= b )');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('if ( a>=b )');
            errorList.length.should.equal(1);
        });

        it('Test with == operator', () => {
            errorList = spaceRule.process('if ( a == b )');
            errorList.should.deep.equal([]);
            errorList = spaceRule.process('if ( a ==b )');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('if ( a== b )');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('if ( a==b )');
            errorList.length.should.equal(1);
            // The different operator shouldn't trigger error
            errorList = spaceRule.process('if ( a !== b )');
            errorList.length.should.equal(0);
            // Triple-equal shouldn't trigger error (at least not in *this* rule...)
            errorList = spaceRule.process('if ( a === b )');
            errorList.length.should.equal(0);
        });

        it('Test with && logical operator', () => {
            errorList = spaceRule.process('if ( x && y )');
            errorList.should.deep.equal([]);
            errorList = spaceRule.process('if ( x&& y )');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('if ( x &&y )');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('if ( x&&y )');
            errorList.length.should.equal(1);
        });
        
        it('Test with || logical operator', () => {           
            errorList = spaceRule.process('if ( x && y )');
            errorList.should.deep.equal([]);
            errorList = spaceRule.process('if ( x&& y )');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('if ( x &&y )');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('if ( x&&y )');
            errorList.length.should.equal(1);
        });

        it('Test with => arrow function', () => {
            errorList = spaceRule.process('let add2 = (x,y) => x + y');
            errorList.should.deep.equal([]);
            errorList = spaceRule.process('let add2 = (x,y)=> x + y');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('let add2 = (x,y) =>x + y');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('let add2 = (x,y)=>x + y');
            errorList.length.should.equal(1);
        })

    });

    describe('Parenthesis with single parameter arrow func', () => {
        const spaceRule = jsRules.single_arg_no_paren;
        let errorList;

        it('Should not trigger if there are no parens', () => {
            errorList = spaceRule.process('let square = x => x*x;');
            errorList.should.deep.equal([]);
            errorList = spaceRule.process('let square = x => {');
            errorList.should.deep.equal([]);
            errorList = spaceRule.process('let square = (x => x*x);');
            errorList.should.deep.equal([]);
        })

        it('should trigger when there is one identifier and paren', () => {
            errorList = spaceRule.process('let square = (x) => x*x');
            errorList.length.should.equal(1);
            // Let's try any number of spaces combinations...
            errorList = spaceRule.process('let square = ( x) => x*x');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('let square = (x ) => x*x');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('let square = ( x ) => x*x');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('let square = ( x)=> x*x');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('let square = (x )=> x*x');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('let square = ( x )=> x*x');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('let square = (x)=> x*x');
            errorList.length.should.equal(1);
            errorList = spaceRule.process('let square = ((x) => x*x');
            errorList.length.should.equal(1);
        })

    });

    describe('Testing the filtering of single line comments', () => {

        it('Should remove the double slashes and nothing else', () => {
            let source = '// Adding 3\nlet x = 3\nlet y = 4 // and this';
            let filtered = removeSingleLineComments_js(source);
            filtered.should.equal('\nlet x = 3\nlet y = 4 ');
        })

    });

    describe('Testing the filtering of multi line comments', () => {

        it('Should remove the comments and keep the rest', () => {
            let source = 'let x = 3;\n/** This is a comment\nThis is also a comment\n**/\nlet y = 4;';
            let filtered = removeMultiLineComments_js(source);
            filtered.should.equal('let x = 3;\n\n\n\nlet y = 4;');
        });
        
        it('Case of two comments', () => {
            let source = 'let x = 3;\n/** This is a comment\nThis is also a comment\n**/\nlet y = 4;\n';
            let filtered = removeMultiLineComments_js(source + source);
            filtered.should.equal('let x = 3;\n\n\n\nlet y = 4;\nlet x = 3;\n\n\n\nlet y = 4;\n');
        });

        it('Case of something on the same line than comment ends', () => {
            let source = 'let x = 3;\n/** This is a comment\nThis is also a comment\n**/let a = b+c;\nlet y = 4;\n';
            let filtered = removeMultiLineComments_js(source);
            filtered.should.equal('let x = 3;\n\n\nlet a = b+c;\nlet y = 4;\n');
        });

    });

    describe('Testing the reducing of single string literals', () => {
        it('Should remove the single strings but keep for meaning', () => {
            let result = reduceStringLiterals_js("let x = 'This is me!'");
            result.should.equal("let x = ''");
        });
        it('Test two string literals', () => {
            let result = reduceStringLiterals_js("let x = 'This is me!' + c + 'And this one!'");
            result.should.equal("let x = '' + c + ''");
        });
        it('Test escaped singlestring', () => {
            let result = reduceStringLiterals_js("let x = 'Doesn\\\'t it?'");
            result.should.equal("let x = ''");
        });

    });

});

describe('HTML Rules', () => {
    describe('Filtering of JS Block', () => {
        it ('Should remove single line brackets', () => {
            let result = removeInsideBrackets('<mytag style={ x === y ? "width:100%;" : "width:50%;" }> </mytag>');
            result.should.equal('<mytag style={}> </mytag>')
        });
        it ('Should remove multiple line brackets', () => {
            let result = removeInsideBrackets('<mytag style={ x === y ? \n"width:100%;" \n: "width:50%;" }> </mytag>');
            result.should.equal('<mytag style={\n\n}> </mytag>')
        });
        it ('Should deal with several brackets', () => {
            let result = removeInsideBrackets('<mytag style={ x === y ? \n"width:100%;" \n: "width:50%;" }> </mytag>');
            result.should.equal('<mytag style={\n\n}> </mytag>')
        });

    });
    
    describe('No spaces around the equal sign', () => {
        const space_equal_rule = htmlRules.space_equal_rule;

        it('Should trigger for wrong spacing', () => {
            space_equal_rule.process.should.not.be.undefined;
            space_equal_rule.process.should.be.a('function');

            let errorList;
            errorList = space_equal_rule.process('<mytag style="width:100%;"> </mytag>');
            errorList.should.deep.equal([]);
            errorList = space_equal_rule.process('<mytag style= "width:100%;"> </mytag>');
            errorList.length.should.equal(1);
            errorList = space_equal_rule.process('<mytag style ="width:100%;"> </mytag>');
            errorList.length.should.equal(1);
            errorList = space_equal_rule.process('<mytag style = "width:100%;"> </mytag>');
            errorList.length.should.equal(1);
        });
        
        xit('Rule should not trigger when = is inside JS expressions', () => {
            let errorList;
            errorList = space_equal_rule.process('<mytag style={ x === y ? "width:100%;" : "width:50%;" }> </mytag>');
            errorList.length.should.equal(0);
        })

    })

});