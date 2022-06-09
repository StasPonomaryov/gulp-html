// Import modules
import gulp from 'gulp';
import cssMin from 'gulp-clean-css';
import concat from 'gulp-concat';
import imageMin from 'gulp-imagemin';
import webp from 'gulp-webp';
import merge from 'merge-stream';
import plumber from 'gulp-plumber';
import nodeSass from 'node-sass';
import gulpSass from 'gulp-sass';
import uglify from 'gulp-uglify-es';
import purgeCss from 'gulp-purgecss';

const sass = gulpSass(nodeSass);

// Required directories
const dir = {
  src: 'src',
  build: 'build',
  nm: 'node_modules/',
};

const path = {
  build: {
    js: `${dir.build}/js/`,
    css: `${dir.build}/css/`,
    images: `${dir.build}/img/`,
    fonts: `${dir.build}/fonts/`,
    html: `${dir.build}`,
  },
  src: {
    html: `${dir.src}/**/*.html`,
    js: [
      `${dir.nm}/jquery/dist/jquery.min.js`,
      `${dir.nm}/bootstrap/dist/js/bootstrap.bundle.js`,
      `${dir.nm}/vanilla-lazyload/dist/lazyload.min.js`,
      `${dir.src}/js/helper.js`,
    ],
    scss: [
      `${dir.nm}/bootstrap/scss/bootstrap.scss`,
      `${dir.src}/css/app.scss`,
    ],
    css: [
      `${dir.src}/css/additional.css`,
    ],
    img: `${dir.src}/img/**/*.*`,
    fontAwesome: 'node_modules/@fortawesome/fontawesome-free/webfonts/*.*',
  },
  watch: {
    html: `${dir.src}/**/*.html`,
    js: `${dir.src}/js/**/*.js`,
    styles: `${dir.src}/css/**/*.scss`,
    images: `${dir.src}/img/**/*.*`,
  },
  clean: `${dir.build}`, // path to clear production build
};

export const buildFonts = () => gulp.src(path.src.fontAwesome)
  .pipe(gulp.dest(path.build.fonts));

export const buildPages = () => gulp.src(path.src.html)
  .pipe(gulp.dest(path.build.html));

export const buildImages = () => gulp.src(path.src.img, { since: gulp.lastRun(buildImages) })
  .pipe(imageMin({
    progressive: true,
    svgoPlugins: [{ removeViewBox: false }],
    interlaced: true,
  }))
  .pipe(webp())
  .pipe(gulp.dest(path.build.images));

export const buildScripts = () => gulp.src(path.src.js)
  .pipe(plumber())
  .pipe(concat('app.js'))
  .pipe(uglify())
  .pipe(plumber.stop())
  .pipe(gulp.dest(path.build.js));

export const buildStyles = () => {
  const scssFiles = gulp.src(path.src.scss)
    .pipe(sass())
    .pipe(concat('styles.scss'));

  const cssFiles = gulp.src(path.src.css)
    .pipe(concat('styles.css'));

  return merge(scssFiles, cssFiles)
    .pipe(concat('styles.css'))
    .pipe(plumber())
    .pipe(cssMin())
    .pipe(plumber.stop())
    .pipe(purgeCss({
      content: [path.src.html],
    }))
    .pipe(gulp.dest(path.build.css));
};

export const devWatch = () => {
  gulp.watch(path.watch.html, buildPages);
  gulp.watch(path.watch.styles, buildStyles);
  gulp.watch(path.watch.images, buildImages);
  gulp.watch(path.watch.js, buildScripts);
};

export const build = gulp.series(
  gulp.parallel(buildPages, buildStyles, buildScripts, buildImages, buildFonts),
);

export const dev = gulp.parallel(build, devWatch);

export default dev;
