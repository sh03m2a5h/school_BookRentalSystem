class BookDetail {
    /**
     * ステータスfalse,貸出年月日もnull
     * @param {Number} serial ユニークな本のシリアルコード
     */
    constructor(serial) {
        /**
         * @type {Number} シリアル番号
         */
        this.serial = serial;
        /**
         * @type {Number} 貸出中ならidが入る。それ以外null
         */
        this.status = null;
        /**
         * @type {Date} 貸出日、貸し出してない
         */
        this.date = null;
    }
}
class Book {
    /**
     * 本の初期化です。何冊あってもこのデータは一つしかない方のやつ
     * @param {Number} isbn ISBNコード
     * @param {String} title 本のタイトル
     * @param {String} actor 本の著者
     * @param {Date} date 発行年月日
     * @param {Number} code 日本十進分類法のそれ
     */
    constructor(isbn, title, actor, date, code) {
        this.isbn = isbn;
        this.title = title;
        this.actor = actor;
        this.date = date;
        this.code = code;

        /**
         * 書籍のデータを格納する配列です
         * @type {Array<BookDetail>}
         */
        this.sub = [];
    }
    /**
     * 特定の本の中からシリアル番号で検索します。
     * @param {Number} serial シリアル番号
     */
    searchSerial(serial) {
        for (var detail of this.sub)
            if (detail.serial === serial) return detail;
        return null;
    }
    /**
     * 特定の本を借りているか検索します。
     * @param {Number} id 会員番号
     * @returns {Boolean}
     */
    isLend(id){
        for(var detail of this.sub){
            if(detail.status==id)
                return true;
        }
        return false;
    }
}
class Person {
    /**
     * 利用者情報の登録でち
     * @param {String} name 利用者の名前
     * @param {String} address 利用者の住所
     * @param {Number} tel 利用者の電話番号
     * @param {String} email 利用者のメールアドレス
     */
    constructor(name, address, tel, email) {
        this.name = name;
        this.address = address;
        this.tel = tel;
        this.email = email;
        this.id = null;
    }
    /**
     * 会員番号を生成します。
     * @returns {Number}
     */
    generateID() {
        var id = Math.floor(Math.random() * 90000 + 10000);
        this.id = id;
        return id;
    }
}
class DB {
    constructor() {
        /**
         * 書籍データ群用配列
         * @type {Array<Book>}
         */
        this.books = [];
        /**
         * ユーザー用配列
         * @type {Array<Person>}
         */
        this.persons = [];
    }
    /**
     * ISBNから書籍を検索します。なければnullを返します。
     * @param {Number} isbn ISBNコード
     * @returns {Book} 書籍情報、またはnull
     */
    searchISBN(isbn) {
        for (let Book of this.books) if (Book.isbn === isbn) return Book;
        return null;
    }
    /**
     * シリアルコードが存在すればそれのBookDetailを返します。
     * @param {Number} isbn ISBNコード
     * @param {Number} serial シリアルコード
     * @returns {BookDetail} 書籍詳細情報、なければnull
     */
    searchSerial(isbn, serial) {
        /**
         * @type {Book}
         */
        var book;
        /**
         * @type {BookDetail}
         */
        var detail;
        if (book = this.searchISBN(isbn))
            if(detail = book.searchSerial(serial))
                return detail;
        return null;
    }
    /**
     * 本の貸し出しを登録します。成功失敗を返します。
     * @param {Number} serial 本のシリアルコード
     * @param {Number} id 会員番号
     * @returns {Boolean}
     */
    Rental(serial,id){
        var abook = this.searchSerial(serial);
        if(abook&&!abook.status){
            abook.status = id;
            abook.date = Date.now();
            return true;
        }
        return false;
    }
    /**
     * 本の返却を登録します。成功失敗を返します。
     * @param {Number} serial 本のシリアルコード
     * @param {Number} id 会員番号
     * @returns {Boolean}
     */
    Return(serial,id){
        var abook = this.searchSerial(serial);
        if(abook&&abook.status==id){
            abook.status = null;
            abook.date = null;
            return true;
        }
        return false;
    }
}

/**
 * querySelectorの略です。それだけです。
 * @param {string} selector そのままquerySelectorに渡します
 */
const QS = selector => document.querySelector(selector);

var db = new DB();

function userRegist() {
    /**
     * 会員登録用フォーム
     * @type {HTMLFormElement}
     */
    var form = document.forms.userRegistForm;
    var name = form.Name.value;
    var address = form.address.value;
    var tel = form.tel.value;
    var email = form.email.value;

    db.persons.push(new Person(name, address, tel, email));
    alert(`会員番号は${db.persons[db.persons.length - 1].generateID()}になります。`);
}

function bookRegist() {
    /**
     * 書籍情報登録用フォーム
     * @type {HTMLFormElement}
     */
    var form = document.forms.bookRegistForm;
    var ISBN = Number(form.ISBN.value);

    if (!db.searchISBN(ISBN)) {
        var title = form.index.value;
        var actor = form.actor.value;
        var date = new Date(form.date.value);
        var code = Number(form.code.value);

        db.books.push(new Book(ISBN, title, actor, date, code));
    } else {
        alert(
            '既に存在するISBNコードです。シリアル番号の追加は下からお願いします。'
        );
    }
}

function serialRegist() {
    /**
     * シリアル番号登録用フォーム
     * @type {HTMLFormElement}
     */
    var form = document.forms.serialRegistForm;
    var ISBN = Number(form.ISBN.value);

    if (db.searchISBN(ISBN)) {
        var serial = Number(form.serial.value);
        if (!db.searchSerial(ISBN, serial))
            db.searchISBN(ISBN).sub.push(new BookDetail(serial));
        else alert('どうやら既に存在するシリアルコードのようです。');
    } else {
        alert(
            '一致するISBNコードが無いようです、書籍データから作ってください。'
        );
    }
}

function Rental(){
    /**
     * 貸出情報登録用フォーム
     * @type {HTMLFormElement}
     */
    var form = document.forms.rental_returnForm;
    var serial = Number(form.serial.value);
    var id = Number(form.serial.iden)

    if(db.Rental(serial,id)){}
    else
        alert('本の貸し出しに失敗しました')
}
function Return(){
    /**
     * 貸出情報登録用フォーム
     * @type {HTMLFormElement}
     */
    var form = document.forms.rental_returnForm;
    var serial = Number(form.serial.value);
    var id = Number(form.serial.iden)

    if(db.Return(serial,id)){}
    else
        alert('本の返却に失敗しました')
}

function output() {
    QS('#exportArea').value = JSON.stringify(db, null, '  ');
}

/**
 * タブを変更したときの関数
 * @param {Event} e FireFoxの場合ここにイベント発行元のオブジェクトが来ます。
 */
function tabChange(e) {
    if (!e) e = event;
    /**
     * @type {Element}
     */
    var target = e.target;
    document.querySelectorAll('body form').forEach((element) => {
        if (element.name===target.className+"Form")
            element.style.display = 'table';
        else element.style.display = 'none';
    });
}

(() => {
    document.querySelectorAll('nav li').forEach(element => {
        element.addEventListener('click', tabChange);
    });
    document.querySelectorAll('form').forEach((element)=>{
        element.style.display = 'none';
    });
})();