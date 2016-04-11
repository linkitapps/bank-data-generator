var jQuery = require('jquery');
var jQueryUi = require('jquery-ui');
require('jquery-csv');

var xlsData = [];
var startIndex;
var dataKeyArr = [];

var X = XLSX;

// fix data
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

// workbook 을 CSV 로 변환하는 함수
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

// workbook 처리
function process_wb(wb) {
  var tbody = document.getElementById('out-tbody'),
    html = '',
    output = to_csv(wb);

  xlsData = [];

  var data = jQuery.csv.toArrays(output),
    itemLen = data[0].length,
    j,
    start = false,
    thead = false,
    tag;
  jQuery.each(data, function(i, item) {
    // 맨 앞 컬럼 값이 없으면 유효하지 않은 row 로 판단함: 예) 우리은행 개인뱅킹 맨 아랫줄에 나오는 합계 row
    if (!item[0]) {
      return;
    }

    if (!start) {
      var flag = true;
      for (j = 0; j < itemLen; j++) {
        if (!item[j]) {
          flag = false;
        }
      }
      if (flag) {
        start = true;
        thead = true;
      }
    }

    // 엑셀 파일에서 모든 컬럼에 값이 있는 경우 start = true
    // 이런 경우는 엑셀 파일 상단에 있는 요약 정보가 끝나고 실제로 내용이 시작되는 부분임 => 표의 header
    // 이때 부터 테이블 생성을 시작함
    if (start) {
      if (thead) {
        tag = 'th';
        thead = false;
        startIndex = i;
      } else {
        tag = 'td';
      }

      html += '<tr>';

      // 임시 객체를 만든다.
      var tempArr = {};

      for (j = 0; j < itemLen; j++) {
        var _con = '';
        if(tag == 'th'){
          _con = '<div class="draggable-el"><span class="text">' + item[j] + '</span></div>';
        } else {
          _con = item[j];
        }
        html += '<' + tag + '>' + _con + '</' + tag + '>';

        // 객체를 추가한다.
        tempArr[data[startIndex][j]] = item[j];

      }
      html += '</tr>';

      // 임시객체를 배열에 추가한다.
      if(i != startIndex) {
        xlsData.push(tempArr);
      }
    }
  });
  console.log(xlsData)
  tbody.innerHTML = html;

  jQuery( '.draggable-el' ).draggable({
    appendTo: "body",
    helper: "clone"
  });

  jQuery( '#target td' ).droppable({
    activeClass: "ui-state-default",
    hoverClass: "ui-state-hover",
    accept: ":not(.ui-sortable-helper)",
    drop: function( event, ui ) {
      jQuery(this).html(ui.draggable.text());
    }
  })

  if(typeof console !== 'undefined') {
    //console.log("output", data);
  }
}

// 엑셀 파일 선택 이벤트 핸들러
function handleFile(e) {
  var files = e.target.files;
  var f = files[0];
  var reader = new FileReader();
  var name = f.name;    // 파일 이름

  jQuery('#viewFineName').val(name);
  jQuery('#btnPreview').show();
  jQuery('#btnExcel').hide();

  reader.onload = function(e) {
    var data = e.target.result;
    var wb;
    var arr = fixdata(data);
    wb = X.read(btoa(arr), {type: 'base64'});
    process_wb(wb);
  };
  reader.readAsArrayBuffer(f);
}

// 엑셀 파일 선택
document.getElementById('xlfile').addEventListener('change', handleFile, false);

// 테이블에 로드된 데이터들을 엑셀 파일로 export
function exportExcel() {
  if (!document.getElementById('out-tbody').innerHTML) {
    alert('먼저 엑셀파일을 업로드하십시오');
    return false;
  }
  export_table_to_excel('out-table', '거래내역_' + (+new Date()));
}

function previewGrid() {
  jQuery('#btnPreview').hide();
  jQuery('#btnExcel').show();
  dataKeyArr = [];
  var html = '<tr><td>거래일시</td><td>적요</td><td>기재내용</td><td>출금액(원)</td><td>입금액(원)</td><td>거래후잔액(원)</td><td>취급점</td><td>메모</td></tr>';
  jQuery('#target tbody td').each(function(){
    var text = jQuery(this).text();
    dataKeyArr.push(text);
  });
  //jQuery('#out-tbody')
  for ( var i in xlsData ) {
    html += '<tr>';
    for ( var j = 0; j < 8; j++ ){
      html += '<td>'+ (xlsData[i][dataKeyArr[j]] ? xlsData[i][dataKeyArr[j]] : '-') +'</td>';
    }
    html += '</tr>';
  }

  jQuery('#out-tbody').html(html);

}

function resetWindow(){

  var fileInput = document.getElementById('xlfile');

  xlsData = [];
  startIndex = null;
  dataKeyArr = [];

  jQuery('#target tbody').html(function(){
    var html = '';
    jQuery('#target th').each(function(){
      html += '<td></td>'
    })
    return '<tr>' + html + '</tr>'
  });
  jQuery('#out-tbody').html('');
  // 텍스트 박스를 비운다
  if(document.selection){
    jQuery(fileInput).select();
    document.selection.clear();
  }else{
    jQuery(fileInput).val('');
  }
}