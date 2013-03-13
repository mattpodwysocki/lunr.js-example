function search() {
    var input = this.searchInput();
    if (input.length <= 2) {
        return;
    }

    this.searchData.removeAll();
    this.selectSingleQuestion();   
    var results = this.idx
        .search(input)
        .map(function (result) {
            return this.questions.filter(function (q) { return q.id === parseInt(result.ref, 10) })[0];
        }, this)
        .filter(function (result) {
            return typeof result !== 'undefined';
        });

    ko.utils.arrayPushAll(this.searchData, results);
    this.selectSingleQuestion(results[0]);    
}

function clearSearch() {
    this.searchInput('');
    this.searchData.removeAll();
    ko.utils.arrayPushAll(this.searchData, this.questions);

    this.selectSingleQuestion(this.questions[0]);
}

function selectSingleQuestion(question) {
    var tags = '', title = '', body = '';
    if (question) {
        tags = question.tags;
        title = question.title;
        body = question.body;
    }

    this.tags(tags);
    this.title(title);
    this.body(body);
}

function populate(vm, data, indexData) {
    var questions = data.questions.map(function (raw) {
        return {
            id: raw.question_id,
            title: raw.title,
            body: raw.body,
            tags: raw.tags.join(',')
        };
    });
    vm.questions = questions;
    ko.utils.arrayPushAll(vm.searchData, questions);
    vm.selectSingleQuestion(vm.questions[0]);

    // Load preprocessed index data
    vm.idx = lunr.Index.load(indexData)
}

function ViewModel(data, indexData) {
    // Search
    this.searchInput = ko.observable('');
    this.search = search.bind(this);
    this.clear = clearSearch.bind(this);
    this.selectSingleQuestion = selectSingleQuestion.bind(this);

    // Indexing
    this.progress = ko.observable(0);

    // Data
    this.title = ko.observable('');
    this.tags = ko.observable('');
    this.body = ko.observable('');
    this.searchData = ko.observableArray([]);

    populate(this, data, indexData);
}

$(function () {
    var data = window.getData(),
        indexData = window.getIndexData();

    var vm = new ViewModel(data, indexData);

    ko.applyBindings(vm);
});