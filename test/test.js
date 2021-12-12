const assert = require("assert");
const { jsRules } = require('../rules.js');
const should = require("chai").should();

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

    })

});