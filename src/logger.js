export const logToConsole = (data)=> console.log(data);
export const tableToConsole = (data)=> console.table(data);
export const objectToString = (data)=> JSON.stringify( data, null, '   ' );
export const log2DStringArray = (arr) => console.log(
  arr.reduce((result, subArr)=> `${result}${subArr.join(', ')}\n`, '')
);
export const logSetValues = (set)=> console.log( [...set] );
