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

// カテゴリ選択肢更新
function updateCategorySelect() {
    categorySelect.innerHTML = `
    <option value="" disabled selected>カテゴリを選択</option>
    `;

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
  // カテゴリごとに商品をまとめる
    const grouped = {};
    items.forEach(item => {
        if (!grouped[item.category]) {
            grouped[item.category] = [];
        }
        grouped[item.category].push(item);
    });

  // ★ categories の順番通りに描画
    categories.forEach(category => {
        if (!grouped[category]) return;

    // --- カテゴリ見出し ---
        const h3 = document.createElement("h3");
        h3.className = "category-title";
        h3.textContent = category;
        h3.draggable = true;
        h3.dataset.category = category;

    // ドラッグ開始
        h3.addEventListener("dragstart", () => {
        h3.classList.add("dragging");
        });

    // ドラッグ終了
        h3.addEventListener("dragend", () => {
        h3.classList.remove("dragging");
        });

    // ドロップ許可
        h3.addEventListener("dragover", e => {
        e.preventDefault();
        });

    // ドロップ処理
        h3.addEventListener("drop", e => {
        e.preventDefault();
        const dragging = document.querySelector(".dragging");
        if (!dragging || dragging === h3) return;

        const from = dragging.dataset.category;
        const to = h3.dataset.category;

        const fromIndex = categories.indexOf(from);
        const toIndex = categories.indexOf(to);

        categories.splice(
            toIndex,
            0,
            categories.splice(fromIndex, 1)[0]
        );

        saveAll();
        render();
    });

    list.appendChild(h3);

    // --- 商品 ---
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

// 追加処理（商品＋カテゴリ同時確定）
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

    items.push({ name, category, done: false });

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
