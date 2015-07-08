jest.dontMock('../unformat');
var unformat = require('../unformat');

describe('unformat', function () {
	it('handles the general number format', function () {
		expect(unformat('12345', 'General')).toBe(12345);
		expect(unformat('123.45', 'General')).toBe(123.45);
		expect(unformat('-54321', 'General')).toBe(-54321);
		expect(unformat('-543.21', 'General')).toBe(-543.21);
	});

	it('handles number formats with 0s with or without decimal places', function () {
		expect(unformat('12345', '0')).toBe(12345);
		expect(unformat('123.45', '0.00')).toBe(123.45);
		expect(unformat('.12345', '.00000')).toBe(0.12345);
	});

	it('handles number formats with commas', function () {
		expect(unformat('12,345', '#,##0')).toBe(12345);
		expect(unformat('1,234.567', '#,##0.000')).toBe(1234.567);
	});

	it('handles number formats with percentages', function () {
		expect(unformat('12%', '0%')).toBe(0.12);
		expect(unformat('12.34%', '0.00%')).toBe(0.1234);
		expect(unformat('1,234.5%', '#,##0.0%')).toBe(12.345);
	});

	it('handles number formats with E+x notation', function () {
		expect(unformat('1.23E+2', '0.00E+0')).toBe(123);
		expect(unformat('1.23E+4%', '0.00E+0%')).toBe(123);
	});

	it('handles number formats with fractions', function () {
		expect(unformat('1234', '# ?/?')).toBe(1234);
		expect(unformat('1234/1', '?/?')).toBe(1234);
		expect(unformat('1234 1/2', '# ?/?')).toBe(1234.5);
		expect(unformat('2469/2', '?/?')).toBe(1234.5);
		expect(unformat('3/4', '# ?/?')).toBe(0.75);
		expect(unformat('1234  1/20', '# ??/??')).toBe(1234.05);
	});

	it('handles date formats', function () {
		expect(unformat('11-21-2036', 'mm-dd-yyyy')).toBe(50000);
		expect(unformat('11/21/36', 'm/d/yy')).toBe(50000);
		expect(unformat('10-28', 'm-d')).toBe(302);
		expect(unformat('Nov 21, 2036', 'mmm dd, yyyy')).toBe(50000);
		expect(unformat('November 21, 2036', 'mmmm dd, yyyy')).toBe(50000);
	});

	it('handles time formats', function () {
		expect(unformat('02:57:42', 'hh:mm:ss').toFixed(4)).toBe('0.1234');
		expect(unformat('33-42', 'mm-ss').toFixed(4)).toBe('0.0234');
		expect(unformat('01:37:38 PM', 'hh:mm:ss AM/PM').toFixed(4)).toBe('0.5678');
		expect(unformat('296:09:36', '[h]:mm:ss').toFixed(2)).toBe('12.34');
		expect(unformat('17769:36', '[mm]:ss').toFixed(2)).toBe('12.34');
		expect(unformat('296:17769', '[h]:[m]').toFixed(2)).toBe('12.34');
	});

	it('handles date and time formats', function () {
		expect(unformat('May 18, 1903 01:37:38 PM', 'mmm dd, yyyy hh:mm:ss AM/PM').toFixed(4)).toBe('1234.5678');
		expect(unformat('05-18-1903 29629:37:38', 'mm-dd-yyyy [h]:m:s').toFixed(4)).toBe('1234.5678');
	});

	it('handles date/time formats with arbitrary delimiters, including quoted blocks', function () {
		expect(unformat('11|21|2036', 'mm|dd|yyyy')).toBe(50000);
		expect(unformat('11test21test2036', 'mm"test"dd"test"yyyy')).toBe(50000);
		expect(unformat('11[21]2036', 'mm[dd]yyyy')).toBe(50000);
		expect(unformat('111121212036', 'mm"11"dd"21"yyyy')).toBe(50000);
		expect(unformat('11212036', 'mmddyyyy')).toBe(50000);
	});
});