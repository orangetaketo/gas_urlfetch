// ============================================
// MAIN FUNCTIONS
// @see https://docs.google.com/macros/dashboard for Google Service Limitations (per day)
// ============================================

// ============================================
// GAS Definition Tips
//  use  'var' for variables (that can change its values during procedure)
//  omit 'var' for final values (that won't chang
// ============================================

// ============================================
// DATABASE URLs (SPREADSHEETS)
// ============================================
SPREADSHEET_URL = "https://docs.google.com/spreadsheets/<fill_your_spreadsheet_url>";

// SHEETS
SHEET_WATCH_LIST ='watch_list';

// EXCEL COLUMN INDEX 
COL_ID     = 1
COL_TITLE  = 2;
COL_TICKER = 3;
COL_DATA   = 4;

//=====================================
// JSON extract helper methods
HEADER_ROW_INDEX=1;
HEADER_COL_INDEX=1;
HEADER_ROW_NUMBER=1;
function generate(elm,obj){
  var i = 0;
  for(var key in obj){
    obj[key] = elm[i];
    i++;
  }
  return obj;
}
function indexBy(ary){
  var obj = {};
  for(var i = 0, len = ary.length; i < len; i++){
    var key = ary[i];
    obj[key] = key;
  }
  return obj;
}
//=====================================

// -------------------------------------------------------------------------
// getSpreadsheetByJson ... Get a direct message spreadsheet by json format
// -------------------------------------------------------------------------
//  sheet : A spreadsheet contains the parsed direct messages
function getSpreadsheetByJson(sheet) {

  var keys = sheet.getSheetValues(
        HEADER_ROW_INDEX, HEADER_COL_INDEX, HEADER_ROW_NUMBER, sheet.getLastColumn())[0];
  var data = sheet.getRange(
        HEADER_ROW_INDEX + 1, HEADER_COL_INDEX, sheet.getLastRow(), sheet.getLastColumn()).getValues();

  var data_list = [];
  
  data.forEach(function(elm, index) {
    var template = indexBy(keys);
    var cell_data = generate(elm, template);
    if(cell_data.id != null && cell_data.id > 0) { // !SPECIFY THE PRIMARY KEY FIELD HERE (cell_data.xxx)!
      data_list[index] = cell_data;
    }
  });

  return JSON.stringify(data_list);
}

function retrieve() {
  // Get a script lock to modify a shared resource.
  var lock = LockService.getScriptLock();

  // Wait for up to 30 seconds for other processes to finish.
  lock.waitLock(30000);
  {
    var doc = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
    
    var sht_watch_list = doc.getSheetByName(SHEET_WATCH_LIST);
    var jsn_watch_list = JSON.parse(getSpreadsheetByJson(sht_watch_list));  
    
    for(var i = 0; i < jsn_watch_list.length; i++) {
      try {
        
        var watch_list = jsn_watch_list[i];
        
        
        var id = getFullUri(watch_list.id);
        var title = getFullUri(watch_list.title);
        var ticker = getFullUri(watch_list.ticker);
        var url = getFullUri(watch_list.url);

        var content = fetch(url);

        Logger.log(id + ": " + title + "(" + ticker + ")[" + url + "]");
        Logger.log(content);
        
      } catch (e) {
        // give up unknown items
        errorLog(e);
      }
  }
  // Release the lock so that other processes can continue.
  lock.releaseLock();

}


function fetch(url) {
  // send get
  var response = UrlFetchApp.fetch(url);

  // retrieve the get result
  var content = response.getContentText("UTF-8");   

  return content;
}
  
//=============================================================
// LOGGING AND DEBUGGING
//=============================================================
// write an error message to the sheet 'error.log'
function errorLog(error_message) {
  
//   var doc = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
//   var sheet_error = doc.getSheetByName(SHEET_NAME_ERRORLOG);
  
//   var curr  = new Date()
//   var format_date = curr.getYear() + "/" + (curr.getMonth() + 1) + "/" + curr.getDate(); 
//   format_date = format_date + " - " + curr.getHours()+ ":" + curr.getMinutes() + ":" + curr.getSeconds();
  
//   var real_message = "BOT No." + BOT_NUM + "\n";
  
//   // check if this is an exception object and has a stack or a message
//   if (error_message.message) {
//     real_message += error_message.message + "\n";
//   }

//   if (error_message.stack) {
//     real_message += error_message.stack + "\n";
//   }

//   real_message += error_message;
  Logger.log("ERROR: " + real_message);

  // insert to the error sheet
//   var last_row_index = sheet_error.getLastRow();
//   var row_content = [last_row_index, format_date, real_message];
//   insertAtLastSortDesc(sheet_error, row_content, 1, false);
}
