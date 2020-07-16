/*
----------------------------------------------------------------------------------------------------------------------
password generation tools
----------------------------------------------------------------------------------------------------------------------

USAGE EXAMPLE:

pass = PasswordGen.generate( 8, // length
	true, // use upper case
	true, // use lower case
	true, // use numbers
	true, // use special symbols like *, @
	PasswordGen.EPasswordType.eAllCharacters // mode of generation, see reference to EPasswordType
	);
*/

var PasswordGen = {}, utils;
PasswordGen.Utils = {};

PasswordGen.EPasswordType = 
{
	eAllCharacters : 1, // all characters will be used (if possible)
	eEasyToRead : 2, // characters like O, o, l, 1, I won't be used
	eEasyToSay : 3 // numbers and special symbols won't be used (to discuss - maybe this option is excessive as it can be achieved with other flags)
}

PasswordGen.Utils.LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
PasswordGen.Utils.LOWERCASE_EASYREAD = 'abcdefghjkmnpqrstuvwxyz';
PasswordGen.Utils.UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
PasswordGen.Utils.UPPERCASE_EASYREAD = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
PasswordGen.Utils.SPECIAL = '~@#$%^&*()_-+=';
PasswordGen.Utils.NUMBERS = '0123456789';
PasswordGen.Utils.NUMBERS_EASYREAD = '23456789';

PasswordGen.generate = function( length, uppercase, lowercase, numbers, special, passwordType )
{
	if( length <= 0 )
		return '';
	
	// weight is added for the future so it can change what characters will mostly be stored in password (maybe weights might be removed)
	let generatorArr = [];
	if( uppercase )
	{
		generatorString = ( passwordType == PasswordGen.EPasswordType.eEasyToRead ) ? PasswordGen.Utils.UPPERCASE_EASYREAD : PasswordGen.Utils.UPPERCASE;
		generatorArr.push( { val : generatorString, weight : 1 } );	
	}
	
	if( lowercase )
	{
		generatorString = ( passwordType == PasswordGen.EPasswordType.eEasyToRead ) ? PasswordGen.Utils.LOWERCASE_EASYREAD : PasswordGen.Utils.LOWERCASE;
		generatorArr.push( { val : generatorString, weight : 2 } );
	}
	
	if( special && passwordType != PasswordGen.EPasswordType.eEasyToSay )
	{
		generatorArr.push( { val : PasswordGen.Utils.SPECIAL, weight : 1 } );	
	}
	
	if( numbers && passwordType != PasswordGen.EPasswordType.eEasyToSay )
	{
		generatorString = ( passwordType == PasswordGen.EPasswordType.eEasyToRead ) ? PasswordGen.Utils.NUMBERS_EASYREAD : PasswordGen.Utils.NUMBERS;
		generatorArr.push( { val : generatorString, weight : 1 } );
	}
	
	if( generatorArr.length == 0 )
		return '';
	
	return PasswordGen.Utils.generate( generatorArr, length );
}

PasswordGen.Utils.generate = function( generatorArr, length )
{
	if( length <= 0 )
		return '';
	
	pass = '';
	combinedString = '';
	generatorArr.forEach( elem => combinedString += elem.val );
	
	remainingLength = length;
	
	// generate 1 symbol from each subset to guarantee password strength
	mandatoryCharacters = generatorArr.length;
	if( mandatoryCharacters <= length )
	{
		generatorArr.forEach( elem => pass += PasswordGen.Utils.charFrom( elem.val ) );
		remainingLength -= mandatoryCharacters;
	}
	
	while( remainingLength-- )
	{
		pass += PasswordGen.Utils.charFrom( combinedString );
	}
	
	return PasswordGen.Utils.shuffle( pass );
}

/**	
* Get random number in given range
*
* @param {Number} max   Maximum value
* @param {Number} [min] Minimum value, default: 0
* @returns {Number}
*/
PasswordGen.Utils.random = function( max, min ) 
{
	if( typeof( min ) == 'undefined' ) 
		min = 0;

	return Math.floor( Math.random() * ( max - min + 1 ) + min );
}

PasswordGen.Utils.charFrom = function( chars )
{
	if( chars.length <= 0 )
		return '';
	
	return chars.charAt( PasswordGen.Utils.random( chars.length - 1 ) );
}

// Fisher-Yates shuffle to prevent biased passwords
PasswordGen.Utils.shuffle = function( pass )
{
	retPass = pass.split( '' ); // workaround as string is immutable, we convert to array

	for( i = 0; i < retPass.length - 1; ++i )
	{
		randomIndex = PasswordGen.Utils.random( i + 1, pass.length - 1 );
		
		tmp = retPass[i];
		retPass[i] = retPass[randomIndex];
		retPass[randomIndex] = tmp;
	}
	
	return retPass.join('');
}

// ------------------------------------------------------------------------------------------------------------
// node.js exports for unit tests
// ------------------------------------------------------------------------------------------------------------

if( typeof module !== 'undefined' && module.exports )
{
	module.exports.generate = PasswordGen.generate;
	module.exports.EPasswordType = PasswordGen.EPasswordType;
}