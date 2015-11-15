/// <binding AfterBuild='default' />
// include plug-ins
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var del = require('del');

var config = {
    //Include all js files but exclude any min.js files
    serverSrc : ['utils.js', 'config.js', 'chatTopic.js', 'server.js', 'app.js'],
    clientUISrc : ['config.js', 'clientBase.js', 'clientUI.js'],
    clientBotSrc : ['config.js', 'clientBase.js', 'clientBot.js']
}

// Synchronously delete the output file(s)
gulp.task('cleanServer', function () {
    del.sync(['server.min.js'])
});

gulp.task('cleanClientUI', function () {
    del.sync(['public/clientUI.min.js'])
});

gulp.task('cleanClientBot', function () {
    del.sync(['clientBot.min.js'])
});

// Combine and minify all files from the app folder
gulp.task('scriptsServer', ['cleanServer'], function () {    
    return gulp.src(config.serverSrc)
    //.pipe(uglify())
    .pipe(concat('server.min.js'))
    .pipe(gulp.dest(''));
});

gulp.task('scriptsClientUI', ['cleanClientUI'], function () {
    return gulp.src(config.clientUISrc)
    //.pipe(uglify())
    .pipe(concat('clientUI.min.js'))
    .pipe(gulp.dest('public/'));
});

gulp.task('scriptsClientBot', ['cleanClientBot'], function () {
    return gulp.src(config.clientBotSrc)
    //.pipe(uglify())
    .pipe(concat('clientBot.min.js'))
    .pipe(gulp.dest(''));
});

//Set a default tasks
gulp.task('default', ['scriptsServer', 'scriptsClientUI', 'scriptsClientBot'], function () { });