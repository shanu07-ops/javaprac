/* CodeNest Java Lab - practical file design
   data.js + js/topics/*.js se TOPICS_DATA aur QUESTIONS_DATA aata hai */

// ================= common helpers =================

function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

// completed list localStorage me save hoti hai
// key ka format "topicId-id" (kyunki id har topic me 1 se shuru hoti hai)
function getCompleted() {
    return JSON.parse(localStorage.getItem("completed") || "[]");
}

function saveCompleted(list) {
    localStorage.setItem("completed", JSON.stringify(list));
}

function makeKey(q) {
    return q.topicId + "-" + q.id;
}

function getTopicQuestions(topicId) {
    return QUESTIONS_DATA.filter(q => q.topicId === topicId);
}

// code ko line numbers ke saath dikhata hai (textContent => safe)
function renderCode(codeEl, code, maxLines) {
    codeEl.innerHTML = "";
    let lines = code.replace(/\r/g, "").split("\n");
    if (maxLines) lines = lines.slice(0, maxLines);

    lines.forEach(function (text) {
        const span = document.createElement("span");
        span.className = "line";
        span.textContent = text;
        codeEl.appendChild(span);
    });
}

// ================= theme + nav =================

function setupTheme() {
    const btn = document.getElementById("themeBtn");

    function updateLabel() {
        btn.textContent = document.body.classList.contains("dark") ? "Light mode" : "Dark mode";
    }

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }
    updateLabel();

    btn.addEventListener("click", function () {
        document.body.classList.toggle("dark");
        const isDark = document.body.classList.contains("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        updateLabel();
    });
}

function markActiveNav(page) {
    // questions aur solution page par bhi "Topics" highlight hoga
    const name = page === "home" ? "home" : "topics";
    const link = document.querySelector('.topbar nav a[data-page="' + name + '"]');
    if (link) link.classList.add("active");
}

// ================= home page =================

function showHome() {
    document.getElementById("topicCount").textContent = TOPICS_DATA.length;
    document.getElementById("questionCount").textContent = QUESTIONS_DATA.length;

    // right side ka sample page: pehle question se
    const sample = QUESTIONS_DATA[0];
    if (sample) {
        document.getElementById("heroTitle").textContent = sample.title;
        document.getElementById("heroFile").textContent = sample.filename;
        // package wali line hata di taaki chhote preview me code poora dikhe
        renderCode(document.getElementById("heroCode"), sample.code.replace(/^package.*\r?\n+/, ""), 9);
    }
}

// ================= topics page =================

function showTopics() {
    const completed = getCompleted();
    let html = "";

    TOPICS_DATA.forEach(function (topic) {
        const list = getTopicQuestions(topic.id);
        const doneCount = list.filter(q => completed.includes(makeKey(q))).length;

        html += `
            <a class="toc-row" href="questions.html?topic=${topic.id}">
                <span class="toc-name">
                    <b>${topic.name}</b>
                    <small>${topic.description}</small>
                </span>
                <span class="leader"></span>
                <span class="toc-meta"><b>${doneCount}</b> of ${list.length} done</span>
            </a>`;
    });

    document.getElementById("topicsList").innerHTML = html;
}

// ================= questions page =================

function showQuestions() {
    const topicId = getParam("topic");
    const topic = TOPICS_DATA.find(t => t.id === topicId);

    if (topic) {
        document.getElementById("topicTitle").textContent = topic.name;
        document.getElementById("topicDesc").textContent = topic.description;
        document.getElementById("crumbTopic").textContent = topic.name;
        document.title = topic.name + " - CodeNest Java Lab";
    }

    const searchBox = document.getElementById("searchBox");
    const listDiv = document.getElementById("questionList");
    const countEl = document.getElementById("resultCount");

    // topic nahi mila to saare questions
    const baseList = topic ? getTopicQuestions(topicId) : QUESTIONS_DATA;

    function render() {
        const text = searchBox.value.toLowerCase().trim();
        const completed = getCompleted();

        const list = baseList.filter(function (q) {
            return q.title.toLowerCase().includes(text) ||
                   q.description.toLowerCase().includes(text);
        });

        countEl.textContent = text
            ? list.length + " of " + baseList.length + " questions match"
            : baseList.length + " questions";

        if (list.length === 0) {
            listDiv.innerHTML = '<p class="empty-msg">No question matches that search. Try a shorter keyword.</p>';
            return;
        }

        let html = "";
        list.forEach(function (q) {
            const done = completed.includes(makeKey(q));
            html += `
                <a class="q-row ${done ? "done" : ""}" href="solution.html?topic=${q.topicId}&id=${q.id}">
                    <span class="q-no">${q.id}</span>
                    <span class="q-title"><span class="hl">${q.title}</span></span>
                    <span class="q-file">${q.filename}</span>
                    <span class="q-state">${done ? "Done" : ""}</span>
                </a>`;
        });
        listDiv.innerHTML = html;
    }

    searchBox.addEventListener("input", render);
    render();
}

// ================= solution page =================

function showSolution() {
    const topicId = getParam("topic");
    const id = parseInt(getParam("id"), 10);
    const q = QUESTIONS_DATA.find(q => q.topicId === topicId && q.id === id);

    if (!q) {
        document.getElementById("solutionMain").innerHTML =
            '<h1>Question not found</h1>' +
            '<p style="margin: 14px 0 22px;">This link does not match any question. Go back to the topics list and pick one.</p>' +
            '<a class="btn" href="topics.html">Back to topics</a>';
        return;
    }

    // text bharo (textContent => code HTML ki tarah run nahi hoga)
    document.title = q.title + " - CodeNest Java Lab";
    document.getElementById("crumbTopic").textContent = q.topicName;
    document.getElementById("crumbTopic").href = "questions.html?topic=" + q.topicId;
    document.getElementById("crumbQuestion").textContent = "Question " + q.id;
    document.getElementById("expNo").textContent = "Question " + q.id;
    document.getElementById("fileTag").textContent = q.topicName;
    document.getElementById("qTitle").textContent = q.title;
    document.getElementById("qDesc").textContent = q.description;
    document.getElementById("codeFile").textContent = q.filename;
    document.getElementById("qExplain").textContent = q.explanation || "The program is shown above.";
    document.getElementById("backBtn").href = "questions.html?topic=" + q.topicId;
    renderCode(document.getElementById("codeBox"), q.code);

    // output screenshot (image na mile to section hide)
    const img = document.getElementById("shot");
    if (q.outputImage) {
        img.src = q.outputImage;
        img.onerror = function () {
            document.getElementById("outputBox").style.display = "none";
        };
    } else {
        document.getElementById("outputBox").style.display = "none";
    }

    // copy button
    const copyBtn = document.getElementById("copyBtn");
    copyBtn.addEventListener("click", function () {
        navigator.clipboard.writeText(q.code).then(function () {
            copyBtn.textContent = "Copied";
            setTimeout(function () { copyBtn.textContent = "Copy code"; }, 2000);
        });
    });

    // mark as done button
    const doneBtn = document.getElementById("doneBtn");
    function updateDoneBtn() {
        const isDone = getCompleted().includes(makeKey(q));
        doneBtn.textContent = isDone ? "Done. Click to undo" : "Mark as done";
        doneBtn.classList.toggle("is-done", isDone);
        doneBtn.setAttribute("aria-pressed", isDone);
    }
    doneBtn.addEventListener("click", function () {
        let list = getCompleted();
        const key = makeKey(q);
        if (list.includes(key)) {
            list = list.filter(k => k !== key);
        } else {
            list.push(key);
        }
        saveCompleted(list);
        updateDoneBtn();
    });
    updateDoneBtn();

    // previous / next (sirf isi topic ke andar)
    const sameTopic = getTopicQuestions(q.topicId);
    const index = sameTopic.findIndex(x => x.id === q.id);
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (index > 0) {
        prevBtn.href = "solution.html?topic=" + q.topicId + "&id=" + sameTopic[index - 1].id;
    } else {
        prevBtn.style.visibility = "hidden";
    }

    if (index < sameTopic.length - 1) {
        nextBtn.href = "solution.html?topic=" + q.topicId + "&id=" + sameTopic[index + 1].id;
    } else {
        nextBtn.style.visibility = "hidden";
    }
}

// ================= page start =================

document.addEventListener("DOMContentLoaded", function () {
    setupTheme();

    const page = document.body.id;   // har html ke body me id likhi hai
    markActiveNav(page);

    if (page === "home") showHome();
    if (page === "topics") showTopics();
    if (page === "questions") showQuestions();
    if (page === "solution") showSolution();
});
