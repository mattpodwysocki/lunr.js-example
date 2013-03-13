importScripts('example_data.js');
importScripts('lunr.js');

var idx = lunr(function () {
    this.ref('id');

    this.field('title', 10);
    this.field('tags', 100);
    this.field('body');
});

var data = getData();

var questions = data.questions.map(function (raw) {
    return {
        id: raw.question_id,
        title: raw.title,
        body: raw.body,
        tags: raw.tags.join(',')
    };
});

// Incrementally send progress, else we'd remain blocked
var i = 0, id, len = questions.length;
id = setInterval(function () {
    if (i === len) {
        self.postMessage({ type: 'progress', data: 'complete' });
    } else {
        idx.add(questions[i++]);
        self.postMessage({ type: 'progress', data: Math.round((i / len) * 100) });
    }
}, 100);

self.onmessage = function (event) {
    var query = event.data;
    var results = idx
        .search(query)
        .map(function (result) {
            return questions.filter(function (q) { return q.id === parseInt(result.ref, 10) })[0];
        })
        .filter(function (result) {
            return typeof result !== 'undefined';
        });

    self.postMessage({ type: 'results', data: results });
};

