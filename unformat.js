var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var monthOffsets = {
	'Jan' : 0,
	'Feb' : 31,
	'Mar' : 59,
	'Apr' : 90,
	'May' : 120,
	'Jun' : 151,
	'Jul' : 181,
	'Aug' : 212,
	'Sep' : 243,
	'Oct' : 273,
	'Nov' : 304,
	'Dec' : 334
}
var firstLetterToMonth = {
	'J' : 'Jan',
	'F' : 'Feb',
	'M' : 'Mar',
	'A' : 'Apr',
	'S' : 'Sep',
	'O' : 'Oct',
	'N' : 'Nov',
	'D' : 'Dec'
}

function isLeapYear(y) {
	if (y === 1900) {
		return true; // Not really but...
	} else if (y % 4 !== 0) {
		return false;
	} else if (y % 100 !== 0) {
		return true;
	} else if (y % 400 !== 0) {
		return false;
	} else {
		return true;
	}
}

function dateToInt(m, d, y) {
	var result = 0;

	var year = parseInt(y, 10);
	if (y.length === 2) {
		var now = (new Date()).getFullYear();
		var currCent = parseInt(Math.floor(now / 100) + y, 10);
		var lastCent = currCent - 100;
		var nextCent = currCent + 100;

		var minDist = Math.abs(currCent - now);
		year = currCent

		if (Math.abs(lastCent - now) < minDist) {
			minDist = Math.abs(lastCent - now);
			year = lastCent;
		}

		if (Math.abs(nextCent - now) < minDist) {
			year = nextCent;
		}
	}

	for (var i = 1900; i < year; i++) {
		result += (isLeapYear(i)? 366 : 365);
	}

	if (isNaN(parseInt(m, 10))) {
		if (m.length === 1) {
			month = firstLetterToMonth[m];
		} else {
			month = m.slice(0, 3);
		}
	} else {
		month = months[parseInt(m, 10) - 1];
	}

	result += monthOffsets[month];

	if (month !== 'Jan' && month !== 'Feb' && isLeapYear(year)) {
		result++;
	}

	result += parseInt(d);

	return result;
}

function timeToInt(h, m, s, ampm) {
	var result = 0;
	var hrs = parseInt(h, 10);
	if (ampm) {
		hrs = hrs%12 + (ampm.toLowerCase() === 'pm'? 12 : 0);
	}
	result += hrs / 24;
	result += parseInt(m, 10) / 1440;
	result += parseInt(s, 10) / 86400;
	return result;
}

function unformatDateAndTime(input, format) {
	var matchTypes = [];
	var regex = '';
	var formatParts = format.split(new RegExp('(d+|\\[?hh?\\]?|mmm+|\\[?mm?\\]?|\\[?ss?\\]?|y+|AM/PM)'));
	var clearLevel = 0;

	formatParts.forEach(function (code, i) {
		if (code === 'mmmmm') {
			matchTypes.push('month');
			regex += '([JFMASOND])';
		} else if (/^mmmm+$/.test(code)) {
			matchTypes.push('month');
			regex += '(January|February|March|April|May|June|July|August|September|October|November|December)';
		} else if (code === 'mmm') {
			matchTypes.push('month');
			regex += '(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)';
		} else if (/^\[?m+\]?$/.test(code)) {
			if (/^\[m+\]$/.test(code)) {
				matchTypes.push('minute');
				regex += '(\\d+)';
				if (clearLevel < 2) {
					clearLevel = 2;
				}
			} else {
				var isMonth = true;
				var j = i;			
				while (j > 0 && !/^[dhsy]+$/.test(formatParts[j])) {
					j--;
				}
				if (/^[hs]+$/.test(formatParts[j])) {
					isMonth = false;
				}
				j = i;
				while (j < formatParts.length - 1 && !/^[dhsy]+$/.test(formatParts[j])) {
					j++;
				}
				if (/^[hs]+$/.test(formatParts[j])) {
					isMonth = false;
				}

				if (isMonth) {
					matchTypes.push('month');
					regex += (code === 'mm'? '([01]\\d)' : '(1?\\d)');
				} else {
					matchTypes.push('minute');
					regex += (code === 'mm'? '([0-5]\\d)' : '([1-5]?\\d)');
				}
			}
		} else if (code === 'dd') {
			matchTypes.push('day');
			regex += '([0-3]\\d)';	
		} else if (code === 'd') {
			matchTypes.push('day');
			regex += '([1-3]?\\d)';
		} else if (/^yyy+$/.test(code)) {
			matchTypes.push('year');
			regex += '(\\d\\d\\d\\d)';
		} else if (/^y+$/.test(code)) {
			matchTypes.push('year');
			regex += '(\\d\\d)';
		} else if (/\[?hh?\]?/.test(code)) {
			matchTypes.push('hour');
			if (/^\[h+\]$/.test(code)) {
				regex += '(\\d+)';
				if (clearLevel < 1) {
					clearLevel = 1;
				}
			} else if (code === 'hh') {
				regex += '([0-2]\\d)';
			} else {
				regex += '([1-2]?\\d)';
			} 
		} else if (/\[?ss?\]?/.test(code)) {
			matchTypes.push('second');
			if (/^\[s+\]$/.test(code)) {
				regex += '(\\d+)';
				clearLevel = 3;
			} else if (code === 'ss') {
				regex += '([0-5]\\d)';
			} else {
				regex += '([1-5]?\\d)';
			} 
		} else if (code === 'AM/PM') {
			matchTypes.push('ampm');
			regex += '([AP]M)';
		} else {
			regex += code.replace(/[\\\+\^\$\*\?\.\[\]\(\)\{\}\|]/g, function (match) { return '\\' + match; });
		}
	});

	regex = new RegExp(regex);
	var matches = regex.exec(input);

	var month, day, year, hour, minute, second, ampm;
	matchTypes.forEach(function (t, i) {
		switch (t) {
			case 'month':
				month = matches[i + 1];
				break;
			case 'day':
				day = matches[i + 1];
				break;
			case 'year':
				if (!year || year.length === 2) {
					year = matches[i + 1];
				}
				break;
			case 'hour':
				hour = matches[i + 1];
				break;
			case 'minute':
				minute = matches[i + 1];
				break;
			case 'second':
				second = matches[i + 1];
				break;
			case 'ampm':
				ampm = matches[i + 1];
				break;
			default:
				console.log('Unexpected match type: ' + t);
		}
	});

	if (clearLevel > 0) {
		month = 'Jan';
		day = '00';
		year = '1900';
	}

	if (clearLevel > 1) {
		hour = '0';
	}

	if (clearLevel > 2) {
		minute = '0';
	}

	return dateToInt(month || 'Jan', day || '00', year || '1900') + timeToInt(hour || '0', minute || '0', second || '0', ampm);
}

function unformat(inputRaw, formatRaw) {
	if (formatRaw.toLowerCase() === 'general') {
		return parseFloat(inputRaw, 10);
	} else {
		var format = formatRaw;
		var input = inputRaw;

		if (formatRaw.match(/"[^"]*"/g)) {
			formatRaw.match(/"[^"]*"/g).forEach(function (literal) {
				format = format.replace(literal, '');
				input = input.replace(literal.replace(/"/g, ''), '');
			});
		}

		if (/^(?:#(?:,##)?)?0*\.?0*(?:E\+)?0*%?$/.test(format)) {
			var formattedNumber = /\d*\.?\d*(?:E\+)?\d*%?/.exec(input.replace(',', ''))[0];
			if (/%$/.test(formattedNumber)) {
				return parseFloat(formattedNumber.replace('%', ''), 10) / 100;
			} else {
				return parseFloat(formattedNumber, 10);
			}
		} else if (/^(?:#\s)?\?+\/\?+$/.test(format)) {
			var wholePart = (/^#\s/.test(format) && /\d+\s\d*\/?\d*/.test(input))? parseInt(input.match(/^\d+/), 10) : 0;
			var fractionPart = /(\d+)(?:\/(\d+))?$/.exec(input);
			var numerator = fractionPart? parseInt(fractionPart[1]) : 0;
			var denominator = fractionPart[2]? parseInt(fractionPart[2]) : 1;
			return wholePart + numerator / denominator;
		} else {
			return unformatDateAndTime(input, format);
		}
	}
}

module.exports = unformat;