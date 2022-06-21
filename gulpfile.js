import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgostore from 'gulp-svgstore';
import rename from 'gulp-rename';
import del from 'del';
import csso from 'postcss-csso'

// Styles

export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

//минификация html страниц
const html = () => {
  return gulp.src('source/*.html')
  .pipe(htmlmin({
    collapseWhitespace: false
  }))
  .pipe(gulp.dest('build'));
}


//минификация js файлов

const scripts = () => {
  return gulp.src('./source/js/*.js')
    .pipe(terser())
    .pipe(gulp.dest('./build/js'));
}

//оптимизирование изображения в папку build

const optimizeImages = () => {
  return gulp.src('./source/img/**/*.{jpg,png}')
    .pipe(squoosh())
    .pipe(gulp.dest('./build/img'));
}

//копируем для для себя не оптимизированные

const copyImages = () => {
  return gulp.src('./source/img/**/*.{jpg,png}')
    .pipe(gulp.dest('./build/img'));
}

//оптимизированные webp

const createWebp = () => {
  return gulp.src('./source/img/**/*.{jpg,png}')
    .pipe(squoosh({
      webp: {},
    }
    ))
    .pipe(gulp.dest('./build/img'));
}

//оптимизация свг иконок кроме папки icons

const svg = () => {
  return gulp.src(['./source/img/**/*.svg', '!./source/img/social/*.svg'])
    .pipe(svgo())
    .pipe(gulp.dest('./build/img'));
}

//создание спрайта

const sprite = () => {
  return gulp.src('./source/img/social/*.svg')
    .pipe(svgo())
    .pipe(svgostore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('./build/img'));
}


//копирование файлов без оптимизации
const copy = (done) => {
 gulp.src([
  'source/fonts/*.{woff2,woff}',
  'source/**/*.ico',
  'source/**/*.manifest'
  ], {
  base: 'source'
  })
  .pipe(gulp.dest('build'))
  done();
}

//удаление файлов

const clean = () => {
  return del('build');
};

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

//reload перезапускает браузер после контрл с

const reload = (done) => {
  browser.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/js/**/*.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
}

// Build

export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
  styles,
  html,
  scripts,
  svg,
  sprite,
  createWebp
  ),
  );

  // Default

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
  styles,
  html,
  scripts,
  svg,
  sprite,
  createWebp
  ),
  gulp.series(
  server,
  watcher
  ));
