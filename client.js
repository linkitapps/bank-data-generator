var jQuery = require('jquery');
require('jquery-csv');

var X = XLSX;

function fixdata(data) {
  var o = '',
    l = 0,
    w = 10240;

  for(; l < data.byteLength / w; ++l) {
    o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
  }
  o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));

  return o;
}

function to_csv(workbook) {
  var result = [];

  workbook.SheetNames.forEach(function(sheetName) {
    var csv = X.utils.sheet_to_csv(workbook.Sheets[sheetName]);
    if(csv.length > 0){
      //result.push("SHEET: " + sheetName);
      //result.push("");
      result.push(csv);
    }
  });

  return result.join("\n");
}

function process_wb(wb) {
  var tbody = document.getElementById('out-tbody'),
    html = '',
    output = '';
  output = to_csv(wb);

  // if(out.innerText === undefined) {
  //   out.textContent = output;
  // } else {
  //   out.innerText = output;
  // }

  var data = jQuery.csv.toArrays(output);
  jQuery.each(data, function(i, item) {
    html += '<tr>';
    html += '<td>' + item[0] + '</td>';
    html += '<td>' + item[1] + '</td>';
    html += '<td>' + item[2] + '</td>';
    html += '<td>' + item[3] + '</td>';
    html += '<td>' + item[4] + '</td>';
    html += '<td>' + item[5] + '</td>';
    html += '<td>' + item[6] + '</td>';
    html += '<td>' + item[7] + '</td>';
    html += '<td>' + item[8] + '</td>';
    html += '</tr>';
  });
  tbody.innerHTML = html;

  if(typeof console !== 'undefined') {
    console.log("output", data);
  }
}

function handleFile(e) {
  var files = e.target.files;
  var f = files[0];
  var reader = new FileReader();
  var name = f.name;
  // if(typeof console !== 'undefined') {
  //   console.log(name);
  // }
  reader.onload = function(e) {
    var data = e.target.result;
    var wb;
    var arr = fixdata(data);
    wb = X.read(btoa(arr), {type: 'base64'});
    process_wb(wb);
  };
  reader.readAsArrayBuffer(f);
}

document.getElementById('xlfile').addEventListener('change', handleFile, false);

function exportExcel() {
  if (!document.getElementById('out-tbody').innerHTML) {
    alert('먼저 엑셀파일을 업로드하십시오');
    return false;
  }
  export_table_to_excel('out-table', '거래내역_' + (+new Date()));
}