// Time when downloading the data
const TIME_DOWNLOAD = {hour: 17, min: 23};
// Title and Subtitle (subtitle only available in user facing page)
const StrTitle = "Service Desk";
const StrSubTitle = "Please sign in";
// Form Items (type, name visibility (in user interface))
// type includes time, text, checkbox, and dropdown
// only 1 checkbox and 1 dropdown can be used
const FORM_ITEM = [
	new createFormItem("time", "Time", false),
	new createFormItem("text", "Name", true),
	new createFormItem("text", "Organization", true),
	new createFormItem("text", "Phone Number", true),
	new createFormItem("text", "Reason for Visit", true),
	new createFormItem("dropdown", "Technician", false),
	new createFormItem("checkbox", "Resolved", false)
]
const DRPDWN_ITEM = [
	"", "Chicken", "Summy"
]
// container to keep data
let Data = [];

function createFormItem (type, name, visiblity){
	this.type = type;
	this.name = name;
	this.visiblity = visiblity;
}

// setup user interface & internal pages based on given data
function setup() {
	// set title
	document.getElementById("h1_title").innerHTML = StrTitle;
	// subtitle indicates main page, if not internal page
	let h2 = document.getElementById("h2_title");
	if(h2){
		h2.innerHTML = StrSubTitle;
	}
	let container = document.getElementById("label_container");
	let table = document.getElementById("table_checkins");
	let row = table.tHead.children[0];
	for (let i = 0; i < FORM_ITEM.length; i++) {
		// Prepare Table Headers
		let th = document.createElement("TH");
		th.innerHTML = FORM_ITEM[i].name;
		row.appendChild(th);
		// steup form items in user interface
		if(h2) {
			// User Form Input Container
			if(FORM_ITEM[i].visiblity){
				let label = document.createElement("label");
				let input = document.createElement("INPUT");
				label.innerHTML = FORM_ITEM[i].name;
				label.style.fontWeight = "bold";
				label.className = "w3-text-deep-orange";
				input.type = "text";
				input.className = "w3-input w3-border";
				input.onclick = function() {
					document.getElementById("form_message").innerHTML = "";
				}
				input.maxlength = 128;
				container.appendChild(label);
				container.appendChild(document.createElement("BR"));
				container.appendChild(input);
				container.appendChild(document.createElement("BR"));
			}
		}
	}
	// load stored data
	getStoredData();
	// auto download and refresh, every day
	if(h2) {
		callEveryDay();
	}

}

function callEveryDay() {
	const d = new Date();
	const time = TIME_DOWNLOAD;
	let sec_to_call = (3600*time.hour + 60*time.min) - (3600*d.getHours() + 60*d.getMinutes() + d.getSeconds());
	// call midnight to refresh date (30 seconds added)
	if (sec_to_call < 0) {sec_to_call = 3600*24 + 30 - (3600*d.getHours() + 60*d.getMinutes() + d.getSeconds())}
	setTimeout(downloadAndClearMessage, sec_to_call*1000);
}

function callInTenSeconds() {
	setTimeout(clearFormMessage, 1000*5);
}

// this will refresh the user interface or internal page
window.addEventListener("storage", refreshTable);
function refreshTable() {
console.log("refresh");
	location.reload();
}

function downloadAndClearMessage() {
	saveToFile();
	clearData();
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
	// clear input form when hit CLEAR
	let container = document.getElementById("label_container");
	let inputNodes = container.getElementsByTagName("INPUT");
	for (let i = 0; i < inputNodes.length; i++) {
		inputNodes[i].value = "";
	}
	clearFormMessage();
}

function clearData() {
	localStorage.clear();
	location.reload();
}

// update Data value reflecting checked items
function setDataChecked() {
	let tbl = document.getElementById("table_checkins");
	let tblBody = tbl.getElementsByTagName('tbody')[0];
	let chkbox = tblBody.getElementsByTagName("input");
	for(i = 0; i < chkbox.length; i++) {
		let dataCheckbox = Data[Data.length - 1 - i].find(item => item.type == "checkbox");
		dataCheckbox.checked = chkbox[i].checked;
	}
	localStorage.setItem("storedData", JSON.stringify(Data));
}

// update Data value reflecting dropdown items
function setDataDropdown() {
	let tbl = document.getElementById("table_checkins");
	let tblBody = tbl.getElementsByTagName('tbody')[0];
	let dropdown = tblBody.getElementsByTagName("select");
	for(i = 0; i < dropdown.length; i++) {
		let dataDropdown = Data[Data.length - 1 - i].find(item => item.type == "dropdown");
		dataDropdown.value = dropdown[i].value
	}
	localStorage.setItem("storedData", JSON.stringify(Data));
}

function insertItemToRow(Item){
	let row = document.getElementById("table_checkins").getElementsByTagName('tbody')[0].insertRow(0);
	Item.forEach((item, index) => {
		if(item.type == "checkbox"){
			let checkbox = document.createElement("INPUT");
			checkbox.type = "checkbox";
			checkbox.onclick = setDataChecked;
			checkbox.checked = item.checked;
			row.insertCell().appendChild(checkbox);
		} else if(item.type == "dropdown"){
			let selectedItem = DRPDWN_ITEM.findIndex(x => x == item.value);
			let dropdown = document.createElement("SELECT");
			dropdown.name = item.name;
			dropdown.onchange = setDataDropdown;
			DRPDWN_ITEM.forEach((item, index) => {
				let option = document.createElement("OPTION");
				option.value = item;
				option.innerHTML = item;
				dropdown.appendChild(option);
			});
			dropdown.selectedIndex = selectedItem;
			row.insertCell().appendChild(dropdown);
		} else {
			let newText = document.createTextNode(item.value);
			row.insertCell().appendChild(newText);
		} 
	});
}

function saveForm(){
	// read form data
	let {date, time, dateTime} = getCurrnetTime();
	let Item = [];
	// if one of field is empty, reject saving the form
	let empty_field = false;
	let container = document.getElementById("label_container");
	let inputNodes = container.getElementsByTagName("INPUT");
	for (let i = 0; i < inputNodes.length; i++) {
		if(inputNodes[i].value == ""){
			empty_field = true;
			break;
		}
	}
	if(empty_field){
		document.getElementById("form_message").innerHTML = "Please fill out empty form";
		callInTenSeconds();
		return false;
	} else {
		// read all form data
		let inputNodesNo = 0;
		for (let i = 0; i < FORM_ITEM.length; i++) {
			if(FORM_ITEM[i].type == "time"){
				Item.push({
					"type": FORM_ITEM[i].type,
					"value": time,
					"checked": false
				});
			} else if(FORM_ITEM[i].type == "text"){
				Item.push({
					"type": FORM_ITEM[i].type,
					"value": inputNodes[inputNodesNo].value,
					"checked": false
				});
				inputNodesNo += 1;
			} else if(FORM_ITEM[i].type == "checkbox"){
				Item.push({
					"type": FORM_ITEM[i].type,
					"value": "",
					"checked": false
				});
			} else if (FORM_ITEM[i].type == "dropdown"){
				Item.push({
					"type": FORM_ITEM[i].type,
					"value": "",
					"checked": false
				});
			}
		}
	}
	Data.push(Item);
	localStorage.setItem("storedData", JSON.stringify(Data));
	insertItemToRow(Item);
	updateWalkinsCount();
	clearForm();
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

function getStoredData(){
	let storedData = localStorage.getItem("storedData");
	if( (storedData !== null) && (storedData.length > 0) ){
		Data = JSON.parse(storedData);
	}
	updateTable();
}

function saveToFile() {
	// current time
	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	// Data to csv
	let data = [];
	Data.forEach((row, index) => {
		let rowData = [];
		row.forEach((item, index) => {
			if(item.type == "text"){
				rowData.push(item.value);
			} else if(item.type == "checkbox"){
				rowData.push(item.checked);
			} else if(item.type == "time"){
				rowData.push(item.value);
			} else if(item.type == "dropdown"){
				rowData.push(item.value);
			}
		});
		data.push(rowData);
	})

	let headers = [[]];
	for(i = 0; i < FORM_ITEM.length; i++){
		headers[0].push(FORM_ITEM[i].name);
	}
	// create csv and export to file
	let csv = arrayToCsv(headers)+'\r\n'+arrayToCsv(data);
	downloadBlob(csv, `${date}_${Data.length}_tickets.csv`, 'text/csv;charset=utf-8;');
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