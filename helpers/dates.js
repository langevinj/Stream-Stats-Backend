//helper for creating valid dates out of parsed strings

//get the number of days in a given month, accounting for leap years
function getDaysInMonth(m, y){
    return m === 2 ? y & 3 || !(y % 25) && y & 15 ? 28 : 29 : 30 + (m + (m >> 3) & 1);
}

//given a string representing a month, return the correct int for that month
function monthInt(s){
    if(s === 'Jan' || s==='January') return 1;
    if(s === 'Feb' || s === 'February') return 2;
    if(s === 'Mar' || s === 'March') return 3;
    if(s === 'Apr' || s === 'April') return 4;
    if(s === 'May') return 5;
    if(s === 'Jun' || s === 'June') return 6;
    if(s === 'Jul' || s === 'July') return 7;
    if(s === 'Aug' || s === 'August') return 8;
    if(s === 'Sept' || s === 'September') return 9;
    if(s === 'Oct' || s === 'October') return 10;
    if(s === 'Nov' || s === 'November') return 11;
    if(s === 'Dec' || s === 'December') return 12;
}

//given a string date as provided by distrokid, return a valid date string for SQL
function distrokidDateConverter(dateString){
    let dateSplit = dateString.split(" ");
    let month = monthInt(dateSplit[0]);
    let daysInMonth = getDaysInMonth(month, parseInt(dateSplit[1]));

    let tempDate = new Date(`${daysInMonth} ${dateSplit[0]} ${dateSplit[1]}`);
    return tempDate.toISOString().split('T')[0];
}

module.exports = { distrokidDateConverter }