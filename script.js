var jQuery = $ = require('jquery');
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

  var data = $.csv.toArrays(output),
    itemLen = data[0].length,
    j,
    start = false,
    thead = false,
    tag;
  $.each(data, function(i, item) {
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

  $( '.draggable-el' ).draggable({
    appendTo: "body",
    helper: "clone"
  });

  $( '#target td' ).droppable({
    activeClass: "ui-state-default",
    hoverClass: "ui-state-hover",
    accept: ":not(.ui-sortable-helper)",
    drop: function( event, ui ) {
      $(this).html(ui.draggable.text());
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

  $('#viewFineName').val(name);
  $('#previewSum').show();
  $('#btnExcel').hide();

  removeDroppable();

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
  $('#previewSum').hide();
  $('#btnExcel').show();
  dataKeyArr = [];
  var html = '<tr><td>거래일시</td><td>적요</td><td>기재내용</td><td>출금액(원)</td><td>입금액(원)</td><td>거래후잔액(원)</td><td>취급점</td><td>메모</td></tr>';
  $('#target tbody td').each(function(){
    var text = $(this).text();
    dataKeyArr.push(text);
  });
  //$('#out-tbody')
  for ( var i in xlsData ) {
    html += '<tr>';
    for ( var j = 0; j < 8; j++ ){
      html += '<td>'+ (xlsData[i][dataKeyArr[j]] ? xlsData[i][dataKeyArr[j]].replace(/s/gi, '') : '-') +'</td>';
    }
    html += '</tr>';
  }

  $('#out-tbody').html(html);

  if(checkPattern()){
    $('#ly-add-bank-pattern').show();
  }

}

function resetWindow(){

  var fileInput = document.getElementById('xlfile');

  xlsData = [];
  startIndex = null;
  dataKeyArr = [];

  $('#out-tbody').html('');

  removeDroppable();

  $('#previewSum, #btnExcel').hide();

  // 텍스트 박스를 비운다
  if(document.selection){
    $(fileInput).select();
    document.selection.clear();
  }else{
    $(fileInput).val('');
  }
  $('#viewFineName').val('');
}

function removeDroppable(){
  $('#target tbody').html(function(){
    var html = '';
    $('#target th').each(function(){
      html += '<td></td>'
    })
    return '<tr>' + html + '</tr>'
  });
}













var userLocalBank = localStorage.getItem('matchBank');
var patternList;
var tempPatternArr;

if(userLocalBank){
  patternList = JSON.parse(userLocalBank);
} else {
  patternList = {};
}
makeSelectPattern(patternList);
makePatternList(patternList);


function checkPattern(){
  var isNewPattern = true;
  tempPatternArr = [];
  $('#target tbody tr:first-child td').each(function(){
    tempPatternArr.push(jQuery(this).text());
  });

  for( var i in patternList ){
    if( JSON.stringify(patternList[i]) == JSON.stringify(tempPatternArr) ){
      isNewPattern = false;
      break;
    }
  }
  return isNewPattern;
}

function makeSelectPattern (data){
  var _select = $('#previewSum .select-pattern');
  var _option = '';

  _select.find('*').remove();
  _option += '<select>';
  _option += '<option value="">형식을 선택해 주세요.</option>';

  for ( var i in data){
    _option += '<option value="' + i + '">' + i + '</option>';
  }

  _option += '</select>';
  _select.append(_option);
}

function makePatternList( data ){
  var _list = $('.pattern-list ul');
  var _html = '';
  _list.find('*').remove();

  for ( var i in data){
    _html += '<li><span class="bank-text">' + i + '</span><button class="delete"><i class="fa fa-times" aria-hidden="true"></i></button></li>'
  }
  _list.append(_html);
}

$('#confirm-pattern').on('click', function(){
  $('#ly-add-bank-pattern').addClass('step2');
});
$('.cancel-pattern').on('click', function(){
  $('#pattern-text').val('');
  $('#ly-add-bank-pattern').removeClass('step2').hide();
});

$('#save-pattern').on('click', function(){
  var _k = $('#pattern-text').val();
  patternList[_k] = tempPatternArr;
  try {
    localStorage.setItem('matchBank', JSON.stringify(patternList));
    makeSelectPattern(patternList);
    makePatternList(patternList);
    $('.cancel-pattern')[0].click();
    alert('추가 되었습니다.');
  } catch (e) {
    if (e == QUOTA_EXCEEDED_ERR) {
      alert('저장 공간이 부족 합니다.\n목록중 불필요한 항목을 삭제 해주세요.'); // 할당량 초과로 인하여 데이터를 저장할 수 없음
    }
  }
});

$(document).on('change','.select-pattern select', function(){
  var _val = this.value;
  if(_val){
    $('#target tbody tr:first-child td').each(function(i){
      $(this).text(patternList[_val][i]);
    });
  }
});

$(document).on('click','.pattern-list .delete', function(){
  alert('111');
  var _key = $(this).siblings('.bank-text').text();
  delete patternList[_key];
  localStorage.setItem('matchBank', JSON.stringify(patternList));
  makeSelectPattern(patternList);
  makePatternList(patternList);
  alert('삭제 되었습니다.');
});