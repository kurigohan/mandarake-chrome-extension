var testDetails = '[nakano Store]マックスファクトリー　figma　ペルソナ３　アイギス　未開封・箱イタミ not opened';
var testKeys = ['kuriSU makise', '"nakano store" alter saber', 'utsunomiya "クスファクトリー　fi" ペルソナ figma store', '開封・箱イタミ figure', 'nak se'];

var compareTestCase = {
    run: function () {
        console.log('Starting test...')
        console.log('Test details: ' + testDetails);
        compareTestCase.oneWord();
		compareTestCase.capitalize();
        compareTestCase.phrase();
        compareTestCase.exact();
        compareTestCase.foreign();
        compareTestCase.literal();
        compareTestCase.noOrder();
        compareTestCase.specialChar();
        compareTestCase.exclude();
    },
    oneWord: function () {
        var keyT = 'nakano';
        var keyF = 'sapporo';
        var failed = {};
        if(compare(testDetails, splitKey(keyT)) == false)
            failed['keyT'] = keyT;
        if(compare(testDetails, splitKey(keyF)) == true)
            failed['keyF'] = keyF;
        if(Object.keys(failed).length > 0)
        {
            console.log('One Word: FAILED');
            console.log(failed);
        }
        else
            console.log('One Word: PASSED');
        console.log('----------------------');
    },
    
    phrase: function () {
        var keyT1 = 'nakano store figma';
        var keyT2 = 'マックスファクトリー アイギス 未開封・';
        var keyF1 = 'sapporo store figma';
        var keyF2 = 'ックスフナエ ック';
        var failed = {};
        if(compare(testDetails, splitKey(keyT1)) == false)
            failed['keyT1'] = keyT1;
        if(compare(testDetails, splitKey(keyT2)) == false)
            failed['keyT2'] = keyT2;
        if(compare(testDetails, splitKey(keyF1)) == true)
            failed['keyF1'] = keyF1;
         if(compare(testDetails, splitKey(keyF2)) == true)
            failed['keyF2'] = keyF2;
        if(Object.keys(failed).length > 0)
        {
            console.log('Phrase: FAILED');
            console.log(failed);
        }
        else
            console.log('Phrase: PASSED');
        console.log('----------------------');
    },
    foreign: function () {
        var keyT = 'アイギス';
        var keyF = 'ナナエ';
        var failed = {};
        if(compare(testDetails, splitKey(keyT)) == false)
            failed['keyT'] = keyT;
        if(compare(testDetails, splitKey(keyF)) == true)
            failed['keyF'] = keyF;
        if(Object.keys(failed).length > 0)
        {
            console.log('Foreign: FAILED');
            console.log(failed);
        }
        else
            console.log('Foreign: PASSED');
        console.log('----------------------');

    },
    literal: function () {
        var keyT1 = '\'マックスファクトリー　figma\'';
        var keyT2 = '"nakano store"';
        var keyT3 = '"ペルソナ３　アイギス　未開封・箱"'
        var keyF1 = '"nakano stre"';
        var keyF2 = '\'nakano figma\'';
        var failed = {};
        if(compare(testDetails, splitKey(keyT1)) == false)
            failed['keyT1'] = keyT1;
        if(compare(testDetails, splitKey(keyT2)) == false)
            failed['keyT2'] = keyT2;
        if(compare(testDetails, splitKey(keyT3)) == false)
            failed['keyT3'] = keyT3;
        if(compare(testDetails, splitKey(keyF1)) == true)
            failed['keyF1'] = keyF1;
        if(compare(testDetails, splitKey(keyF2)) == true)
            failed['keyF2'] = keyF2;
        if(Object.keys(failed).length > 0)
        {
            console.log('Literal: FAILED');
            console.log(failed);
        }
        else
            console.log('Literal: PASSED');
        console.log('----------------------');
    },
    
    exact: function () {
        var keyT = testDetails;
        var keyF = testDetails + 'hello';
        var failed = {};
        if(compare(testDetails, splitKey(keyT)) == false) 
            failed['keyT'] = keyT;
        if(compare(testDetails,splitKey(keyF)) == true)
            failed['keyF'] = keyF;
        if(Object.keys(failed).length > 0)
        {
            console.log('Exact: FAILED');
            console.log(failed);
        }
        else
            console.log('Exact: PASSED');
        console.log('----------------------');
    },

    noOrder: function () {
        var keyT1 = 'figma "nakano store"';
        var keyT2 = 'nakano figma store';
        var keyF1 = 'nakano figma figure';
        var keyF2 = '"store nakano" figma"';
        var failed = {};
        if(compare(testDetails, splitKey(keyT1)) == false)
            failed['keyT1'] = keyT1;
        if(compare(testDetails, splitKey(keyT2)) == false)
            failed['keyT2'] = keyT2;
        if(compare(testDetails, splitKey(keyF1)) == true)
            failed['keyF1'] = keyF1;
        if(compare(testDetails, splitKey(keyF2)) == true)               
            failed['keyF2'] = keyF2;
        if(Object.keys(failed).length > 0)
        {
            console.log('No Order: FAILED');
            console.log(failed);
        }
        else
            console.log('No Order: PASSED');
        console.log('----------------------');
    },
    specialChar: function(){
        var keyT1 = '[ ]';
        var keyT2 = '３';
        var keyF1 = '【';
        var keyF2 = '&';
        var failed = {};
        if(compare(testDetails, splitKey(keyT1)) == false)
            failed['keyT1'] = keyT1;
        if(compare(testDetails, splitKey(keyT2)) == false)
            failed['keyT2'] = keyT2;
        if(compare(testDetails, splitKey(keyF1)) == true)
            failed['keyF1'] = keyF1;
        if(compare(testDetails, splitKey(keyF2)) == true)               
            failed['keyF2'] = keyF2;
        if(Object.keys(failed).length > 0)
        {
            console.log('Special Char: FAILED');
            console.log(failed);
        }
        else
            console.log('Special Char: PASSED');
        console.log('----------------------');
        
    },
	
	 capitalize: function(){
        var keyT1 = 'FIGMA';
        var keyT2 = '"NaKaNO STORE"';
        var failed = {};
        if(compare(testDetails, splitKey(keyT1)) == false)
            failed['keyT1'] = keyT1;
        if(compare(testDetails, splitKey(keyT2)) == false)
            failed['keyT2'] = keyT2;
        if(Object.keys(failed).length > 0)
        {
            console.log('Capitalize: FAILED');
            console.log(failed);
        }
        else
            console.log('Capitalize: PASSED');
        console.log('----------------------');
    },
    
    exclude: function(){
        var keyT1 = 'figma |test|';   
        var keyT2 = 'nakano |未開イタミ|';
        var keyF1 = 'nakano |アイギス|';
        var keyF2 = '|nakano store|';
        var failed = {};
        if(compare(testDetails,splitKey(keyT1)) == false)
            failed['keyT1'] = keyT1;
        if(compare(testDetails,splitKey(keyT2)) == false)
            failed['keyT2'] = keyT2;
        if(compare(testDetails,splitKey(keyF1)) == true)
            failed['keyF1'] = keyF1;
        if(compare(testDetails,splitKey(keyF2)) == true)
            failed['keyF2'] = keyF2;        
        if(Object.keys(failed).length > 0)
        {
            console.log('Exclude: FAILED');
            console.log(failed);
        }
        else
            console.log('Exclude: PASSED');
        console.log('----------------------');
            
        
    }

}

    function splitKey( key) {
        var newKey = key.toLowerCase().match(/[^"'\s\|]+|"[^"]+"|'[^']+'|\|[^\|]+\|/g);
        for (var j = 0; j < newKey.length; ++j) {
            newKey[j] = newKey[j].replace(/["']/g, '').replace(/\s{2,}|[\n\t]/g, ' ');
        }
         console.log(newKey);
        return newKey;

    }

    function compare(details, key) {
        for (var j = 0; j < key.length; ++j) {
            if(key[j].charAt(0) == '|'){
                if(details.toLowerCase().indexOf(key[j].substring(1, key[j].length-1)) > -1)
                    return false;
            }
            else if(details.toLowerCase().indexOf(key[j]) == -1){
                    return false;
            }
        }
        return true;
    }


compareTestCase.run();