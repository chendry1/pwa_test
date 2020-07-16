/*
----------------------------------------------------------------------------------------------------------------------
password ranking tools
----------------------------------------------------------------------------------------------------------------------

Tools to check how strong password is

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
NOTE: currently it only support latin letters
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

USAGE EXAMPLE: 
rank = PasswordRank.rank( myPassword ); // rank 0-100

USAGE EXAMPLE (in case if we want rank from 0 to 8: 
rank = PasswordRank.rank( myPassword, 8 ); // rank 0-8
*/

/*
we calculate rank using these rules
rules set are obtained here:
https://www.codeproject.com/Articles/59186/Password-Strength-Control-2

Additions
In the additions section of the code, we add to the overall score for things which make the password 'good'. In my code, we check the following:

Score += (Password Length *4)
Score += ((Password Length - Number of Upper Case Letters)*2)
Score += ((Password Length - Number of Lower Case Letters)*2)
Score += (Number of Digits * 4)
Score += (Number of Symbols * 6)
Score += (Number of Digits or Symbols in the Middle of the Password) * 2
If (Number of Requirements Met > 3) then Score += (Number of Requirements Met * 2)
Requirements are:

Password Length >= 8
Contains Uppercase Letters (A-Z)
Contains Lowercase Letters (a-z)
Contains Digits (0-9)
Contains Symbols (Char.IsSymbol(ch) or Char.IsPunctuation(ch))

---------------------------------------------------------------------------------------------------------------------------------------------------------------

Deductions
In the deductions section of the code, we subtract from the overall score for things which make the password 'weak'. In my code, we check the following:

IF Password is all letters THEN Score -= (Password length)
IF Password is all digits THEN Score -= (Password length)
IF Password has repeated characters THEN Score -= (Number of repeated characters * (Number of repeated characters -1)
IF Password has consecutive uppercase letters THEN Score -= (Number of consecutive uppercase characters * 2)
IF Password has consecutive lowercase letters THEN Score -= (Number of consecutive lowercase characters * 2)
IF Password has consecutive digits THEN Score -= (Number of consecutive digits * 2)
IF Password has sequential letters THEN Score -= (Number of sequential letters * 3) E.g.: ABCD or DCBA.
IF Password has sequential digits THEN Score -= (Number of sequential digits * 3) E.g.: 1234 or 4321. 
IF Password has widesread words THEN Score -= (Number of words) * 10
*/

var PasswordRank = {}, utils;
PasswordRank.Utils = {};

PasswordRank.Utils.LOWERCASELETTERS = new Set( 'abcdefghijklmnopqrstuvwxyz'.split( '' ) );
PasswordRank.Utils.UPPERCASELETTERS = new Set( 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split( '' ) );
PasswordRank.Utils.SPECIALCHARS = new Set( '~@#$%^&*()_-+='.split( '' ) );
PasswordRank.Utils.NUMBERS = new Set( '0123456789'.split( '' ) );

PasswordRank.rank = function( pass, scale, statsFunc )
{
	if( pass.length == 0 )
		return 0;
	
	// statsFunc is added to be able to mock function
	if( typeof( statsFunc ) == 'undefined' )
	{
		statsFunc = PasswordRank.Utils.calculateStringStats;
	}
	
	// we calculate counting 1 time so there won't be unnecessary letter counting (less lags in JS)
	letterCounts = statsFunc( pass );
	
	positiveRank = PasswordRank.Utils.calcPositiveRank( pass, letterCounts );
	negativeRank = PasswordRank.Utils.calcNegativeRank( pass, letterCounts );
	
	rank = positiveRank - negativeRank;
	
	if( rank > 100 )
		rank = 100;
	
	if( rank < 0 )
		rank = 0;
	
	if( typeof( scale ) != 'undefined' )
	{
		rank = Math.round( ( scale / 100.0 ) * rank );
	}
	
	return rank;
}

PasswordRank.Utils.calcPositiveRank = function( pass, letterCounts )
{
	positiveRank = 0;
	if( pass.length == 0 )
		return 0;
	
	// Score += (Password Length *4)
	positiveRank += pass.length * 4;
	
	// Score += ((Password Length - Number of Upper Case Letters)*2)
	positiveRank += ( pass.length - letterCounts.upperCaseLetters ) * 2;
	
	// Score += ((Password Length - Number of Lower Case Letters)*2)
	positiveRank += ( pass.length - letterCounts.lowerCaseLetters ) * 2;
	
	//Score += (Number of Digits * 4)
	positiveRank += letterCounts.numbers * 4;
	
	//Score += (Number of Symbols * 6)
	positiveRank += letterCounts.specialChars * 6;
	
	// Score += (Number of Digits or Symbols in the Middle of the Password) * 2
	positiveRank += letterCounts.notLeadingOrTrailingSpecialCharsOrNumbers * 2;
	
	//If (Number of Requirements Met > 3) then Score += (Number of Requirements Met * 2)
	requirementsMet = PasswordRank.Utils.requirementsMet( pass, letterCounts );
	if( requirementsMet > 3 )
		positiveRank += requirementsMet * 2;

	// commented for fast debugging possibility
	//console.log( 'pos rank', positiveRank, pass );

	return positiveRank;
}

PasswordRank.Utils.calcNegativeRank = function( pass, letterCounts )
{
	negativeRank = 0;
	if( pass.length == 0 )
		return 100; // we diminish rank if password is empty
	
	//IF Password is all letters THEN Score -= (Password length)
	if( letterCounts.numbers == 0 && letterCounts.specialChars == 0 )
		negativeRank += pass.length;
	
	//IF Password is all digits THEN Score -= (Password length)
	if( letterCounts.lowerCaseLetters == 0 && letterCounts.specialChars == 0 && letterCounts.upperCaseLetters == 0 )
		negativeRank += pass.length;
	
	//IF Password has repeated characters THEN Score -= (Number of repeated characters * (Number of repeated characters -1)
	negativeRank += letterCounts.repeatedChars * ( letterCounts.repeatedChars - 1 );
	
	//IF Password has consecutive uppercase letters THEN Score -= (Number of consecutive uppercase characters * 2)
	negativeRank += letterCounts.consecutiveUpperCaseLetters * 2;
	
	//IF Password has consecutive lowercase letters THEN Score -= (Number of consecutive lowercase characters * 2)
	negativeRank += letterCounts.consecutiveLowerCaseLetters * 2;
	
	//IF Password has consecutive digits THEN Score -= (Number of consecutive digits * 2)
	negativeRank += letterCounts.consecutiveNumbers * 2;
	
	//IF Password has sequential letters THEN Score -= (Number of sequential letters * 3) E.g.: ABCD or DCBA.
	negativeRank += letterCounts.sequentialLetters * 3;
	
	//IF Password has sequential digits THEN Score -= (Number of sequential digits * 3) E.g.: 1234 or 4321. 	
	negativeRank += letterCounts.sequentialNumbers * 3;
	
	//IF Password has widesread words THEN Score -= (Number of words) * 10
	negativeRank += letterCounts.words * 10;
	
	// commented for fast debugging possibility
	//console.log( 'negative rank', negativeRank, pass );
	
	return negativeRank;
}

PasswordRank.Utils.requirementsMet = function( pass, letterCounts )
{
	requirementsMet = 0;
	
	// Password Length >= 8
	if( pass.length >= 8 )
		++requirementsMet;
	
	if( letterCounts.lowerCaseLetters >= 1 )
		++requirementsMet;
	
	if( letterCounts.upperCaseLetters >= 1 )
		++requirementsMet;
	
	if( letterCounts.numbers >= 1 )
		++requirementsMet;
	
	if( letterCounts.specialChars >= 1 )
		++requirementsMet;
	
	return requirementsMet;
}

PasswordRank.Utils.ESymbolType = 
{
	eLowerCase : 1, 
	eUpperCase : 2, 
	eNumber : 3,
	eSpecial: 4
};

var widespreadWords = 
[
	"pass",
	"word",
	"admin",
	"pwd",
	"user"
];

PasswordRank.Utils.processSequence = function( sequenceObj, curSequenceType, isSequencial )
{
	if( isSequencial )
	{
		if( sequenceObj.sequenceType == curSequenceType )
		{
			return 1;
		}
		else
		{
			// sequence start
			sequenceObj.sequenceType = curSequenceType;
			return 2;
		}
	}
	else
	{
		sequenceObj.sequenceType = 0;
		return 0;
	}	
}

// it calculates count of symbols found in password
PasswordRank.Utils.calculateStringStats = function( pass )
{
	stats = 
	{
		lowerCaseLetters : 0,
		upperCaseLetters : 0,
		numbers : 0,
		specialChars : 0,
		
		// consecutive means that the same type characters are repeating, e. g. "afd", "AFD", "813"
		// we don't take in account first symbol to reduce penalty, e. g. "jsd" will result consecutiveLowerCaseLetters == 2
		// "jsdd37" will result consecutiveLowerCaseLetters == 3, consecutiveNumbers == 1
		consecutiveUpperCaseLetters: 0, 
		consecutiveLowerCaseLetters: 0,
		consecutiveNumbers: 0,
		
		notLeadingOrTrailingSpecialCharsOrNumbers: 0,
		
		repeatedChars: 0,
		
		sequentialLetters: 0, // sequential same letters, e. g. "ABC" or "CBA"
		sequentialNumbers: 0,
		
		words: 0 // widespread words in password such as pass, pwd, admin
	}

	previousCharType = 0;
	previousChar = '';
	
	repeatDict = {};
	
	// var to calculate count of characters in sequence correctly
	sequence = 
	{
		sequenceType: 0
	};
	
	for( i = 0; i < pass.length; ++i )
	{
		insideString = ( i > 0 && i < pass.length - 1 ) ? true : false;
		
		ch = pass[i];
		
		// calculate repeating characters
		if( isNaN( repeatDict[ch] ) )
		{
			repeatDict[ch] = 1;
		}
		else
		{
			if( repeatDict[ch] == 1 )
				stats.repeatedChars += 1; // add first found character to statistics
			
			repeatDict[ch] = repeatDict[ch] + 1;
			stats.repeatedChars += 1;
		}
		
		if( PasswordRank.Utils.LOWERCASELETTERS.has( ch ) )
		{
			stats.lowerCaseLetters += 1;
			
			if( previousCharType == PasswordRank.Utils.ESymbolType.eLowerCase )
				stats.consecutiveLowerCaseLetters += 1;
			
			stats.sequentialLetters +=
				PasswordRank.Utils.processSequence( sequence, PasswordRank.Utils.ESymbolType.eLowerCase, previousCharType == PasswordRank.Utils.ESymbolType.eLowerCase && PasswordRank.Utils.checkIfSequential( ch, previousChar ) );
			
			previousCharType = PasswordRank.Utils.ESymbolType.eLowerCase;
		}
		
		if( PasswordRank.Utils.UPPERCASELETTERS.has( ch ) )
		{
			stats.upperCaseLetters += 1;
			
			if( previousCharType == PasswordRank.Utils.ESymbolType.eUpperCase )
				stats.consecutiveUpperCaseLetters += 1;
			
			stats.sequentialLetters += 
				PasswordRank.Utils.processSequence( sequence, PasswordRank.Utils.ESymbolType.eUpperCase, previousCharType == PasswordRank.Utils.ESymbolType.eUpperCase && PasswordRank.Utils.checkIfSequential( ch, previousChar ) );
			
			previousCharType = PasswordRank.Utils.ESymbolType.eUpperCase;
		}

		if( PasswordRank.Utils.SPECIALCHARS.has( ch ) )
		{
			stats.specialChars += 1;
			
			if( insideString )
				stats.notLeadingOrTrailingSpecialCharsOrNumbers += 1;
			
			previousCharType = PasswordRank.Utils.ESymbolType.eSpecial;
			sequenceType = 0;
		}

		if( PasswordRank.Utils.NUMBERS.has( ch ) )
		{
			stats.numbers += 1;
			
			if( previousCharType == PasswordRank.Utils.ESymbolType.eNumber )
				stats.consecutiveNumbers += 1;
			
			if( insideString )
				stats.notLeadingOrTrailingSpecialCharsOrNumbers += 1;

			stats.sequentialNumbers += 
				PasswordRank.Utils.processSequence( sequence, PasswordRank.Utils.ESymbolType.eNumber, previousCharType == PasswordRank.Utils.ESymbolType.eNumber && PasswordRank.Utils.checkIfSequential( ch, previousChar ) );			

			previousCharType = PasswordRank.Utils.ESymbolType.eNumber;
		}

		previousChar = ch;
	}
	
	passLower = pass.toLowerCase();
	for( word of widespreadWords )
	{
		if( passLower.search( word ) != -1 )
			stats.words += 1;
	}
	
	return stats;
}

// keys located on keyboard for letters (currently we do not take in account symbols and numbers on keyboard)
var sequentialKeyboardLetters = [
	['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
	['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '' ],
	['z', 'x', 'c', 'v', 'b', 'n', 'm', '',  '',  '' ]
];

// map for fast find letter location
let sequentialMap = new Map();
for( var r = 0; r < sequentialKeyboardLetters.length; ++r )
{
	var curRow = sequentialKeyboardLetters[r];
	for( var c = 0; c < curRow.length; ++c )
	{
		ch = curRow[c];
		if( ch != '' )
			sequentialMap.set( ch, { row: r, col: c } );
	}
}

PasswordRank.Utils.checkIfKeyboardNeighbour = function( cur, prev )
{
	upper = false;
	if( cur == cur.toUpperCase() && prev == prev.toUpperCase() ) // if uppercase
		upper = true;
	
	curTmp = ( upper ) ? cur.toLowerCase() : cur;
	prevTmp = ( upper ) ? prev.toLowerCase() : prev;
	
	indicies = sequentialMap.get( curTmp );
	if( typeof( indicies ) == 'undefined' )
		return false;
	
	if( indicies.row > 0 )
		if( sequentialKeyboardLetters[indicies.row - 1][indicies.col] == prevTmp )
			return true;
	
	if( indicies.row < sequentialKeyboardLetters.length - 1 )
		if( sequentialKeyboardLetters[indicies.row + 1][indicies.col] == prevTmp )
			return true;

	if( indicies.col > 0 )
		if( sequentialKeyboardLetters[indicies.row][indicies.col - 1] == prevTmp )
			return true;
		
	if( indicies.col < sequentialKeyboardLetters[indicies.row].length - 1 )
		if( sequentialKeyboardLetters[indicies.row][indicies.col + 1] == prevTmp )
			return true;

	return false;
}

PasswordRank.Utils.checkIfSequential = function( cur, prev )
{
	// case for "09" and "90"
	if( cur == '9' && prev == '0' || cur == '0' && prev == '9' )
		return true;
	
	if( PasswordRank.Utils.checkIfKeyboardNeighbour( cur, prev ) )
		return true;

	
	curCode = cur.charCodeAt( 0 );
	prevCode = prev.charCodeAt( 0 );
	
	diff = Math.abs( curCode - prevCode ); // both cases of "21" or "12" will be sequential
	
	return ( diff == 1 ) ? true : false;
}

// ------------------------------------------------------------------------------------------------------------
// node.js exports for unit tests
// ------------------------------------------------------------------------------------------------------------

if( typeof module !== 'undefined' && module.exports )
{
	module.exports.rank = PasswordRank.rank;
	module.exports.calculateStringStats = PasswordRank.Utils.calculateStringStats;
}