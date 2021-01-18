/** Tests for help methods
 *      run tests like 'jest dates.test.js'
 */

const { distrokidDateConverter, monthInt, getDaysInMonth } = require("../helpers/dates.js");

describe("getDaysInMonth", function(){
    it("should return the last numerical day of a month given month and year as integers", function() {
        expect(getDaysInMonth(2, 1899)).toBe(28);
        expect(getDaysInMonth(6, 2004)).toBe(30);

        //should catch leap years
        expect(getDaysInMonth(2, 1920)).toBe(29);
        expect(getDaysInMonth(2, 2296)).toBe(29);
    });
});