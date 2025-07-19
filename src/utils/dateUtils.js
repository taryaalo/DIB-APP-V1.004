// DIB-APP-V1.003-main/src/utils/dateUtils.js

const monthMap = {
    'jan': '01', 'january': '01', 'يناير': '01',
    'feb': '02', 'february': '02', 'فبراير': '02',
    'mar': '03', 'march': '03', 'مارس': '03',
    'apr': '04', 'april': '04', 'أبريل': '04',
    'may': '05', 'مايو': '05',
    'jun': '06', 'june': '06', 'يونيو': '06',
    'jul': '07', 'july': '07', 'يوليو': '07',
    'aug': '08', 'august': '08', 'أغسطس': '08',
    'sep': '09', 'september': '09', 'سبتمبر': '09',
    'oct': '10', 'october': '10', 'أكتوبر': '10',
    'nov': '11', 'november': '11', 'نوفمبر': '11',
    'dec': '12', 'december': '12', 'ديسمبر': '12'
};

export const normalizeDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') {
        return null;
    }

    // Handles formats like "1952-يناير-01" or "01 January 1952"
    const parts = dateString.split(/[\s,-]+/);
    if (parts.length !== 3) {
        // If the format is already correct (e.g., YYYY-MM-DD), return it
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }
        return null; // Or return a default/error state
    }

    let day, month, year;

    const [part1, part2, part3] = parts;

    if (!isNaN(part1) && isNaN(part2) && !isNaN(part3)) {
        // Format: Day Month Year (e.g., 01 January 1952)
        day = part1;
        month = part2;
        year = part3;
    } else if (!isNaN(part1) && !isNaN(part2) && isNaN(part3)) {
         // Format: Day Month Year (e.g., 01 01 1952)
         return `${part3}-${part2.padStart(2, '0')}-${part1.padStart(2, '0')}`;
    }
    else if (!isNaN(part1) && !isNaN(part2) && !isNaN(part3)) {
        // Assuming YYYY-MM-DD or similar all-numeric format
        return `${part1}-${part2.padStart(2, '0')}-${part3.padStart(2, '0')}`;
    }
     else {
        // Assuming Year-Month-Day (e.g., 1952-يناير-01)
        year = part1;
        month = part2;
        day = part3;
    }
    
    const monthStr = String(month).toLowerCase();
    const monthNumber = monthMap[monthStr];

    if (!monthNumber) {
        return null; // Or handle as an invalid date
    }

    return `${year}-${monthNumber}-${String(day).padStart(2, '0')}`;
};
