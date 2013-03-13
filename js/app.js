function search() {
    var input = this.searchInput();
    if (input.length <= 2) {
        return;
    }

    this.searchData.removeAll();
    this.worker.postMessage(input);
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

function processResults(event) {
    var result = event.data;

    // Process results or progress
    if (result.type === 'results') {
        var questions = result.data;
        this.searchData.removeAll();
        ko.utils.arrayPushAll(this.searchData, questions);
        this.selectSingleQuestion(questions[0]);
    } else if (result.type === 'progress') {
        if (result.data === 'complete') {
            $('.loading').hide();
        } else {
            this.progress(result.data);
        }
    }
}

// Kind of a hack to populate twice
function populate(vm, data) {
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
}

function ViewModel(data) {
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

    // Web worker
    this.worker = new Worker('js/worker.js');
    this.worker.onmessage = processResults.bind(this);

    populate(this, data);
}

$(function () {
    var data = window.getData();
    var vm = new ViewModel(data);

    ko.applyBindings(vm);
});