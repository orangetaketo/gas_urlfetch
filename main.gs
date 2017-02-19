var TARGET_URL = "https://";

function fetch(url) {
  // send get
  var response = UrlFetchApp.fetch(url);

  // retrieve the get result
  var content = response.getContentText("UTF-8");   

  return content;
}
