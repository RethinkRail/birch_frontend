const {format} = require('date-fns');

/**
 * Calculate difference between two dates , date must be in SQL format like 2023-01-01T00:00:00
 * @param latestTimeStamp
 * @param earlierTimeStamp
 */
export function differenceBetweenTwoTimeStamp(latestTimeStamp, earlierTimeStamp) {
    const latestDateTimeObject = new Date(latestTimeStamp)
    const earlierDateTimeObject = new Date(earlierTimeStamp)
    // Calculate the time difference in milliseconds
    const timeDifference = latestDateTimeObject - earlierDateTimeObject;
    // Convert the time difference to days, hours, minutes, and seconds
    const millisecondsInADay = 24 * 60 * 60 * 1000;
    const daysDifference = Math.floor(timeDifference / millisecondsInADay);
    const hoursDifference = Math.floor((timeDifference % millisecondsInADay) / (60 * 60 * 1000));
    const minutesDifference = Math.floor((timeDifference % (60 * 60 * 1000)) / (60 * 1000));
    const secondsDifference = Math.floor((timeDifference % (60 * 1000)) / 1000);
    return {
        "days": daysDifference,
        "hours": hoursDifference,
        "minutes": minutesDifference,
        "seconds": secondsDifference
    }
}

/**
 * Convert sql format date to mm-dd-yyyy format
 * @param sqlDateTime
 * @returns {string}
 */
export function convertSqlToFormattedDate(sqlDateTime) {
    const sqlDate = new Date(sqlDateTime);
    const localDateString = format(sqlDate, 'yyyy-MM-dd HH:mm:ss', {timeZone: 'America/Chicago'});
    const localDateTime = new Date(localDateString)
    // Get month, day, and year components
    var month = (localDateTime.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based, so add 1
    var day = localDateTime.getDate().toString().padStart(2, '0');
    var year = localDateTime.getFullYear();
    // Formatted date with two-digit month and day
    var formattedDate = month + '-' + day + '-' + year;
    return formattedDate;
}

/**
 *
 * @param sqlDateTime
 * @returns {string}
 */
export function convertSqlToFormattedDateTime(sqlDateTime) {
    const sqlDate = new Date(sqlDateTime);
    const localDateString = format(sqlDate, 'yyyy-MM-dd HH:mm:ss', {timeZone: 'America/Chicago'});
    const localDateTime = new Date(localDateString)
    // Get month, day, and year components
    var month = (localDateTime.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based, so add 1
    var day = localDateTime.getDate().toString().padStart(2, '0');
    var year = localDateTime.getFullYear();

    var hour = localDateTime.getHours().toString().padStart(2, '0');
    var minute = localDateTime.getMinutes().toString().padStart(2, '0');
    var second = localDateTime.getSeconds().toString().padStart(2, '0');
    // Formatted date with two-digit month and day
    var formattedDate = month + '-' + day + '-' + year + ' ' + hour + ':' + minute + ':' + second;
    return formattedDate;
}


export function addDays(sqlDateTime, daysToAdd) {
    // Convert SQL date to a Date object
    const sqlDate = new Date(sqlDateTime);

    // Calculate the time zone offset for 'America/Chicago'
    const timeZoneOffset = new Date().toLocaleString('en-US', {timeZone: 'America/Chicago'}).slice(-5);
    const [hoursOffset, minutesOffset] = timeZoneOffset.split(':').map(Number);
    const offsetInMilliseconds = (hoursOffset * 60 + minutesOffset) * 60 * 1000;

    // Adjust the date to the 'America/Chicago' time zone
    const localDateTime = new Date(sqlDate.getTime() - offsetInMilliseconds);

    // Add the specified number of days
    localDateTime.setDate(localDateTime.getDate() + daysToAdd);

    // Get month, day, and year components

    var month = (localDateTime.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based, so add 1
    var day = localDateTime.getDate().toString().padStart(2, '0');
    var year = localDateTime.getFullYear();

    var hour = localDateTime.getHours().toString().padStart(2, '0');
    var minute = localDateTime.getMinutes().toString().padStart(2, '0');
    var second = localDateTime.getSeconds().toString().padStart(2, '0');
    // Formatted date with two-digit month and day
    var formattedDate = month + '-' + day + '-' + year + ' ' + hour + ':' + minute + ':' + second;


    return formattedDate;
}

export function formatDateToSQL(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


export function toSqlDatetime(date) {
    const pad = (number) => (number < 10 ? '0' : '') + number;

    return date.getFullYear() + '-' +
        pad(date.getMonth() + 1) + '-' +
        pad(date.getDate()) + ' ' +
        pad(date.getHours()) + ':' +
        pad(date.getMinutes()) + ':' +
        pad(date.getSeconds());
}