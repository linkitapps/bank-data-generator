var gulp = require('gulp');
var winInstaller = require('electron-windows-installer');

gulp.task('create-windows-installer', function(done) {
    winInstaller({
        appDirectory: './builds/BankDataGenerator-win32-ia32',
        outputDirectory: './dist',
        arch: 'ia32'
    }).then(done).catch(done);
});