const input = document.getElementById("itemInput");
const categorySelect = document.getElementById("categorySelect");
const newCategoryInput = document.getElementById("newCategoryInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("itemList");
const emptyMessage = document.getElementById("emptyMessage");

const tabActive = document.getElementById("tabActive");
const tabDone = document.getElementById("tabDone");

let currentTab = "active";

const defaultCategories = [
    "生鮮食品",
    "調味料・レトルト食品",
    "乳製品",
    "冷凍食品",
    "飲料"
];

let categories =
    JSON.parse(localStorage.getItem("nestlist-categories")) ||
    defaultCategories;

let items =
    JSON.parse(localStorage.getItem("nestlist-items")) || [];

/* 保存 */
function saveAll() {
    localStorage.setItem("nestlist-items", JSON.stringify(items));
    localStorage.setItem("nestlist-categories", JSON.stringify(categories));
}

/* 購入済み3日後自動削除 */
function cleanupDoneItems() {
    const now = Date.now();
    const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

    items = items.filter(item => {
        if (!item.done) return true;
        return now - item.doneAt < THREE_DAYS;
    });
}

/* カテゴリ select 更新 */
function updateCategorySelect() {
    categorySelect.innerHTML =
        `<option value="" disabled selected>カテゴリを選択</option>`;

    categories.forEach(cat => {
        const o = document.createElement("option");
        o.value = cat;
        o.textContent = cat;
        categorySelect.appendChild(o);
    });
    categorySelect.innerHTML +=
        `<option value="__new">＋ 新しいカテゴリ</option>`;
}

categorySelect.addEventListener("change", () => {
    newCategoryInput.style.display =
        categorySelect.value === "__new" ? "block" : "none";
});

/* 描画 */
function render() {
    cleanupDoneItems();
    saveAll();
    list.innerHTML = "";

    const filtered = items.filter(item =>
        currentTab === "active" ? !item.done : item.done
    );

    if (filtered.length === 0) {
        emptyMessage.style.display = "block";
        return;
    }

    emptyMessage.style.display = "none";
    const grouped = {};
    filtered.forEach(item => {
        grouped[item.category] ||= [];
        grouped[item.category].push(item);
    });

    categories.forEach(category => {
        if (!grouped[category]) return;

        const h3 = document.createElement("h3");
        h3.className = "category-title";
        h3.textContent = category;
        list.appendChild(h3);

        grouped[category].forEach(item => {
            const li = document.createElement("li");
            li.className = "item" + (item.done ? " done" : "");

            const span = document.createElement("span");
            span.textContent = item.name;

            span.onclick = () => {
                item.done = !item.done;
                item.doneAt = item.done ? Date.now() : null;
                saveAll();
                render(); // タブは切り替えない
            };
        const btn = document.createElement("button");
        btn.textContent = "削除";
        btn.onclick = () => {
            items = items.filter(i => i !== item);
            saveAll();
            render();
        };

        li.append(span, btn);
        list.appendChild(li);
    });
    });
}

/* 追加 */
addBtn.onclick = () => {
    const name = input.value.trim();
    const selected = categorySelect.value;
    if (!name || !selected) return;

    let category = selected;

    if (category === "__new") {
        const newCat = newCategoryInput.value.trim();
        if (!newCat) return;
        if (!categories.includes(newCat)) categories.push(newCat);
        category = newCat;
    }
    items.push({
        name,
        category,
        done: false,
        doneAt: null
    });
    input.value = "";
    newCategoryInput.value = "";
    categorySelect.selectedIndex = 0;

    updateCategorySelect();
    saveAll();
    render();
};

/* タブ切り替え */
function updateTabs() {
    tabActive.classList.toggle("active", currentTab === "active");
    tabDone.classList.toggle("active", currentTab === "done");
}

tabActive.onclick = () => {
    currentTab = "active";
    updateTabs();
    render();
};

tabDone.onclick = () => {
    currentTab = "done";
    updateTabs();
    render();
};

/* 初期化 */
updateCategorySelect();
updateTabs();
render();
