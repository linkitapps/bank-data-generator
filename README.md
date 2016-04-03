# bank-data-generator

https://github.com/atom/electron/blob/master/docs/api/auto-updater.md
https://github.com/electron-userland/electron-builder
https://medium.com/@svilen/auto-updating-apps-for-windows-and-osx-using-electron-the-complete-guide-4aa7a50b904c#.citr7irfv
electron-installer-windows
electron-packager

# TODO
사용자가 업로드 한 엑셀 파일의 컬럼과 FinDash 가 필요로 하는 컬럼들 (일시, 기재내용, 받은금액, ...) 을 매칭시키는 UI 를 만들고 매칭 이후 엑셀 파일 다운로드 기능까지 만듬
- 사용자의 은행 거래내역 엑셀파일을 FinDash 서버에 직접 업로드 하지 않게 하기 위해서 => 은행 파일을 직접 업로드 하지 않게해 조금이라도 보안성을 높임
- 사용자가 직접 매칭을 시킴으로써 사용자는 조금 불편해지지만 FinDash 가 국내 은행들의 모든 엑셀 양식을 취합하지 않아도 모든 은행 거래내역을 분석할 수 있게 되므로 오히려 사용자에게 도움이 되는 면이 있음
- 글로벌 서비스를 하려면 세계 모든 은행들에 대해 직접 대응할 수는 없으므로 이런 식의 접근이 필요할 것 같음
