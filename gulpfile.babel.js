
'use strict'

import gulp from 'gulp'

import run from 'gulp-run'

gulp.task('build', () => {
  run('npm run build').exec()
})

gulp.task('watch', () => {
  gulp.watch(['src/*.js'], null, ['build'])
})
