const input = document.getElementById("itemInput");
const categorySelect = document.getElementById("categorySelect");
const newCategoryInput = document.getElementById("newCategoryInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("itemList");
const emptyMessage = document.getElementById("emptyMessage");

// 初期カテゴリ
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

// 旧データ対応
items = items.map(item =>
    typeof item === "string"
    ? { name: item, done: false, category: "生鮮食品" }
    : item
);

function saveAll() {
    localStorage.setItem("nestlist-items", JSON.stringify(items));
    localStorage.setItem("nestlist-categories", JSON.stringify(categories));
}

function updateCategorySelect() {
    categorySelect.innerHTML = "";

    categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
    });

    const newOption = document.createElement("option");
    newOption.value = "__new";
    newOption.textContent = "＋ 新しいカテゴリ";
    categorySelect.appendChild(newOption);
}

categorySelect.addEventListener("change", () => {
    if (categorySelect.value === "__new") {
    newCategoryInput.style.display = "block";
    } else {
    newCategoryInput.style.display = "none";
    }
});

function render() {
    list.innerHTML = "";

    if (items.length === 0) {
    emptyMessage.style.display = "block";
    return;
    }

    emptyMessage.style.display = "none";

    const grouped = {};
    items.forEach(item => {
    if (!grouped[item.category]) {
        grouped[item.category] = [];
    }
    grouped[item.category].push(item);
    });

    Object.keys(grouped).forEach(category => {
    const h3 = document.createElement("h3");
    h3.className = "category-title";
    h3.textContent = category;
    list.appendChild(h3);

    grouped[category].forEach(item => {
        const li = document.createElement("li");
        li.className = "item";
        if (item.done) li.classList.add("done");

        const span = document.createElement("span");
        span.textContent = item.name;
        span.addEventListener("click", () => {
        item.done = !item.done;
        saveAll();
        render();
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "削除";
        deleteBtn.addEventListener("click", () => {
        items = items.filter(i => i !== item);
        saveAll();
        render();
        });

        li.appendChild(span);
        li.appendChild(deleteBtn);
        list.appendChild(li);
        });
    });
}

addBtn.addEventListener("click", () => {
    const name = input.value.trim();
    const selectedCategory = categorySelect.value;

    if (!name) {
    alert("商品名を入力してください");
    return;
    }

    if (!selectedCategory) {
    alert("カテゴリを選択してください");
    return;
    }

    let category = selectedCategory;

    if (category === "__new") {
    const newCat = newCategoryInput.value.trim();
    if (!newCat) {
        alert("新しいカテゴリ名を入力してください");
        return;
    }

    if (!categories.includes(newCat)) {
        categories.push(newCat);
    }
    category = newCat;
    }

  // ★ 商品名とカテゴリを同時に確定
    items.push({
        name,
        category,
        done: false
    });

    input.value = "";
    newCategoryInput.value = "";
    newCategoryInput.style.display = "none";
    categorySelect.selectedIndex = 0;

    saveAll();
    updateCategorySelect();
    render();
});


// 初期化
updateCategorySelect();
render();
