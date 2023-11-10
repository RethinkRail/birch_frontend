/**
 * Calculate difference between two dates , date must be in SQL format like 2023-01-01T00:00:00
 * @param latestTimeStamp
 * @param earlierTimeStamp
 */
export function differenceBetweenTwoTimeStamp(latestTimeStamp,earlierTimeStamp) {
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
    return {"days":daysDifference,"hours":hoursDifference,"minutes":minutesDifference,"seconds":secondsDifference}
}

/**
 * Convert sql format date to mm/dd/yyyy format
 * @param sqlDateTime
 * @returns {string}
 */
export function convertSqlToFormattedDate(sqlDateTime) {
    // Create a Date object from the SQL date time string
    var sqlDate = new Date(sqlDateTime);
    var month = sqlDate.getMonth() + 1; // Months are zero-based, so add 1
    var day = sqlDate.getDate();
    var year = sqlDate.getFullYear();
    var formattedDate = month + '/' + day + '/' + year;
    return formattedDate;
}