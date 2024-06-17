const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/';
        if (file.fieldname === 'userImage') {
            uploadPath += 'users/';
        } else if (file.fieldname === 'moduleImage') {
            uploadPath += 'modules/';
        } else if (file.fieldname === 'quizImage') { // Nombre del campo de archivo
            uploadPath += 'quizzes/';
        } else if (file.fieldname === 'questionImage') {
            uploadPath += 'questions/';
        } else if (file.fieldname === 'answerImage') {
            uploadPath += 'answers/';
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
