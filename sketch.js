const FORM_ROW_ID = ["input_name", "input_unit", "input_phone", "input_issue"];
const HEADERS = [["Time", "Name", "Organization", "Phone", "Reason"]];
let Data = [];

window.addEventListener("storage", refreshTable);

function refreshTable() {
	location.reload();
}

function callEveryDay() {
	const d = new Date();
	let seconds_to_next_day = 60*60*24 - (60*d.getHours() + d.getMinutes() + d.getSeconds() + 3);
	setTimeout(downloadAndClearMessage, seconds_to_next_day*1000);
}

function downloadAndClearMessage() {
	saveToFile();
	clearData();
}

function callInTenSeconds() {
	setTimeout(clearFormMessage, 1000*5);
}

function getCurrnetTime() {
	// current time
	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	var dateTime = date+' '+time;
	return {date, time, dateTime};
}

function updateWalkinsCount() {
	document.getElementById("walk-in_count").innerHTML = "Count: " + Data.length;
}

function clearFormMessage(){
	document.getElementById("form_message").innerHTML = "";
}

function clearForm() {
	FORM_ROW_ID.forEach((id) => {
		document.getElementById(id).value = "";
	});
	clearFormMessage();
}

function clearData() {
	localStorage.clear();
	location.reload();
}

function insertItemToRow(Item){
	let row = document.getElementById("table_checkins").getElementsByTagName('tbody')[0].insertRow(0);
	Item.forEach((item, index) => {
		row.insertCell().innerText = item;
	});
}

function save(){
	// read form data
	let {date, time, dateTime} = getCurrnetTime();
	let inputElement = [];
	let Item = [time];
	let empty_field = false;
	FORM_ROW_ID.forEach((id, index) => {
		inputElement.push(document.getElementById(id));
		let value = inputElement[index].value;
		if(value.length == 0){
			empty_field = true;
		}		
		Item.push(inputElement[index].value);
	});
	if(empty_field) {
		document.getElementById("form_message").innerHTML = "Please fill out empty form";
		callInTenSeconds();
		return false;
	} else {
		inputElement.forEach((element) => {
			element.value = "";
		});
	}
	Data.push(Item);
	localStorage.setItem("storedData", JSON.stringify(Data));
	insertItemToRow(Item);
	updateWalkinsCount();
}

function updateTable() {
	let {date, time, dateTime} = getCurrnetTime();
	// set data in table_checkins
	Data.forEach((row, index) => {
		insertItemToRow(row);
	});
	// set date, walk-in count
	document.getElementById("walk-in_date").innerHTML = "Date: " + date;
	updateWalkinsCount();	
}

function get(){
	let storedData = localStorage.getItem("storedData");
	if( (storedData !== null) && (storedData.length > 0) ){
		Data = JSON.parse(storedData);
	}
	updateTable();
	// auto download and refresh, every day
	callEveryDay();
}

function saveToFile() {
	// current time
	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	// create csv and export to file
	let csv = arrayToCsv(HEADERS)+'\r\n'+arrayToCsv(Data);
	downloadBlob(csv, date + '.csv', 'text/csv;charset=utf-8;');
}

function arrayToCsv(data){
  return data.map(row =>
    row
    .map(String)  // convert every value to String
    .map(v => v.replaceAll('"', '""'))  // escape double colons
    .map(v => `"${v}"`)  // quote it
    .join(',')  // comma-separated
  ).join('\r\n');  // rows starting on new lines
}

/** Download contents as a file
 * Source: https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
 */
function downloadBlob(content, filename, contentType) {
  // Create a blob
  var blob = new Blob([content], { type: contentType });
  var url = URL.createObjectURL(blob);
  // Create a link to download it
  var pom = document.createElement('a');
  pom.href = url;
  pom.setAttribute('download', filename);
  pom.click();
}