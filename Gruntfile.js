module.exports = function(grunt) {
    grunt.initConfig({
        'create-windows-installer': {
            ia32: {
                appDirectory: './builds/BankDataGenerator-win32-ia32',
                outputDirectory: './dist',
                name: 'BankDataGenerator',
                description: 'Bank Data to FinDash Data Converter',
                authors: 'LinkIt',
                exe: 'BankDataGenerator.exe'
            }
        }
    });

    grunt.loadNpmTasks('grunt-electron-installer');
};