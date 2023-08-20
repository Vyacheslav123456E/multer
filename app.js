const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();

// Установка директории для загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Настройка шаблонизатора EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Добавление middleware для обработки POST запросов и статических файлов
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Рендеринг главной страницы
app.get('/', function (req, res) {
    res.render('index');
});

// Обработка загрузки файла
app.post('/upload', upload.single('documents'), function (req, res) {
    const file = req.file;
    const frm = req.file.originalname.split('.').pop();

    fs.renameSync(file.path, 'uploads/' + req.body.name+'.'+frm);
    // res.send(`<script>  alert('Файл успешно загружен.')</script>`);
    const redirectUrl = '/files?title=' + encodeURIComponent(req.body.name);
    res.redirect(redirectUrl);
});

// Рендеринг страницы со списком файлов по названию
app.get('/files', function (req, res) {
    const title = req.query.title;

    const file = fs.readdirSync('uploads/')
        .filter(filename => filename.startsWith(title));
    const files = file.map(filename => ({title, filename}));
    res.render('list', { files });
});

// Обработка скачивания файла
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    res.download('uploads/' + filename);
});

// Запуск сервера на порту 3000
app.listen(3000, function () {
    console.log('Сервер запущен на порту 3000');
});