/*
Written by Christian Rennemo - 2016
*/

'use strict'

/*------------------------------------*\
	#GLOBAL VARIABLES
\*------------------------------------*/
var AlleForeninger = [];
var URLNext = 'https://www.dnt.no/api/v3/iprospect_pilot/foreninger/?limit=50';
var firstTime = true;

// My const
const ul = document.querySelector('.js-list');
const ulSearch = document.querySelector('.js-resultsUl');
const nextLabel = document.querySelector('.nextBtn label');
const prevLabel = document.querySelector('.prevBtn label');
const nextBtn = document.querySelector('.nextBtn');
const prevBtn = document.querySelector('.prevBtn');
const ulAktiviteter = document.querySelector('.forening-aktiviteter');
const pageLabel = document.querySelector('.pageCounter');

var pageCounter = 1;
var offset = 0;
var limit = 10;
var objectCounter = 0;

nextBtn.addEventListener('click', nextPage);
prevBtn.addEventListener('click', prevPage);

/*------------------------------------*\
	#COLLECTDATA - Henter alle forenigner på onload
\*------------------------------------*/
function collectData(URLNext, type) {
    // Our exit
    if (URLNext === null) {
        return
    }

    fetch(URLNext)
    .then(function(response) {
        if (response.status !== 200) {
            console.log('Something went wrong. Status Code: ' +
                response.status);
            return;
        }
        // We're good to go
        response.json()
        .then(function(data) {
            URLNext = data.next;
            if (type == 'forening') {
                AlleForeninger.push(data);
                if (firstTime) {
                    populateFrontPage('first');
                }
                firstTime = false;
            } else if (type == 'aktivitet') {
                AlleAktiviteter.push(data);
            } else {
                return;
            }
            collectData(URLNext,type);

            })
    }).catch(function(err) {
        // Error :(
        console.log('Fetch Error: ', err);
    });
}

/*------------------------------------*\
	#POPULATES PAGE WITH "FORENINGER"
\*------------------------------------*/
function populateFrontPage(direction) {
    if (direction == 'prev') {
        if (offset <= 0 && objectCounter === 0) { // First page
            offset = 0;
            limit = 10;
        } else if (offset === 0) { // New Object
            limit = 40;
            offset = 50;
            objectCounter-=1;
        } else { // Normal
            var limit = offset;
            offset-=10;
            minusCounter();
        }
        for (var i = offset; i < limit; i++) {
            createContent(i)
        }
    } else { // Next page
        if (offset >= 40) { // Next Object
            objectCounter += 1;
            offset = 0;
            limit = 10;
        }
        if (direction == 'first') { // OnLoad
            offset = 0;
        } else {
            offset+=10;
            plussCounter();
        }
        var limit = offset + 10;
        for (var i = offset; i < limit; i++) {
            createContent(i)
        }
    }
}

function createContent(i) {
    var navn = AlleForeninger[objectCounter].results[i].name;
    var id = AlleForeninger[objectCounter].results[i].id;

    let li = createNode('li'),
        a = createNode('a');
    li.classList.add('list-item');
    a.classList.add('forening');
    a.id = id;
    a.innerHTML = navn;
    append(li, a);
    append(ul, li);
}

/*------------------------------------*\
	#LIST-PAGE
\*------------------------------------*/
class list {
    constructor() {
        this.list = document.querySelector('.js-list');
        this.loadList = this.loadList.bind(this);
        this.addEventListener();
    }

    addEventListener() {
        window.addEventListener('load', this.loadList);
    }

    loadList() {
        collectData(URLNext, 'forening');
        new Activities();
    }
}

new list()

/*------------------------------------*\
	#ACTIVITIES-PAGE
\*------------------------------------*/

class Activities {
    constructor() {
        this.activitiesEl = document.querySelector('.activities');
        this.backBtn = document.querySelector('.backBtn');
        this.target = null;

        this.showActivities = this.showActivities.bind(this);
        this.closeActivities = this.closeActivities.bind(this);

        this.addEventListeners();
    }

    addEventListeners() {
        document.addEventListener('click', this.showActivities);
        this.backBtn.addEventListener('click', this.closeActivities);
    }

    showActivities(evt) {
        if (!evt.target.classList.contains('forening'))
            return;
        let turlag = evt.target.innerHTML;
        let id = evt.target.id;
        let request = 'https://www.dnt.no/api/v3/iprospect_pilot/aktivitet_dates/?aktivitet__organizer=';
        let urlActivities = request + id;

        document.querySelector('.current-forening').innerHTML = turlag;
        getActivities(urlActivities);
        this.activitiesEl.classList.add('isActive');
    }

    closeActivities() {
        this.activitiesEl.classList.remove('isActive');
        clearChilderen('.forening-aktiviteter');
    }
}

/*------------------------------------*\
	#FETCH ACTIVITES
\*------------------------------------*/
function getActivities(urlActivities) {
    fetch(urlActivities, {
            method: 'get'
        })
        .then(function(response) {
            if (response.status !== 200) {
                console.log('Something went wrong. Status Code: ' +
                    response.status);
                return;
            }
            // We're good
            response.json()
                .then(function(data) {
                    populateActivitiesList(data);
                })
        }).catch(function(err) {
            // Error :(
            console.log('Fetch Error: ', err);
        });
}

/*------------------------------------*\
	#POPULATE ACTIVITES
\*------------------------------------*/
function populateActivitiesList(data) {
    let resultset = data.results;
    if (resultset.length == 0) {
        let span = createNode('span');
        span.classList.add('empty-msg');
        span.innerHTML = 'Ingen aktiviteter';
        append(ulAktiviteter, span);
    } else {
        return resultset.map(function(result) {
            console.log(result.aktivitet.title);
            let li = createNode('li'),
                a = createNode('a');
            li.classList.add('list-item');
            a.classList.add('forening-activity');
            a.id = `${result.aktivitet.id}`;
            a.innerHTML = `${result.aktivitet.title}`;
            append(li, a);
            append(ulAktiviteter, li);
        })
    }
}

/*------------------------------------*\
	#NEXT/PREV PAGE
\*------------------------------------*/
function nextPage() {
    clearChilderen('.js-list');
    populateFrontPage('next');
}

function prevPage() {
    clearChilderen('.js-list');
    populateFrontPage('prev');
}

function plussCounter() {
    pageCounter++;
    pageLabel.innerHTML = pageCounter;
}

function minusCounter() {
    pageCounter--;
    pageLabel.innerHTML = pageCounter;
}

/*------------------------------------*\
	#CLEAR LIST FUNCTION
\*------------------------------------*/
function clearChilderen(element) {
    var myNode = document.querySelector(element);
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}

/*------------------------------------*\
	#CREATE AND APPEND NODES
\*------------------------------------*/
function createNode(element) {
    return document.createElement(element);
}

function append(parent, el) {
    return parent.appendChild(el);
}

/*------------------------------------*\
	#SEARCH
\*------------------------------------*/
class searchPage {
    constructor() {
        this.searchBtn = document.querySelector('.js-searchBtn');
        this.searchPage = document.querySelector('.js-searchPage');
        this.closeSearchPage = document.querySelector('.js-closeSearchPage');
        this.inputEl = document.querySelector('.js-searchInput');

        this.showSearchPage = this.showSearchPage.bind(this);
        this.hideSearchPage = this.hideSearchPage.bind(this);
        this.liveSearch = this.liveSearch.bind(this);
        this.addResult = this.addResult.bind(this);

        this.addEventListener();
    }

    addEventListener() {
        this.searchBtn.addEventListener('click', this.showSearchPage);
        this.closeSearchPage.addEventListener('click', this.hideSearchPage);
        this.inputEl.addEventListener('keyup', this.liveSearch);
    }

    showSearchPage() {
        this.searchPage.classList.add('active');
        this.inputEl.focus();
    }

    hideSearchPage() {
        this.searchPage.classList.remove('active');
    }

    liveSearch() {
        // Check if string matches from complete json-file
        clearChilderen('.js-resultsUl');
        console.log(this.inputEl.value);
        var searchString = this.inputEl.value;
        console.log(searchString);

        var count = AlleForeninger.length;
        for (var i = 0; i < count; i++) {
            for (var y = 0; y < AlleForeninger[i].results.length; y++) {
                var turlag = AlleForeninger[i].results[y].name;
                var id = AlleForeninger[i].results[y].id;
                if (turlag.toLowerCase().indexOf(searchString.toLowerCase()) != -1) {
                        this.addResult(turlag, id);
                }
            }
        }
    }

    addResult(name, id) {
        let li = createNode('li'),
            a = createNode('a');
        li.classList.add('result-item');
        a.classList.add('forening-navn');
        a.id = id;
        a.innerHTML = name;
        append(li, a);
        append(ulSearch, li);
    }
}

new searchPage()




/*     FIRST ATEMPT, NOT IN USE!
===================================

function getAllData() {
    var url = 'https://www.dnt.no/api/v3/iprospect_pilot/foreninger/?limit=50';
    fetch(url, {
        method: 'get'
    }).then(function(response) {
        if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' +
                response.status);
            return;
        }
        response.json().then(function(data) {
            AllData = data;
            var items = Object.keys(data.results).length;

            for (var i = 0; i < items; i++) {
                var div = document.createElement('div');
                div.innerHTML = data.results[i].name;
                document.body.appendChild(div);
            }

            // Find number of pages
            var pages = data.count / 50;
            var counter = Math.round(pages);
            var offset = 0;

            // En fetch pr side
            for (var i = 0; i < counter; i++) {
                // Elendig måte å hente url på. Burde brukt 'next' fra Json-objektet
                getNextPage(url + '&offset=' + offset);
                offset += 50;
            }
            console.log(AllData);
        });
    }).catch(function(err) {
        // Error :(
        console.log('Fetch Error :-S', err);
    });

    // getData
    function getNextPage(urlNext) {
        fetch(urlNext, {
            method: 'get'
        }).then(function(response) {
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' +
                    response.status);
                return;
            }
            // We're good
            response.json().then(function(data) {
                AllData = data;
            });
            response.json().then(function(data) {
                var items = Object.keys(data.results).length;

                for (var i = 0; i < items; i++) {
                    var div = document.createElement('div');
                    div.innerHTML = data.results[i].name;
                    document.body.appendChild(div);
                }
            });
        }).catch(function(err) {
            // Error :(
            console.log('Fetch Error :-S', err);
        });
    }
}
*/
